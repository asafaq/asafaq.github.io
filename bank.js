
async function getActiveCoins(user) {
  try {
    const response = await fetch(`http://localhost:3000/coins/active/${user}`);
    const coins = await response.json();

    const box = document.getElementById("coinCountBox");

    if (!coins.length) {
      box.innerText = "You have no active coins.";
      return;
    }

	box.innerText = `You have ${coins.length} Electrum coin${coins.length !== 1 ? 's' : ''}.`;
    // Build a simple list
    // box.innerHTML = `
      // <h3>Your Active Coins</h3>
      // <ul>
        // ${coins.map(c => `<li>Coin ID: ${c.id}</li>`).join("")}
      // </ul>
    // `;
  } catch (err) {
    console.error("Error fetching coins:", err);
    document.getElementById("coinCountBox").innerText = "Error loading coins.";
  }
}


//getActiveCoins();

async function mintCoin(user) {
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


async function spendCoins(user, amount) {
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
      body: JSON.stringify({ coinId, user })
    });
  }

  // Refresh wallet
  getActiveCoins(user);
}


async function transferCoin(fromUser, coinId, toUser) {
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

