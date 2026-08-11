// http://localhost:3000/coins/active/1
// http://localhost:3000/coins/spent/1

const ENABLE_COIN = false;

function coinGuard() {
  if (!ENABLE_COIN) {
    console.warn("Coin system is disabled.");
    return false;
  }
  return true;
}

async function getActiveCoins(user) {
  if (!coinGuard()) return [];
  try {
    const response = await fetch(`http://localhost:3000/coins/active/${user}`);
    const coins = await response.json();
    console.log("DEBUG: getActiveCoins returned:", coins);
	
    const box = document.getElementById("coinCountBox");

    if (box) {
      if (!coins.length) {
        box.innerText = "You have no active coins.";
      } else {
        box.innerText = `You have ${coins.length} Electrum coin${coins.length !== 1 ? 's' : ''}.`;
      }
    }

    return coins;   // ALWAYS return coins
  } catch (err) {
    console.error("Error fetching coins:", err);

    const box = document.getElementById("coinCountBox");
    if (box) {
      box.innerText = "Error loading coins.";
    }

    return []; // safe fallback
  }
}


//getActiveCoins();

async function mintCoin(user) {
  if (!coinGuard()) return [];
  const response = await fetch("http://localhost:3000/coins/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user })
  });

  const coin = await response.json();
  console.log("Minted coin:", coin);
}

//mintCoin();

async function mintCoins(user, amount) {
  if (!coinGuard()) return [];
  if (!amount || amount < 1) {
    alert("Please enter a valid amount.");
    return;
  }

  for (let i = 0; i < amount; i++) {
    await fetch("http://localhost:3000/coins/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user })
    });
  }

  // Refresh active coins list
  getActiveCoins(user);
}


async function spendCoins(user, amount, note) {
  if (!coinGuard()) return [];
  if (!amount || amount < 1) {
    alert("Please enter a valid amount.");
    return;
  }

  // Get active coins
  const response = await fetch(`http://localhost:3000/coins/active/${user}`);
  const coins = await response.json();

  if (coins.length < amount) {
    alert("You don't have enough coins.");
    return;
  }

  // Spend coins one by one
  for (let i = 0; i < amount; i++) {
    const coinId = coins[i].id;

    await fetch("http://localhost:3000/coins/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId, user, note })
    });
  }

  // Refresh wallet
  getActiveCoins(user);
}

async function transferCoin(fromUser, coinId, toUser) {
  if (!coinGuard()) return [];
  //const fromUser = player.id;

  const response = await fetch("http://localhost:3000/coins/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coinId,
      fromUser,
      toUser
    })
  });

  const result = await response.json();
  console.log("Transfer result:", result);
}

