const express = require('express'),
	mongoose = require('mongoose'),
	Entry = require('./models'),
	request = require('@aero/centra'),
	{ differenceInYears } = require('date-fns'),
	cron = require('cron'),
	moment = require('moment'),
	toB64 = require('image-to-base64');

const app = express(),
	config = require('dotenv').config();

if (config.error) {
	console.warn('[WARNING]: cannot parse .env file, falling back to systems ones');
}

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/git-badges', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const githubHeaders = {
	Authorization: `Basic ${Buffer.from(`${process.env.GITHUB_ID}:${process.env.GITHUB_TOKEN}`, 'utf8').toString('base64')}`,
	'User-Agent': 'pufler-dev',
	Accept: 'application/vnd.github.cloak-preview+json'
};

const periodicities = {
	daily: 'day',
	weekly: 'week',
	monthly: 'month',
	yearly: 'year',
	all: null
};

const createError = (res, error) => res.status(5e2).send({
	message: 'An error occured while processing your request, please create an issue on https://github.com/puf17640/git-badges/issues and give as much detail as you can. Thanks!',
	error
});

app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', true);

app.get('/visits/:user/:repo', async (req, res) => {
	const { user, repo } = req.params;
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json();
	if (!response.id) return createError(res, response.message);
	const flag = req.ip.startsWith(process.env.IPWHITELIST) ? 1 : 0;
	const { counter } = await Entry.findOneAndUpdate(
		{ key: `${user}/${repo}` },
		{ $inc: { counter: flag } },
		{ upsert: true, new: true }
	).exec();
	if (flag) console.log(`[${user}/${repo}] => ${counter}`);
	return res.redirect(`https://img.shields.io/badge/Visits-${counter}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/years/:user', async (req, res) => {
	const { user } = req.params;
	const response = await request(`https://api.github.com/users/${user}`)
		.header(githubHeaders).json();
	if (!response.created_at) return createError(res, response.message);
	const yearsAtGitHub = differenceInYears(Date.now(), Date.parse(response.created_at));
	return res.redirect(`https://img.shields.io/badge/Years-${yearsAtGitHub}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/repos/:user', async (req, res) => {
	const { user } = req.params;
	const response = await request(`https://api.github.com/users/${user}`)
		.header(githubHeaders).json();
	if (!response.public_repos) return createError(res, response.message);
	return res.redirect(`https://img.shields.io/badge/Repos-${response.public_repos}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/gists/:user', async (req, res) => {
	const { user } = req.params;
	const response = await request(`https://api.github.com/users/${user}/gists`)
		.header(githubHeaders).json();
	if (!Array.isArray(response) || response.length === 0) return createError(res, response.message);
	return res.redirect(`https://img.shields.io/badge/Gists-${response.length}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/updated/:user/:repo', async (req, res) => {
	const { user, repo } = req.params;
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json();
	if (!response.id) return createError(res, response.message);
	return res.redirect(`https://img.shields.io/badge/Updated-${moment(response.updated_at).fromNow()}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/created/:user/:repo', async (req, res) => {
	const { user, repo } = req.params;
	const response = await request(`https://api.github.com/repos/${user}/${repo}`)
		.header(githubHeaders).json();
	if (!response.id) return createError(res, response.message);
	return res.redirect(`https://img.shields.io/badge/Created-${moment(response.created_at).fromNow()}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/commits/:periodicity/:user', async (req, res) => {
	const { periodicity, user } = req.params;
	if (!Object.keys(periodicities).includes(periodicity)) { return res.send(`Please use one of the following periodicities: [${Object.keys(periodicities).join(', ')}]`); }
	const response = await request(
		`https://api.github.com/search/commits?q=author:${user}+author-date%3A>=${
			periodicity === 'all'
				? '1970-01-01'
				: moment().startOf(periodicities[periodicity]).format('YYYY-MM-DD')}`
	).header(githubHeaders).json();
	if (!response.total_count) return createError(res, response.message);
	return res.redirect(`https://img.shields.io/badge/${
		periodicity === 'all'
			? 'All commits'
			: periodicity === 'daily'
				? 'Commits%20today'
				: `Commits%20this%20${periodicities[periodicity]}`
	}-${response.total_count}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`)
});

app.get('/contributors/:user/:repo', async (req, res) => {
	const { user, repo } = req.params;
	let { size = 50, padding = 5, perRow = 10, bots = true } = req.query;
	[size, padding, perRow, bots] = [parseInt(size), parseInt(padding), parseInt(perRow), bots !== 'false'];
	let response = await request(`https://api.github.com/repos/${user}/${repo}/contributors`)
		.header(githubHeaders).json();
	if (!Array.isArray(response)) return createError(res, response.message);
	if (!bots) response = response.filter(contributor => contributor.type === 'User')
	return res.contentType('image/svg+xml').send(`
		<svg width="${(((response.length - 1) % perRow) * (size + padding)) + size}" height="${(Math.floor((response.length - 1) / perRow) * (size + padding)) + size}" role="img" 
			xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> 
			<defs>
				${response.map((_c, i) =>
		`<clipPath id="c-${i}">
						<circle cx="${((i % perRow) * (size + padding)) + (size / 2)}" cy="${(Math.floor(i / perRow) * (size + padding)) + (size / 2)}" r="${size / 2}" fill="#000" />
					</clipPath>`).join('')}
			</defs>
			${(await Promise.all(response.map(async (contributor, i) =>
		`<a xlink:href="${contributor.html_url}">
							<image clip-path="url(#c-${i})" width="${size}" height="${size}" x="${(i % perRow) * (size + padding)}" y="${Math.floor(i / perRow) * (size + padding)}" 
							xlink:href="data:image/png;base64,${await toB64(contributor.avatar_url)}" />
						</a>`))).join(' ')}
		</svg>`);
});

app.use((_, res) => res.redirect('https://pufler.dev/git-badges'));

app.listen(process.env.PORT, () => console.log(`[Info]: listening on port ${process.env.PORT}`));

cron.job('*/10 * * * *', async () => {
	const { resources } = await request(`https://api.github.com/rate_limit`).header(githubHeaders).json();
	console.log(`[Rate Limit]: ${resources.core.remaining} / ${resources.core.limit} (${new Date(resources.core.reset * 1e3).toLocaleString()})`);
}).start();
