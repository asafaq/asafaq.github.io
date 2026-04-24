async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const player = await storage.getPlayer(username);

    // CASE 1: Player does not exist → create new one
    if (!player) {
		console.log("CREATING NEW PLAYER:", player);
        const newPlayer = {
            id: username,
            password: password,
            level: 1,
            xp: 0
        };

        await storage.savePlayer(newPlayer);
        document.getElementById("status").textContent = "New player created!";
        startGame(newPlayer);
        return;
    }

    // CASE 2: Player exists → check password
    if (player.password !== password) {
        document.getElementById("status").textContent = "Wrong password";
        return;
    }

    // CASE 3: Login success
	console.log("LOADING PLAYER FROM DB:", player);
    document.getElementById("status").textContent = "Login successful!";
	document.getElementById("login-box").style.display = "none";
	document.getElementById("app-frame").style.display = "block";
    startGame(player);
}