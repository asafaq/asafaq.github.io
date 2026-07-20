const express = require('express');
const router = express.Router();
const ledger = require('../services/ledger');

router.post('/mint', (req, res) => {
  const { user } = req.body;
  const coin = ledger.mintCoin(user);
  res.json(coin);
});

router.post('/transfer', (req, res) => {
  const { coinId, fromUser, toUser } = req.body;

  try {
    const coin = ledger.transferCoin(coinId, fromUser, toUser);
    res.json(coin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/spend', (req, res) => {
  console.log("SPEND ROUTE BODY:", req.body);   // <--- ADD THIS
  const { coinId, user, note } = req.body;

  try {
    const coin = ledger.spendCoin(coinId, user, note);
    res.json(coin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.get('/:id', (req, res) => {
  const coin = ledger.getCoin(req.params.id);
  if (!coin) return res.status(404).json({ error: 'Not found' });
  res.json(coin);
});

router.get('/', (req, res) => {
  res.json(ledger.getAllCoins());
});

router.get('/active/:user', (req, res) => {
  res.json(ledger.getActiveCoinsByUser(req.params.user));
});

router.get('/balance/:user', (req, res) => {
  res.json({ balance: ledger.getUserBalance(req.params.user) });
});

router.get('/spent/:user', (req, res) => {
  res.json(ledger.getSpentCoinsByUser(req.params.user));
});

router.get('/all/:user', (req, res) => {
  res.json(ledger.getAllCoinsByUser(req.params.user));
});


// GET /coins/active/Asaf
/* example of a coin
[
  {
    "id": "c1b2e3d4-5678-90ab-cdef-1234567890ab",
    "createdBy": "Asaf",
    "currentOwner": "Asaf",
    "spent": false,
    "transactionHistory": [
      { "type": "MINT", "from": null, "to": "Asaf", "timestamp": 1721130000000 }
    ]
  }
]
*/


router.get('/active/:user', (req, res) => {
  const user = req.params.user;
  const coins = ledger.getActiveCoinsByUser(user);
  res.json(coins);
});


module.exports = router;
