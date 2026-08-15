// Toggle: true = show login screen, false = skip login entirely
const ENABLE_LOGIN = true;		//always set them up equal values
const ENABLE_PRELOAD = true;	//always set them up equal values
let preloadedAssets = null;
let preloadPromise = null;

// loading assets into user's working memory depends on having the leading / "/asset will be loaded but not "asset without leading /
const assetUrls = [
  "/assets/guild/adventurers_license_50.png",
  "/assets/guild/chest60.png",
  "/assets/guild/default.png",
  "/assets/guild/guild.png",
  "/assets/guild/guild_master.png",
  "/assets/guild/inventory.png",
  "/assets/guild/inventory_empty.png",
  "/assets/guild/license_icon.png",
  "/assets/guild/satchel.png",
  "/assets/guild/scroll.png",
  "/assets/guild/tavern.png",

  "/assets/inventory/apple.png",
  "/assets/inventory/fallback.png",
  "/assets/inventory/knabsack.png",
  "/assets/inventory/tankard_beer.png",

  "/assets/menu/cogwheel_L.png",
  "/assets/menu/menu3o.png",
  "/assets/menu/menu_contracts.png",
  "/assets/menu/menu_home.png",
  "/assets/menu/menu_journal.png",
  "/assets/menu/menu_lore.png",
  "/assets/menu/menu_mail.png",
  "/assets/menu/menu_missions.png",
  "/assets/menu/menu_quill.png",
  "/assets/menu/menu_store.png",
  "/assets/menu/menu_tavern.png",
  "/assets/menu/satchel.png",

  "/assets/missions/boulder.png",
  "/assets/missions/fantasy_map_s.png",
  "/assets/missions/guild_party_party_window.png",
  "/assets/missions/hogmother_letter.jpg",
  "/assets/missions/koboldog.png",
  "/assets/missions/mission_event_coins_s.png",
  "/assets/missions/mission_indicator_encounter.png",
  "/assets/missions/mission_tutur_road1.png",

  "/assets/patrons/Aasibelle_s.png",
  "/assets/patrons/Aasibelle_s2.png",
  "/assets/patrons/Claudio.png",
  "/assets/patrons/Claudio_s.png",
  "/assets/patrons/Tinman.png",
  "/assets/patrons/amyssa_s.png",
  "/assets/patrons/amyssa_l.png",
  "/assets/patrons/default.png",
  "/assets/patrons/direwolf.png",
  "/assets/patrons/direwolf_s.png",
  "/assets/patrons/dwarven_miner.png",
  "/assets/patrons/dwarven_miner_s.png",
  "/assets/patrons/halfling_L.png",
  "/assets/patrons/hogfather.png",
  "/assets/patrons/hogmother.png",
  "/assets/patrons/hogperson.png",
  "/assets/patrons/hogperson_s.png",
  "/assets/patrons/lurch.png",
  "/assets/patrons/lurch_s.png",
  "/assets/patrons/tonica_S.png",
  "/assets/patrons/tonica_L.png",
  "/assets/patrons/scroll.png"
];

function beginSilentPreload() {
    showLoadingOverlay();

    preloadPromise = preloadAssets(assetUrls, (loaded, total) => {
        updateLoadingText(loaded, total);
    }).then(assets => {
        preloadedAssets = assets;
        hideLoadingOverlay();
    });
}


// assetUrls should be an array of strings, e.g.:
// const assetUrls = ["img/card1.png", "img/card2.png", ...];

function preloadAssets(urls) {
    return new Promise(resolve => {
        if (!urls || urls.length === 0) {
            console.warn("preloadAssets: no URLs provided");
            resolve({});
            return;
        }

        const images = {};
        let loaded = 0;
        const total = urls.length;

        urls.forEach(url => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                images[url] = img;
                loaded++;
                if (loaded === total) resolve(images);
            };

            img.onerror = () => {
                console.warn("preloadAssets: failed to load", url);
                loaded++;
                if (loaded === total) resolve(images);
            };
        });
    });
}

function showLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "block";
}
function updateLoadingText(loaded, total) {
    document.getElementById("loadingText").textContent =
        `Loading assets (${loaded}/${total})`;
}
function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "none";
}


function initLoginSystem() {
    if (!ENABLE_LOGIN) {
        console.log("LOGIN DISABLED — Auto‑loading player 1");

        // Show loading UI BEFORE preload starts
        if (ENABLE_PRELOAD) {
            showLoadingOverlay();
            updateLoadingText(0, assetUrls.length);
            beginSilentPreload();
        }

        loadLore();

        storage.loadPlayer("1").then(async p => {
            player = p || { id: "1", name: "AutoUser" };

            document.querySelector(".login-box").style.display = "none";
            document.getElementById("app-frame").style.display = "block";

            // Wait for preload + lore
            if (ENABLE_PRELOAD && preloadPromise) await waitAtLeast(500, preloadPromise); // 500ms minimum

            if (lorePromise) await lorePromise;

            startGame(player, preloadedAssets, loreData);
        });

        return;
    }

    // LOGIN ENABLED
    document.querySelector(".login-box").style.display = "block";
    document.getElementById("app-frame").style.display = "none";

    // Show loading UI BEFORE preload starts
    if (ENABLE_PRELOAD) {
        showLoadingOverlay();
        updateLoadingText(0, assetUrls.length);
        beginSilentPreload();
    }

    loadLore();
}

