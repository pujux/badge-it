const express = require('express'),
	mongoose = require('mongoose'),
	Entry = require('./models'),
	request = require('@aero/centra'),
	{ differenceInYears } = require('date-fns'),
	cron = require('cron'),
	moment = require('moment')

const app = express(),
	config = require('dotenv').config()

if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/gh-visitors', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const githubHeaders = {
	Authorization: `Basic ${Buffer.from(`${process.env.GITHUB_ID}:${process.env.GITHUB_TOKEN}`, 'utf8').toString('base64')}`,
	'User-Agent': 'pufler-dev'
}

const createError = (res, error) => res.status(5e2).send({ message: 'An error occured while processing your request, please create an issue on https://github.com/puf17640/git-badges/issues and give as much detail as you can. Thanks!', error });

app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)

app.get('/visits/:user/:repo', async (req, res) => {
	const { user, repo } = req.params
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json()
	if (!response.id) return res.status(404).send(response)
	const flag = req.ip.startsWith(process.env.IPWHITELIST) ? 1 : 0
	const { counter } = await Entry.findOneAndUpdate({ key: `${user}/${repo}` }, { $inc: { counter: flag } }, { upsert: true, new: true }).exec()
	if (flag) console.log(`[${user}/${repo}] => ${counter}`)
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-cache,max-age=600')
		.send(await request(`https://img.shields.io/badge/Visits-${counter}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw())
})

app.get('/years/:user', async (req, res) => {
	const { user } = req.params
	const response = await request(`https://api.github.com/users/${user}`)
		.header(githubHeaders).json()
	if (!response.created_at) return createError(response.message)
	const yearsAtGitHub = differenceInYears(Date.now(), Date.parse(response.created_at))
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-cache,max-age=600')
		.send(await request(`https://img.shields.io/badge/Years-${yearsAtGitHub}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw())
})

app.get('/repos/:user', async (req, res) => {
	const { user } = req.params
	const response = await request(`https://api.github.com/users/${user}`)
		.header(githubHeaders).json()
	if (!response.public_repos) return createError(response.message)
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-cache,max-age=600')
		.send(await request(`https://img.shields.io/badge/Repos-${response.public_repos}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw())
})

app.get('/gists/:user', async (req, res) => {
	const { user } = req.params;
	const response = await request(`https://api.github.com/users/${user}/gists`)
		.header(githubHeaders).json();
	if (!Array.isArray(response) || response.length === 0) return createError(response.message)
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-age', 'max-age=600')
		.send(await request(`https://img.shields.io/badge/Gists-${response.length}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw());
})

app.get('/updated/:user/:repo', async (req, res) => {
	const { user, repo } = req.params;
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json()
	if (!response.id) return createError(response.message)
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-age', 'max-age=600')
		.send(await request(`https://img.shields.io/badge/Updated-${moment(response.updated_at).fromNow()}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw());
})

app.get('/created/:user/:repo', async (req, res, next) => {
	const { user, repo } = req.params;
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json()
	if (!response.id) return createError(response.message)
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-age', 'max-age=600')
		.send(await request(`https://img.shields.io/badge/Created-${moment(response.created_at).fromNow()}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw());
})

app.use((_, res) => res.redirect('https://badges.pufler.dev/'))

app.listen(process.env.PORT, () => console.log(`[Info]: listening on port ${process.env.PORT}`))

cron.job('*/10 * * * *', async () => {
	const { resources } = await request(`https://api.github.com/rate_limit`)
		.header(githubHeaders).json();
	console.log(`[Rate Limit]: ${resources.core.remaining} / ${resources.core.limit} (${new Date(resources.core.reset*1e3).toLocaleString()})`)
}).start()
