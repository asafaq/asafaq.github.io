const fs = require('fs');
const path = require('path');
const Coin = require('../models/coin');

const DATA_FOLDER = path.join(__dirname, '../../data');
const DATA_PATH = path.join(DATA_FOLDER, 'coins.json');
const ARCHIVE_PATH = path.join(DATA_FOLDER, 'coins_archive.json');

// Ensure /data folder exists
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

// Ensure JSON files exist
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, '[]');
}

if (!fs.existsSync(ARCHIVE_PATH)) {
  fs.writeFileSync(ARCHIVE_PATH, '[]');
}

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
	
validateCoin(coin) {
  if (!coin) throw new Error("Coin not found");

  // Duplicate check
  const duplicates = this.coins.filter(c => c.id === coin.id);
  if (duplicates.length > 1)
    throw new Error("Duplicate coin entries detected");

  // UUID length check
  if (typeof coin.id !== "string" || coin.id.length !== 36)
    throw new Error("Invalid UUID length");

  // RFC‑4122 UUID v4 regex
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(coin.id))
    throw new Error("Invalid UUID format");

  // Structure checks
  if (typeof coin.spent !== "boolean")
    throw new Error("Invalid coin: spent flag missing");

  if (!Array.isArray(coin.transactionHistory))
    throw new Error("Invalid coin: missing transaction history");

  // 🎉 SUCCESS LOG
  console.log(`Validated coin ${coin.id}`);
  return true;
}
	
	
  constructor() {
    this.coins = loadCoins();
    this.archive = loadArchive();
  }

  mintCoin(user) {
    const coin = new Coin(user);
    this.validateCoin(coin);
    this.coins.push(coin);
    saveCoins(this.coins);
    return coin;
  }

  transferCoin(coinId, fromUser, toUser) {
    const coin = this.coins.find(c => c.id === coinId);
    if (!coin) throw new Error('Coin not found');
	this.validateCoin(coin)
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
  
  spendCoin(coinId, user, note) {
    const coin = this.coins.find(c => c.id === coinId);
    if (!coin) throw new Error('Coin not found');
	this.validateCoin(coin)
    if (coin.spent) throw new Error('Coin already spent');
    if (coin.currentOwner !== user) throw new Error('User does not own this coin');

	//passed all failsafe checks.
    // Mark spent
    coin.spent = true;

	// Remove owner
	coin.currentOwner = null;
	  
    // Log transaction
    coin.transactionHistory.push({
      type: 'SPEND',
      from: user,
      to: null,
      timestamp: Date.now(),
	  note: note || null
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