async function waitAtLeast(ms, promise) {
    const delay = new Promise(res => setTimeout(res, ms));
    await Promise.all([delay, promise]);
}

function loadLore() {
    lorePromise = fetch("lore.json")
        .then(r => r.json())
        .then(json => {
            loreData = json;
            console.log("Lore loaded.");
        });
}

let player

let pendingNewUser = null; 
// { username, password } when waiting for password verify

async function login() {
	const usernameInput = document.getElementById("username");
	const passwordInput = document.getElementById("password");
	const passwordVerifyInput = document.getElementById("passwordVerify");
	const status = document.getElementById("status");

	const username = usernameInput.value.trim();
	const password = passwordInput.value.trim();
	const passwordVerify = passwordVerifyInput.value.trim();

	if (!username || !password) {
		status.textContent = "Enter username and password";
		return;
	}

	// 1. Fetch player from DB
	player = await storage.loadPlayer(username);

	// 2. REGISTRATION FLOW (If player does NOT exist)
	if (!player) {
		// Step A: First click -> Lock username & show verify input
		if (passwordVerifyInput.style.display === "none") {
			passwordVerifyInput.style.display = "block";
			usernameInput.readOnly = true; 
			status.textContent = "Account not found. Confirm password to register.";
			return;
		}

		// Step B: Validate verify password input
		if (!passwordVerify) {
			status.textContent = "Please verify your password.";
			return;
		}

		if (password !== passwordVerify) {
			status.textContent = "Passwords do not match!";
			return;
		}

		// Step C: Failsafe re-check to prevent overwriting
		const safetyCheck = await storage.loadPlayer(username);
		if (safetyCheck) {
			status.textContent = "Account already exists! Form reset.";
			resetLoginForm();
			return;
		}

		// Step D: Create account and await storage write
		await addNewPlayerData(username, password);
		console.log("CREATING NEW PLAYER:", username);

		// Step E: Load newly created player object into memory
		player = await storage.loadPlayer(username);
	}

	// 3. AUTHENTICATION CHECK (Runs for BOTH existing and new players)
	if (!player || !player.auth || player.auth.password !== password) {
		console.log("LOADING PLAYER:", player, "typed Wrong password.");
		status.textContent = "Wrong password";
		return;
	}

	// 4. LOGIN SUCCESS
	console.log("LOADING PLAYER FROM DB:", player);
	status.textContent = "Login successful!";
	document.querySelector(".login-box").style.display = "none";
	document.getElementById("app-frame").style.display = "block";

	// Handle preloader if active
	if (typeof ENABLE_PRELOAD !== "undefined" && ENABLE_PRELOAD && typeof preloadPromise !== "undefined" && preloadPromise) {
		await waitAtLeast(500, preloadPromise);
	}

	// 5. Start game with full player DB object
	startGame(player, typeof preloadedAssets !== "undefined" ? preloadedAssets : null);
}

function resetLoginForm() {
	const usernameInput = document.getElementById("username");
	const passwordVerifyInput = document.getElementById("passwordVerify");
	
	usernameInput.readOnly = false;
	usernameInput.value = "";
	passwordVerifyInput.style.display = "none";
	passwordVerifyInput.value = "";
}
function resetLoginForm() {
	const usernameInput = document.getElementById("username");
	const passwordVerifyInput = document.getElementById("passwordVerify");
	
	usernameInput.readOnly = false;
	passwordVerifyInput.style.display = "none";
	passwordVerifyInput.value = "";
}
function resetLoginForm() {
	const usernameInput = document.getElementById("username");
	const passwordVerifyInput = document.getElementById("passwordVerify");
	
	usernameInput.readOnly = false;
	passwordVerifyInput.style.display = "none";
	passwordVerifyInput.value = "";
}
async function addNewPlayerData(username, password) {
	// 1. Core Failsafe: Check if user exists directly at storage level
	const existingPlayer = await storage.loadPlayer(username);
	if (existingPlayer) {
		throw new Error(`CRITICAL: Attempted to overwrite existing account "${username}". Action blocked.`);
	}

	// 2. Build new player object
	const newPlayerData = {
		auth: {
			username: username,
			password: password
		},
		stats: { level: 1, gold: 0 }, // Adjust to match your player structure
		created: Date.now()
	};

	// 3. Save only after passing the existence check
	await storage.savePlayer(username, newPlayerData);
}
// Helper function to reset form if registration is aborted or completed
function resetLoginForm() {
	const usernameInput = document.getElementById("username");
	const passwordVerifyInput = document.getElementById("passwordVerify");
	
	usernameInput.readOnly = false;
	passwordVerifyInput.style.display = "none";
	passwordVerifyInput.value = "";
}
function showPasswordVerifyField() {
    document.getElementById("passwordVerify").style.display = "block";
}

window.addEventListener("DOMContentLoaded", initLoginSystem);