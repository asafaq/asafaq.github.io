const fs = require('fs');
const path = require('path');
const Coin = require('../models/coin');

const DATA_PATH = path.join(__dirname, '../../data/coins.json');
const ARCHIVE_PATH = path.join(__dirname, '../../data/coins_archive.json');

function loadCoins() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function saveCoins(coins) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(coins, null, 2));
}

function loadArchive() {
  if (!fs.existsSync(ARCHIVE_PATH)) return [];
  return JSON.parse(fs.readFileSync(ARCHIVE_PATH));
}

function saveArchive(archive) {
  fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(archive, null, 2));
}


class Ledger {
  constructor() {
    this.coins = loadCoins();
    this.archive = loadArchive();
  }

  mintCoin(user) {
    const coin = new Coin(user);
    this.coins.push(coin);
    saveCoins(this.coins);
    return coin;
  }

  transferCoin(coinId, fromUser, toUser) {
    const coin = this.coins.find(c => c.id === coinId);
    if (!coin) throw new Error('Coin not found');
    if (coin.currentOwner !== fromUser) throw new Error('Invalid owner');

    coin.currentOwner = toUser;
    coin.transactionHistory.push({
      type: 'TRANSFER',
      from: fromUser,
      to: toUser,
      timestamp: Date.now()
    });

    saveCoins(this.coins);
    return coin;
  }

  getCoin(coinId) {
    return this.coins.find(c => c.id === coinId);
  }

  getAllCoins() {
    return this.coins;
  }
  
  spendCoin(coinId, user) {
    const coin = this.coins.find(c => c.id === coinId);
    if (!coin) throw new Error('Coin not found');
    if (coin.spent) throw new Error('Coin already spent');
    if (coin.currentOwner !== user) throw new Error('User does not own this coin');

    // Mark spent
    coin.spent = true;

	// Remove owner
	coin.currentOwner = null;

    // Log transaction
    coin.transactionHistory.push({
      type: 'SPEND',
      from: user,
      to: null,
      timestamp: Date.now()
    });

    // Move to archive
    this.archive.push(coin);
    saveArchive(this.archive);

    // Remove from active coins
    this.coins = this.coins.filter(c => c.id !== coinId);
    saveCoins(this.coins);

    return coin;
  } 

  getActiveCoinsByUser(user) {
    return this.coins.filter(c => c.currentOwner === user && c.spent === false);
  }

  getUserBalance(user) {
    return this.getActiveCoinsByUser(user).length;
  }

getSpentCoinsByUser(user) {
  return this.archive.filter(c => {
    const lastTx = c.transactionHistory[c.transactionHistory.length - 1];
    return lastTx.type === 'SPEND' && lastTx.from === user;
  });
}

getAllCoinsByUser(user) {
  const active = this.getActiveCoinsByUser(user);
  const spent = this.getSpentCoinsByUser(user);
  return [...active, ...spent];
}

}

module.exports = new Ledger();


/*
command usage examples..
ledger.getActiveCoinsByUser("Asaf");
ledger.getUserBalance("Asaf");
ledger.getSpentCoinsByUser("Asaf");
ledger.getAllCoinsByUser("Asaf");


example of a spent coin, should be located in achive, and not in coins.
{
  "id": "UUID-HERE",
  "timestamp": 1721130000000,
  "createdBy": "Asaf",
  "currentOwner": null,
  "spent": true,
  "transactionHistory": [
    { "type": "MINT", "from": null, "to": "Asaf", "timestamp": 1721130000000 },
    { "type": "SPEND", "from": "Asaf", "to": null, "timestamp": 1721135000000 }
  ]
}
*/
