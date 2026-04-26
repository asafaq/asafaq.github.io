async function login() {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();
	const status = document.getElementById("status");

	if (!username || !password) {
		status.textContent = "Enter username and password";
		return;
	}

	let player = await storage.getPlayer(username);

    // CASE 1: Player does not exist → create new one
    if (!player) {
        const newPlayer = {
            id: username,
            password: password,
			tutor: 0,
        };
		addNewPlayerData(newPlayer);

		console.log("CREATING NEW PLAYER:", player);
        await storage.savePlayer(newPlayer);
        document.getElementById("status").textContent = "New player created!";
        startGame(newPlayer);
        return;
    }

    // CASE 2: Player exists → check password
    if (player.password !== password) {
		console.log("LOADING EXISTING PLAYER:", player);
        document.getElementById("status").textContent = "Wrong password";
        return;
    }

    // CASE 3: Login success
	console.log("LOADING PLAYER FROM DB:", player);
    document.getElementById("status").textContent = "Login successful!";
	document.querySelector(".login-box").style.display = "none";
	document.getElementById("app-frame").style.display = "block";
    startGame(player);
}