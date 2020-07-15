const express = require('express'),
	mongoose = require('mongoose'),
	Entry = require('./models'),
	request = require('@aero/centra')

const app = express(),
	config = require('dotenv').config()

if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/gh-visitors', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

app.use(express.urlencoded({ extended: false }))

app.get('/visitors/:user/:repo', async (req, res, next) => {
	const { user, repo } = req.params
	const { counter } = await Entry.findOneAndUpdate({ key: `${user}/${repo}` }, { $inc: { counter: 1 } }, { upsert: true, new: true }).exec()
	res.contentType('image/svg+xml')
		.header('Cache-Control', 'no-cache,max-age=0')
		.send(await request(`https://img.shields.io/badge/Visitors-${counter}-brightgreen${req.originalUrl.slice(req.originalUrl.indexOf('?'))}`).raw())
})

app.use((req, res, next) => res.redirect('https://github.com/puf17640/git-badges'))

app.use((err, req, res, next) => res.status(err.status || 5e2).send({ error: err.message }))

app.listen(process.env.PORT, () => console.log(`[INFO]: listening on port ${process.env.PORT}`))
