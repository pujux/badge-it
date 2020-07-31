const mongoose = require('mongoose')

module.exports = mongoose.model('Entry', new mongoose.Schema({
	key: String,
	counter: Number
}))
