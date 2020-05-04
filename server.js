const express = require('express'),
	path = require('path')

const app = express(),
	config = require('dotenv').config()

if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(require('morgan')(':remote-addr - :method :url :status :response-time ms - :res[content-length]'))
app.use(require('cookie-parser')())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(require('express-session')({
	secret: process.env.SESSION_SECRET || '12345',
	cookie: { maxAge: parseInt(process.env.MAX_COOKIE_AGE) || 36e5 },
	resave: false,
	saveUninitialized: true,
	httpOnly: true
}))
app.use(express.static(path.join(__dirname, '/public')))
app.use(require('helmet')())

app.get('/', (req, res) => res.render('index'))

app.use((err, req, res, next) => res.status(err.status || 5e2).send({ error: err.message }))

app.listen(process.env.PORT, () => console.log(`[INFO]: listening on port ${process.env.PORT}`))
