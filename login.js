// Toggle: true = show login screen, false = skip login entirely
const ENABLE_LOGIN = false;
function initLoginSystem() {
    if (!ENABLE_LOGIN) {
        console.log("LOGIN DISABLED — Auto‑loading player 1");

        storage.loadPlayer("1").then(p => {
            player = p || { id: "1", name: "AutoUser" };

            document.querySelector(".login-box").style.display = "none";
            document.getElementById("app-frame").style.display = "block";

            //startGame(player);
        });

        return; // legal now — inside a function
    }

    // If login is enabled, show login UI normally
    document.querySelector(".login-box").style.display = "block";
    document.getElementById("app-frame").style.display = "none";
}
let player

async function login() {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();
	const status = document.getElementById("status");

	if (!username || !password) {
		status.textContent = "Enter username and password";
		return;
	}

	player = await storage.loadPlayer(username);

    // CASE 1: Player does not exist → create new one
    if (!player) {
		addNewPlayerData(username, password);

		console.log("CREATING NEW PLAYER:", username);
        document.getElementById("status").textContent = "New player created! Login again.";
        //startGame(username);
        return;
    }

    // CASE 2: Player exists → check password
    if (player.auth.password !== password) {
		console.log("LOADING EXISTING PLAYER:", player, "typed Wrong password.");
        document.getElementById("status").textContent = "Wrong password";
        return;
    }

    // CASE 3: Login success
	console.log("LOADING PLAYER FROM DB:", player);
    document.getElementById("status").textContent = "Login successful!";
	document.querySelector(".login-box").style.display = "none";
	document.getElementById("app-frame").style.display = "block";
    //startGame(player);
}

window.addEventListener("DOMContentLoaded", initLoginSystem);