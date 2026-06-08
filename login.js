// Toggle: true = show login screen, false = skip login entirely
const ENABLE_LOGIN = false;		//always set them up equal values
const ENABLE_PRELOAD = false;	//always set them up equal values

let preloadedAssets = null;
let preloadPromise = null;

// loading assets into user's working memory depends on having the leading / "/asset will be loaded but not "asset without leading /
const assetUrls = [
  "/assets/Contracts/parchment.jpg",

  "/assets/guild/adventurers_license_50.png",
  "/assets/guild/chest60.png",
  "/assets/guild/default.png",
  "/assets/guild/guild.png",
  "/assets/guild/guild_master.png",
  "/assets/guild/inventory.png",
  "/assets/guild/license_icon.png",
  "/assets/guild/satchel.png",
  "/assets/guild/scroll.png",
  "/assets/guild/tavern.png",

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
  "/assets/patrons/amyssa_s.png",
  "/assets/patrons/amyssa_smaller.png",
  "/assets/patrons/Claudio.png",
  "/assets/patrons/Claudio_s.png",
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
  "/assets/patrons/scroll.png",
  "/assets/patrons/Tinman.png"
];

function beginSilentPreload() {
    preloadPromise = preloadAssets(assetUrls).then(assets => {
        preloadedAssets = assets;
        console.log("Silent preload finished.");
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


function initLoginSystem() {
if (!ENABLE_LOGIN) {
    console.log("LOGIN DISABLED — Auto‑loading player 1");

    // Start background loading
    if (ENABLE_PRELOAD) beginSilentPreload();
    loadLore();

    storage.loadPlayer("1").then(async p => {
        player = p || { id: "1", name: "AutoUser" };

        document.querySelector(".login-box").style.display = "none";
        document.getElementById("app-frame").style.display = "block";

		// 🔥 Show loading screen immediately
		if (ENABLE_PRELOAD) {
			showLoadingScreen();
			updateLoadingText(0, assetUrls.length);
		}
        // Wait for preload + lore
        if (ENABLE_PRELOAD && preloadPromise) await preloadPromise;
        if (lorePromise) await lorePromise;

        // Start the game
        startGame(player, preloadedAssets, loreData);
    });

    return;
}


    // Show login UI
    document.querySelector(".login-box").style.display = "block";
    document.getElementById("app-frame").style.display = "none";

    // 🔥 Start background loading
    if (ENABLE_PRELOAD) beginSilentPreload();
    loadLore();
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

	// Wait for preload only if enabled
	if (ENABLE_PRELOAD && preloadPromise) {
		await preloadPromise;
	}

	startGame(player, preloadedAssets);

}

window.addEventListener("DOMContentLoaded", initLoginSystem);