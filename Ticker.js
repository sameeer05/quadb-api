mongoose = require('mongoose')

const tickerSchema = new mongoose.Schema({
    name: String,
    last: String,
    buy: String,
    sell: String,
    volume: Number,
    base_unit: String
  })

const TickerModel = mongoose.model('tickerDb', tickerSchema)

module.exports = TickerModel