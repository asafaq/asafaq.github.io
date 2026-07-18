const { v4: uuidv4 } = require('uuid');

class Coin {
  constructor(createdBy) {
    this.id = uuidv4();
    this.timestamp = Date.now();
    this.createdBy = createdBy;
    this.currentOwner = createdBy;
	this.spent = false; // NEW
    this.transactionHistory = [
      {
        type: 'MINT',
        from: null,
        to: createdBy,
        timestamp: Date.now()
      }
    ];
  }
}

module.exports = Coin;
