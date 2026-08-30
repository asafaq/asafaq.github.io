// Toggle: true = show login screen, false = skip login entirely
const ENABLE_LOGIN = true;		//always set them up equal values
const ENABLE_PRELOAD = true;	//always set them up equal values
let preloadedAssets = null;
let preloadPromise = null;

// loading assets into user's working memory depends on having the leading / "/asset will be loaded but not "asset without leading /
const assetUrls = [
  // battlemaps
  "/assets/battlemaps/desert.png",
  "/assets/battlemaps/desert2.png",
  "/assets/battlemaps/forest.png",
  "/assets/battlemaps/forest2.png",
  "/assets/battlemaps/forest_temple.png",
  "/assets/battlemaps/forest_temple2.png",
  "/assets/battlemaps/fortress.png",
  "/assets/battlemaps/fortress2.png",
  "/assets/battlemaps/fortress3.png",
  "/assets/battlemaps/green_1.png",
  "/assets/battlemaps/green_12.png",
  "/assets/battlemaps/round_floor.png",
  "/assets/battlemaps/sand1.png",
  "/assets/battlemaps/stone_hall.png",

  // guild
  "/assets/guild/adventurer's licence.png",
  "/assets/guild/adventurers_licence_50.png",
  "/assets/guild/adventurers_license_50.png",
  "/assets/guild/bakery.png",
  "/assets/guild/bakery_sign.png",
  "/assets/guild/chest60.png",
  "/assets/guild/contract_parchment.png",
  "/assets/guild/default.png",
  "/assets/guild/guild.png",
  "/assets/guild/guild_master.png",
  "/assets/guild/inventory_empty.png",
  "/assets/guild/licence_icon.png",
  "/assets/guild/license_icon.png",
  "/assets/guild/satchel.png",
  "/assets/guild/tavern.png",
  "/assets/guild/tavern_sign.png",

  // inventory
  "/assets/inventory/apple.png",
  "/assets/inventory/card_back.png",
  "/assets/inventory/card_back2.png",
  "/assets/inventory/card_back3.png",
  "/assets/inventory/club.png",
  "/assets/inventory/fallback.png",
  "/assets/inventory/kit.png",
  "/assets/inventory/knabsack.png",
  "/assets/inventory/magic_scroll.png",
  "/assets/inventory/pickaxe.png",
  "/assets/inventory/potion.png",
  "/assets/inventory/spellbook.png",
  "/assets/inventory/tankard_beer.png",

  // inventory/tarot
  "/assets/inventory/tarot/death.png",
  "/assets/inventory/tarot/king_of_swords.png",
  "/assets/inventory/tarot/strength.png",
  "/assets/inventory/tarot/the_devil.png",
  "/assets/inventory/tarot/the_fool.png",
  "/assets/inventory/tarot/the_hermit.png",
  "/assets/inventory/tarot/the_hierophant.png",
  "/assets/inventory/tarot/the_high_priestess.png",
  "/assets/inventory/tarot/the_magician.png",
  "/assets/inventory/tarot/the_moon.png",
  "/assets/inventory/tarot/the_star.png",
  "/assets/inventory/tarot/the_sun.png",
  "/assets/inventory/tarot/the_tower.png",
  "/assets/inventory/tarot/the_world.png",
  "/assets/inventory/tarot/wheel_of_fortune.png",

  // menu
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

  // missions
  "/assets/missions/amyssa_disguise_l.png",
  "/assets/missions/apparation.png",
  "/assets/missions/awetruce_delayeddeath.png",
  "/assets/missions/boulder.png",
  "/assets/missions/bush_token.png",
  "/assets/missions/claudio_disguise2_l.png",
  "/assets/missions/claudio_disguise_l.png",
  "/assets/missions/claudio_disguise_s.png",
  "/assets/missions/combat_green_1.png",
  "/assets/missions/dark_woods_map_s.png",
  "/assets/missions/fantasy_map_s.png",
  "/assets/missions/forest_fire.png",
  "/assets/missions/guild_party_party_window.png",
  "/assets/missions/hogmother_letter.jpg",
  "/assets/missions/koboldog.png",
  "/assets/missions/mission_event_coins_s.png",
  "/assets/missions/mission_indicator_encounter.png",
  "/assets/missions/mission_tutur_road1.png",
  "/assets/missions/monster_token.png",
  "/assets/missions/monster_token_default.png",
  "/assets/missions/stone_pedestal.png",
  "/assets/missions/stone_pedestal_wolf.png",
  "/assets/missions/stone_platform.png",
  "/assets/missions/Ugress_l.png",
  "/assets/missions/Ugress_possesed_l.png",

  // monsters
  "/assets/monsters/armored_ogre.png",
  "/assets/monsters/bear.png",
  "/assets/monsters/brigan1.png",
  "/assets/monsters/brigan2.png",
  "/assets/monsters/brigan_thug.png",
  "/assets/monsters/bug1.png",
  "/assets/monsters/bush1.png",
  "/assets/monsters/cambion.png",
  "/assets/monsters/fly1.png",
  "/assets/monsters/frog1.png",
  "/assets/monsters/goat.png",
  "/assets/monsters/goblin1.png",
  "/assets/monsters/goblin2.png",
  "/assets/monsters/goblin3.png",
  "/assets/monsters/goblin4.png",
  "/assets/monsters/goblin5.png",
  "/assets/monsters/hobgoblin1.png",
  "/assets/monsters/hobgoblin2.png",
  "/assets/monsters/hobgoblin3.png",
  "/assets/monsters/hobgoblin4.png",
  "/assets/monsters/monster_token_default.png",
  "/assets/monsters/owlbear.png",
  "/assets/monsters/skeleton1.png",
  "/assets/monsters/skeleton2.png",
  "/assets/monsters/skeleton3.png",
  "/assets/monsters/skeleton4.png",
  "/assets/monsters/skeleton5.png",
  "/assets/monsters/token_stamp.png",
  "/assets/monsters/zombie1.png",

  // patrons
  "/assets/patrons/Aasibelle_s.png",
  "/assets/patrons/Aasibelle_s2.png",
  "/assets/patrons/amyssa_l.png",
  "/assets/patrons/amyssa_s.png",
  "/assets/patrons/Balsazar_l.png",
  "/assets/patrons/Balsazar_s.png",
  "/assets/patrons/Claudio.png",
  "/assets/patrons/Claudio_s.png",
  "/assets/patrons/crusher_l.png",
  "/assets/patrons/crusher_s.png",
  "/assets/patrons/default.png",
  "/assets/patrons/desmond.png",
  "/assets/patrons/desmond_l.png",
  "/assets/patrons/desmond_s.png",
  "/assets/patrons/direwolf.png",
  "/assets/patrons/direwolf_s.png",
  "/assets/patrons/dwarven_miner.png",
  "/assets/patrons/dwarven_miner_s.png",
  "/assets/patrons/halfling_L.png",
  "/assets/patrons/halfling_s.png",
  "/assets/patrons/hogfather.png",
  "/assets/patrons/hogmother.png",
  "/assets/patrons/hogperson.png",
  "/assets/patrons/hogperson_s.png",
  "/assets/patrons/hogwarts_l.png",
  "/assets/patrons/lili_l.png",
  "/assets/patrons/lili_s.png",
  "/assets/patrons/lurch.png",
  "/assets/patrons/lurch_s.png",
  "/assets/patrons/marlnus_l.png",
  "/assets/patrons/marlnus_s.png",
  "/assets/patrons/thoran_l.png",
  "/assets/patrons/thoran_s.png",
  "/assets/patrons/Tinman.png",
  "/assets/patrons/tonica_l.png",
  "/assets/patrons/tonica_s.png",
  "/assets/patrons/trollkin_l.png",
  "/assets/patrons/trollkin_l_vanish.png",
  "/assets/patrons/trollkin_s.png",
  "/assets/patrons/wormtail_l.png",
  "/assets/patrons/wormtail_s.png"
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