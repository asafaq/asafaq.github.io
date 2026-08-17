/*
my-app/
  server.js
  package.json
  package-lock.json
  /src
    routes/
    controllers/
    middleware/
  /public
  /views
*/

// npm run dev





const http = require('http');

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// GLOBAL POST LOGGER (works in Express 5)
app.post(/.*/, (req, res, next) => {
  console.log("POST hit:", req.path);
  next();
});

app.use(cors());

app.listen(PORT, () => {
  console.log(`Currency server running on port ${PORT}`);
});

app.use(express.json());

// ⭐ ADD THIS
app.get("/status", (req, res) => {
  res.json({ online: true });
});

const coinsRoutes = require('./src/routes/coins');
app.use('/coins', coinsRoutes);




/*
my-currency-system/
  server.js
  /src
    routes/
      coins.js
    controllers/
      coinsController.js
    models/
      coin.js
    services/
      ledger.js
  /data
    coins.json   (if using file storage)
	/data/coins.json        → active coins
	/data/coins_archive.json → spent coins
*/

/*

Mint a coin
POST /coins/mint

{
  "user": "Jason"
}
Transfer a coin
POST /coins/transfer

{
  "coinId": "UUID-HERE",
  "fromUser": "Asaf",
  "toUser": "David"
}

Get coin details
GET /coins/UUID-HERE

Get all coins
GET /coins

*/