const express = require('express')
const axios = require('axios')
const mongoose = require('mongoose')
const path = require('path')
const TickerModel = require('./Ticker')
const cors = require('cors')

const app = express()
const PORT = 3004
app.use(cors())
app.use(express.static(path.join(__dirname, 'static')))

mongoose.connect('mongodb+srv://todo-list:FCdb1i40Zz0vdT5d@cluster0.txyxcdv.mongodb.net/tickerDb?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB")
    // Delete existing tickers data from the database
    return TickerModel.deleteMany({})
}).then(result => {
    console.log(`${result.deletedCount} documents deleted`);
    // Fetch top 10 results from the API and store them in the database
    return axios.get('https://api.wazirx.com/api/v2/tickers')
}).then(response => {
    // Extract the ticker data from the API response
    const locale = 'en-US'
    const tickerData = Object.entries(response.data)
      .slice(0, 10)
      .map(([key, value]) => ({
        name: value.name,
        last: parseFloat(value.last).toLocaleString(locale),
        buy: parseFloat(value.buy).toLocaleString(locale),
        sell: parseFloat(value.sell).toLocaleString(locale),
        volume: parseFloat(value.volume),
        base_unit: value.base_unit
      }));
    // Insert the ticker data into the MongoDB database
    return TickerModel.insertMany(tickerData);
}).then(result => {
    console.log(`${result.length} documents inserted`);
}).catch(error => {
    console.error(error);
});




// Define a route to get tickers data from the database
app.get('/api', async (req, res) => {
  try {
    const tickers = await TickerModel.find().limit(10);
    res.json(tickers);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});

// route to serve index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
})