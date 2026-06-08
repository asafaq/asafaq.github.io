// 1. A variable that will hold your data
let loreData = null;
let lorePromise = null;

function updateLoadingText(loaded, total) {	//It updates the text on a loading screen to show how many assets have loaded out of the total
    const el = document.getElementById("loadingScreen");
    if (el) el.textContent = `Loading assets... ${loaded}/${total}`;
}

function startGame(playerObj, preloadedAssets, loreData) {
    console.log("Game starting with assets:", playerObj);

    // Assign the global player
    window.player = playerObj;

    // Re-render the current page now that player exists
    if (window.currentPage) {
        loadPage(window.currentPage);
    }
}

function showLoadingScreen() {
  const el = document.getElementById("loadingScreen");
  if (el) el.style.display = "flex";
}

// Unified initialization

// Run initialization

const noticeRules = [
    {
        condition: (player) => player.missions.tutorial === 0,
        message: "Welcome to my game. Visit the Guild to start the tutorial"
    },
    {
        condition: (player) => player.missions.green_1 === 1,
        message: "It's time for your first mission."
    }
];

function evaluateNotices() {
    for (const rule of noticeRules) {
        if (rule.condition(player)) {
            pushStatus(rule.message, 0); // persistent
            return; // show only the highest priority
        }
    }

    // If no notices apply
    pushStatus("", 0);
}

let statusQueue = [];
let statusIndex = 0;

function queueStatus(messages, interval = 4000) {
    statusQueue = messages;
    statusIndex = 0;

    function rotate() {
        if (statusQueue.length === 0) return;
        pushStatus(statusQueue[statusIndex]);
        statusIndex = (statusIndex + 1) % statusQueue.length;
        setTimeout(rotate, interval);
    }

    rotate();
}

const DEFAULT_STATUS = "Ready.";

function pushStatus(message, duration = 5000) {
    const bar = document.querySelector(".status-bar");
    const textEl = bar?.querySelector(".status-bar-text");
    if (!bar || !textEl) return;

    if (!message || message.trim() === "") {
        textEl.textContent = DEFAULT_STATUS;
        bar.classList.remove("hidden");
        return;
    }

    textEl.textContent = message;
    bar.classList.remove("hidden");

    if (duration > 0) {
        setTimeout(() => {
            textEl.textContent = DEFAULT_STATUS;
        }, duration);
    }
}


//queueStatus(["Hello", "World"]);
//queueStatus(["Fast", "Messages"], 1500);
//pushStatus("Hello, this is your new status bar!");




// This function takes your Lore list and merges it with current player data
// The "Hydration" Function: Merges Lore + Player State
function getVisiblePatrons() {
    if (!loreData.Adventurer) {
        console.warn("loreData.Adventurer is missing");
        return [];
    }

	const patronKeys = Object.keys(player.patrons);

	const allowed = ["idle", "applicant", "mission", "secret", "rival", "dead"];

	const filteredIds = patronKeys.filter(id => {
		return allowed.includes(player.patrons[id].status);
	});

    // 2. Map: Convert IDs into the detailed data objects the UI needs
    return filteredIds.map(id => {
        const lore = loreData.Adventurer[id];
        const state = player.patrons[id];

        // If lore is missing for this ID, return null so we can filter it out
        if (!lore) {
            console.warn(`No lore found for ID: ${id}`);
            return null;
        }

        // THIS IS THE RETURN THAT WAS MISSING
        return {
			id,                // ← ADD THIS
            name: lore.name,
            location: state.location !== undefined ? state.location : lore.location,
            top: lore.top,
            left: lore.left,
            icon: lore.icon
        };
    }).filter(patron => patron !== null); // Remove any null entries
}

let patronList = []; // This will hold your dynamic data

const pages = {
    guild: `
      <div id="guild-container">
        <img id="guild-image" src="/assets/guild/guild.png" />
        <div class="guild_License" style="top: 160px; left: 240px;">
          <img src="/assets/guild/license_icon.png" class="item-icon">

          <div class="hover-zone"
               data-label="Guild License"
               data-large="/assets/guild/adventurers_license_50.png">
          </div>

          <div class="tooltip"></div>
        </div>
		
		<div id="guild-stash">
			<div class="guild_stash">
				<img src="/assets/guild/chest60.png" id="stash-chest-icon" class="item-icon chest-icon">
			</div>

			<div class="stash-grid hidden"></div>
		</div>


		<div id="patron-container"></div>
		<button id="tutorial-button" class="tutorial-button" style="display: none;">
			Tutorial
		</button>
		`,
	tavern: `
      <div id="tavern-container">
        <img id="contract_parchment" src="/assets/guild/tavern.png" />
		<p style="margin: 40px; color: black;"></p>
		<div id="patron-container"></div>
		</div>
		  `,
		// this patrons will open 2 default patrons, but in the future needs to be able to read from DB which partons are inhouse to display.
    contracts: `
	  <div id="charsheet-container">
		<div id="charsheet"></div>
		<div id="portrait-bar">
			<div id="portrait-scroll"></div>
		</div>
	  </div>
		`,
    satchel_guild: `	
		<div id="satchel" class="satchel-window">
		<div class="close-btn" id="close-satchel">X</div>
			<img src="/assets/inventory/knabsack.png" id="satchel-icon" class="item-icon chest-icon">
			<div class="satchel-grid hidden"></div>
		</div>
		`,
    satchel_mission: `	
		<div id="satchel" class="satchel-window">
		<div class="close-btn" id="close-satchel">X</div>
			<img src="/assets/inventory/knabsack.png" id="satchel-icon" class="item-icon chest-icon">
			<div class="satchel-grid hidden"></div>
		</div>
		`,
    missions: `
      <div id="missions-container">
        <img id="contract_parchment" src="/assets/missions/guild_party_party_window.png" />
			<p id="missions_line1"></p>
			<p id="missions_line2"></p>
			<p id="missions_line21"></p>
			<p id="missions_line3"></p>
			<p id="missions_line6"></p>
			<p id="missions_line9"></p>

		<div id="guild-patron-inventory" class="inventory-row dropzone">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>
		<div id="guild2-patron-inventory" class="inventory-row dropzone">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-a-guide-inventory"></div>
<div id="party-a-patron-inventory" class="inventory-row dropzone">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-b-patron-inventory" class="inventory-row dropzone">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-c-patron-inventory" class="inventory-row dropzone">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>
<div id="secret-patron-inventory">
  <div class="slot"></div>
</div>
		</div>
		<!-- This is where our dynamic buttons will be injected -->
		<div id="dynamic-mission-list"></div>
		<button id="mission-start-button" class="venture-key">Start Mission</button>
		<div id="current-mission-display" class="mission-display">No mission selected.</div>

		<button id="continue-mission-A" onclick="continueMission('party_A')" style="display:none;">
			Continue Mission (<span id="continue-party-A-name"></span>)
		</button>

		<button id="continue-mission-B" onclick="continueMission('party_B')" style="display:none;">
			Continue Mission (<span id="continue-party-B-name"></span>)
		</button>


		`,
	journal: `
      <div id="journal-container">
		<div id="journal-text"></div>
		</div>
		`,
	mail: `
		<div id="mailbox-page">
			<h2>Mailbox</h2>
			<div id="mailbox-list"></div>
		</div>

		<div id="mail-dialog" class="hidden">
			<div id="mail-dialog-content">
				<h2 id="mail-title"></h2>
				<p id="mail-body"></p>
				<button id="mail-image-btn" class="hidden">View Image</button>
				<button id="mail-close-btn">Close</button>
			</div>
		</div>

	`,
	mission_green_1: `
	<div id="mission-container"
			style="position: relative;">
			<img id="fantasy_map" src="/assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position:absolute; top:0; left:0; pointer-events:none;">
			<path d="M 140 460 C 180 460, 200 300, 240 300"
				  stroke="transparent" stroke-width="75"
				  style="pointer-events: all; cursor: pointer;"
				  class="poi" fill="none"
				  data-node="green_1" />

			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 140 440 C 300 400, 120 370, 205 315" 
				   stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				   stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Homebase -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 420px; left: 110px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/menu/menu_home.png" class="item-icon">
		</div>


		<!-- Objective: Fixed Coordinates -->
		<div class="mission_green_objective shine-container" 
			 style="position: absolute; top: 300px; left: 195px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/missions/mission_event_coins_s.png" class="item-icon">
		</div>

	`,
	mission_green_2: `
	<div id="mission-container" style="position: relative;">
		<img id="fantasy_map" src="/assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 140 450 C 221 324 413 466 480 340"
              stroke="transparent" stroke-width="75" fill="none"
              style="pointer-events: stroke; cursor: pointer;"
              class="poi"
              data-node="green_2" />
			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 140 450 C 221 324 413 466 480 340" 
				  stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				  stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Homebase -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 420px; left: 110px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/menu/menu_home.png" class="item-icon">
		</div>

		<!-- Objective: Fixed Coordinates -->
		<div class="mission_green2_objective shine-container" 
			 style="position: absolute; top: 300px; left: 455px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/menu/menu_home.png" class="item-icon">
		</div>
	</div>
	`,
	mission_green_3: `
	<div id="mission-container" style="position: relative;">
		<img id="fantasy_map" src="/assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 480 340 C 480 240 300 300 340 240"
              stroke="transparent" stroke-width="75" fill="none"
              style="pointer-events: stroke; cursor: pointer;"
              class="poi"
              data-node="green_3" />
			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 480 340 C 480 240 300 300 340 240" 
				  stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				  stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Dark Forest Objective -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 220px; left: 310px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/menu/menu_home.png" class="item-icon">
		</div>

		<!-- Township DepartureObjective: Fixed Coordinates -->
		<div class="mission_green2_objective shine-container" 
			 style="position: absolute; top: 300px; left: 455px; transform: scale(0.66); transform-origin: top left;">
			<img src="/assets/menu/menu_home.png" class="item-icon">
		</div>
	</div>
	`,
mission_dwood_1: () => `
<div id="mission-container" style="position: relative;">


    <img id="fantasy_map" src="/assets/missions/dark_woods_map_s.png" />
	    <!-- POI: Platform (always visible) -->
    <div id="dwood_platform"
		 class="poi ${
			 (player?.missions?.dwood_fort1 === 1 ||
			 player?.missions?.dwood_1 === 2) ? 'mapLight' : ''}"
         data-node="dwood_platform"
         style="position:absolute; top:318px; left:400px; transform:scale(0.35); z-index:10;">
         <img src="/assets/missions/stone_pedestal.png">
    </div>
	
	
	${player?.missions?.dwood_1 > -1 && player?.missions?.dwood_1 < 2 ? `

    <!-- Path Layer -->
    <svg width="100%" height="100%" 
         style="position:absolute; top:0; left:0; z-index:1;">

        <!-- Invisible hitbox -->
        <path d="M 460 410 C 370 330 240 330 320 240"
              stroke="transparent"
              stroke-width="75"
              fill="none"
              class="poi"
              style="pointer-events: stroke; cursor: pointer;"
              data-node="dwood_path" />

        <!-- Visible dashed line -->
        <path d="M 460 410 C 370 330 240 330 320 240"
              class="marching-path"
              stroke="rgba(0, 0, 0, 0.7)"
              stroke-width="4"
              stroke-dasharray="10, 10"
              stroke-linecap="round"
              fill="none"
              style="pointer-events: none;" />

    </svg>

	` : ""}

    ${player?.missions?.dwood_1 === 2 ? `
	
	    <!-- Path Layer -->
    <svg width="100%" height="100%" 
         style="position:absolute; top:0; left:0; z-index:1;">

        <!-- Invisible hitbox -->
        <path d="M 320 240 C 220 400 300 400 130 420"
              stroke="transparent"
              stroke-width="75"
              fill="none"
              class="poi"
              style="pointer-events: stroke; cursor: pointer;"
              data-node="dwood_path" />

        <!-- Visible dashed line -->
        <path d="M 320 240 C 220 400 300 400 130 420"
              class="marching-path"
              stroke="rgba(0, 0, 0, 0.7)"
              stroke-width="4"
              stroke-dasharray="10, 10"
              stroke-linecap="round"
              fill="none"
              style="pointer-events: none;" />

    </svg>

	
	` : ""}
	
    ${player?.missions?.dwood_1 === 4 ? `
	
	    <!-- Path Layer -->
    <svg width="100%" height="100%" 
         style="position:absolute; top:0; left:0; z-index:1;">

        <!-- Invisible hitbox -->
        <path d="M 130 420 C 200 400 300 250 165 170"
              stroke="transparent"
              stroke-width="75"
              fill="none"
              class="poi"
              style="pointer-events: stroke; cursor: pointer;"
              data-node="dwood_path" />

        <!-- Visible dashed line -->
        <path d="M 130 420 C 200 400 300 250 165 170"
              class="marching-path"
              stroke="rgba(0, 0, 0, 0.7)"
              stroke-width="4"
              stroke-dasharray="10, 10"
              stroke-linecap="round"
              fill="none"
              style="pointer-events: none;" />

    </svg>

	
	` : ""}
	
    ${player?.missions?.dwood_1 === 5 && player?.missions?.dwood_fort2 < 3 ? `
	
	    <!-- Path Layer -->
    <svg width="100%" height="100%" 
         style="position:absolute; top:0; left:0; z-index:1;">

        <!-- Invisible hitbox -->
        <path d="M 165 170 C 240 120 300 170 370 85"
              stroke="transparent"
              stroke-width="75"
              fill="none"
              class="poi"
              style="pointer-events: stroke; cursor: pointer;"
              data-node="dwood_path" />

        <!-- Visible dashed line -->
        <path d="M 165 170 C 240 120 300 170 370 85"
              class="marching-path"
              stroke="rgba(0, 0, 0, 0.7)"
              stroke-width="4"
              stroke-dasharray="10, 10"
              stroke-linecap="round"
              fill="none"
              style="pointer-events: none;" />

    </svg>

	
	` : ""}
	
    ${player?.missions?.dwood_1 > 1 ? `
    <!-- POI: Glade -->
    <div id="dwood_glade"
		 class="poi ${
			 (player?.missions?.dwood_fort1 === 0 ||
			 player?.missions?.dwood_1 === 2) ? 'mapLight' : ''}"
         data-node="dwood_glade"
         style="position:absolute; top:269px; left:240px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>

	` : ""}
	
    ${player?.missions?.dwood_1 === 4 ? `
    <!-- POI: Swamp -->
    <div id="dwood_swamp"
		 class="poi ${player?.missions?.dwood_1 === 4 ? 'mapLight' : ''}"
         data-node="dwood_swamp"
         style="position:absolute; top:146px; left:147px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>

	` : ""}
	
    ${player?.missions?.dwood_1 > 1 ? `
    <!-- POI: Shrine -->
    <div id="dwood_shrine"
		 class="${poiClass(player?.missions?.dwood_1 === 3 || player?.missions?.dwood_1 === 2)}"
         data-node="dwood_shrine"
         style="position:absolute; top:417px; left:111px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>
    ` : ""}

    ${player?.missions?.dwood_1 > 3 && player?.missions?.dwood_fort2 < 2
	?`
    <!-- POI: Fort -->
    <div id="dwood_fort"
         class="poi mapLight"
         data-node="dwood_fort"
         style="position:absolute; top:170px; left:373px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>
    ` : ""}

    ${player?.missions?.dwood_fort2 > 0 && player?.missions?.dwood_fort2 < 3 ? `
    <!-- POI: Fort -->
    <div id="dwood_fort2"
         class="poi mapLight"
         data-node="dwood_fort2"
         style="position:absolute; top:64px; left:366px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>
    ` : ""}

    ${player?.missions?.dwood_fort2 === 3 ? `
    <!-- POI: Fort -->
    <div id="dwood_fort3"
         class="poi mapLight"
         data-node="dwood_fort3"
         style="position:absolute; top:124px; left:406px; transform:scale(1.5); z-index:10;">
         <img src="/assets/missions/mission_indicator_encounter.png">
    </div>
    ` : ""}

</div>
`,

	cogwheel: `
		<div>
	  <label>Guild Name:</label>
	  <input id="guildNameInput" type="text">
	</div>
	<div>
	  <label>Party A:</label>
	  <input id="partyAInput" type="text" maxlength="22">
	</div>

	<div>
	  <label>Party B:</label>
	  <input id="partyBInput" type="text" maxlength="22">
	</div>
	<div>
      <label>Text Speed:</label>
      <select id="typewriterSelect">
        <option value="false">Normal (typewriter)</option>
        <option value="true">Instant (skip)</option>
      </select>
    </div>
	<button id="saveBtn">Save Changes</button>
	<div id="saveStatus" style="margin-top: 6px; color: white; font-weight: bold;"></div>

	`

    // other pages...
  };
  
// Define this once, outside the functions

function poiClass(condition) {
    return condition ? "poi mapLight" : "nopoi";
}

const excludedStatuses = ["applicant", "retired", "dead", "rival", "away"];

function renderPatronInventory() {
    const containers = {
        1: document.getElementById("guild-patron-inventory"),
        2: document.getElementById("guild2-patron-inventory"),
        3: document.getElementById("party-a-patron-inventory"),
        4: document.getElementById("party-b-patron-inventory"),
        5: document.getElementById("party-c-patron-inventory"),
        6: document.getElementById("party-a-guide-inventory"),
        9: document.getElementById("secret-patron-inventory")
    };

// Clear containers
    Object.values(containers).forEach(container => {
        if (container) container.innerHTML = "";
    });

    patronList
        .filter(p => player.patrons[p.id])
        .forEach(p => {
            const status = player.patrons[p.id]?.status?.trim().toLowerCase();
            if (!status || excludedStatuses.includes(status)) return;

            const container = containers[p.location];
            if (!container) return;

            const isIdle = status === "idle";
            const slot = document.createElement("div");
            slot.className = "patron-slot";
            slot.draggable = isIdle;           // important
            slot.dataset.adv = p.id;
            slot.innerHTML = `
                <img src="${p.icon}" class="item-icon" draggable="false">
                <div class="hover-zone" data-label="${p.name}"></div>
                <div class="tooltip"></div>
            `;
            container.appendChild(slot);
        });

    // ←←← Re-enable drag & drop every time we render
    // enablePatronDragDrop();

}

let globalDragListenersAdded = false;

function enablePatronDragDrop() {
    // === Global listeners (only once) ===
    if (!globalDragListenersAdded) {
        globalDragListenersAdded = true;
        document.addEventListener("dragstart", handleGlobalDragStart);
        document.addEventListener("dragend", handleGlobalDragEnd);
    }

    // === Drop zones - attach to ALL current .dropzone elements ===
    document.querySelectorAll(".dropzone").forEach(zone => {
        if (zone.dataset.dragListenersAttached === "true") return;

        zone.addEventListener("dragover", (e) => {
            e.preventDefault();           // ← This is critical for drop to work
            zone.classList.add("drag-over");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("drag-over");
        });

        zone.addEventListener("drop", handlePatronDrop);

        zone.dataset.dragListenersAttached = "true";
    });
}
// Separate handlers for clarity
function handleGlobalDragStart(e) {
    const slot = e.target.closest(".patron-slot");
    if (!slot || !slot.draggable) return;

    const advId = slot.dataset.adv;
    const patron = player.patrons[advId];

    // ❌ Deny pickup from locations 6 and 9
    if (patron.location === 6 || patron.location === 9) {
        e.preventDefault();
        return;
    }

    e.dataTransfer.setData("advId", advId);
    slot.classList.add("dragging");

    // Optional: set a ghost image or effect
    // e.dataTransfer.effectAllowed = "move";
}

function handleGlobalDragEnd(e) {
    const slot = e.target.closest(".patron-slot");
    if (slot) slot.classList.remove("dragging");
}

async function handlePatronDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove("drag-over");

    const advId = e.dataTransfer.getData("advId");
    if (!advId) return;

    const patron = player.patrons[advId];
    if (!patron) return;

    const origin = patron.location;
    const newLocation = getLocationFromZone(zone);

    // Your lock logic...
    const isLocked = loc => ({
        3: player.data.party_A_locked,
        4: player.data.party_B_locked,
        5: player.data.party_C_locked
    }[loc] || false);

    if (isLocked(origin) || isLocked(newLocation)) {
        pushStatus("Cannot move patron — party is locked.");
        return;
    }

    // Update data
    patron.location = newLocation;
    await storage.savePlayer(player);

    // Move DOM node (best performance)
    const slot = document.querySelector(`.patron-slot[data-adv="${advId}"]`);
    if (slot) {
        zone.appendChild(slot);
    }

    // Only update list, avoid full re-render if possible
    patronList = getVisiblePatrons();
}
function getLocationFromZone(zone) {
    const id = zone.id;
    if (id === "guild-patron-inventory") return 1;
    if (id === "guild2-patron-inventory") return 2;
    if (id === "party-a-patron-inventory") return 3;
    if (id === "party-b-patron-inventory") return 4;
    if (id === "party-c-patron-inventory") return 5;
    if (id === "party-a-guide-inventory") return 6;
    if (id === "secret-patron-inventory") return 9;
    return 1; // fallback
}

document.addEventListener("dragstart", e => {
    console.log("dragstart fired on:", e.target.closest(".patron-slot"));
}, true);

// ====================
// TOUCH + MOUSE SUPPORT
// ====================

let selectedPatronId = null;
let isDragging = false;

// Helper functions
function selectPatron(advId) {
    const patron = player.patrons[advId];

    // ❌ Deny selecting patrons in locations 6 or 9
    if (patron.location === 6 || patron.location === 9) {
        return;
    }
    deselectPatron(); // clear previous first
    
    selectedPatronId = advId;
    const slot = document.querySelector(`.patron-slot[data-adv="${advId}"]`);
    if (slot) {
        slot.classList.add('selected');
    }
}

function deselectPatron() {
    if (selectedPatronId) {
        const slot = document.querySelector(`.patron-slot[data-adv="${selectedPatronId}"]`);
        if (slot) slot.classList.remove('selected');
    }
    selectedPatronId = null;
}

// Main enable function
function enablePatronTouchSupport() {
    
    // === Tap on Patron ===
    document.addEventListener('click', function(e) {
        if (isDragging) {
            isDragging = false;
            return;
        }

        const slot = e.target.closest('.patron-slot');
        if (!slot) {
            deselectPatron();
            return;
        }

        const advId = slot.dataset.adv;
        if (!advId) return;

        if (selectedPatronId === advId) {
            deselectPatron();
        } else {
            selectPatron(advId);
        }
    });

    // === Tap on Drop Zone ===
    document.querySelectorAll('.dropzone').forEach(zone => {
        zone.addEventListener('click', async function(e) {
            if (!selectedPatronId) return;

            const patron = player.patrons[selectedPatronId];
            if (!patron) {
                deselectPatron();
                return;
            }

            const origin = patron.location;
            const newLocation = getLocationFromZone(zone);

            if (origin === newLocation) {
                deselectPatron();
                return;
            }

            // Lock checks
            const isLocked = loc => ({
                3: player.data.party_A_locked,
                4: player.data.party_B_locked,
                5: player.data.party_C_locked
            }[loc] || false);

            if (isLocked(origin) || isLocked(newLocation)) {
                pushStatus("Cannot move patron — party is locked.");
                deselectPatron();
                return;
            }

            // Move the element
            const slot = document.querySelector(`.patron-slot[data-adv="${selectedPatronId}"]`);
            if (slot) {
                zone.appendChild(slot);
            }

            // Save
            patron.location = newLocation;
            await storage.savePlayer(player);
            patronList = getVisiblePatrons();

            deselectPatron();
        });
    });

    // Track dragging to avoid conflict with click
    document.addEventListener('dragstart', () => {
        isDragging = true;
        deselectPatron();
    });
}
// Keep your existing mouse drag & drop functions unchanged
// (handleGlobalDragStart, handleGlobalDragEnd, handlePatronDrop, etc.)

function showTemporaryImage(src) {
	// showTemporaryImage("/assets/myImage.png");

    // Create overlay container
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = 9999;

    // Create the image
    const img = document.createElement("img");
    img.src = src;
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";
    img.style.cursor = "pointer";

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Remove overlay on next click anywhere
    const removeOverlay = () => {
        overlay.remove();
        document.removeEventListener("click", removeOverlay);
    };

    // Delay binding so the initial click that triggered the function doesn't close it instantly
    setTimeout(() => {
        document.addEventListener("click", removeOverlay, { once: true });
    }, 50);
}

async function loadPage(page) {
	
  if (!player) {
    return; // or show login UI
  }
  const main = document.getElementById("mainWindow");

main.innerHTML = typeof pages[page] === "function"
    ? pages[page]() 
    : pages[page] || "<p>Unknown page</p>";

  if (page === "guild") {
  patronList = getVisiblePatrons();
  console.log(patronList);

  const container = document.getElementById("patron-container");

  container.innerHTML = patronList
    .filter(patron => patron.location === 1)
    .map(patron => {
      const large = patron.large || patron.icon || "/assets/patrons/default.png";

      return `
        <div class="patron-wrapper" 
             style="position: absolute; top: ${patron.top}; left: ${patron.left};">
          <img src="${patron.icon}" class="item-icon">
          <div class="hover-zone"
               data-id="${patron.id}"
               data-large="${large}">
          </div>
          <div class="tooltip"></div>
        </div>
      `;
    })
    .join('');

  // NEW: Render stash
  renderGuildStash();
  initStashChestClick();

  // NEW: Enable right-click assignment
  initStashRightClicks();

  initGuildTooltips();
  showTutorialButton();
  displayRightMenu();
  initPatronClicks();
}

  if (page === "tavern") {
    patronList = getVisiblePatrons();
	console.log(patronList);
	const container = document.getElementById("patron-container");

	container.innerHTML = patronList
	  .filter(patron => patron.location === 2)
	  .map(patron => {
		const large = patron.large || "/assets/patrons/default.png";

		return `
		  <div class="patron-wrapper" 
			   style="position: absolute; top: ${patron.top}; left: ${patron.left};">
			<img src="${patron.icon}" class="item-icon">
			<div class="hover-zone"
				 data-id="${patron.id}"
				 data-large="${patron.large || patron.icon || 'assets/patrons/default.png'}">
			</div>
			<div class="tooltip"></div>
		  </div>
		`;
	  })
	  .join('');

		initPatronClicks();
		displayRightMenu();
  }
 
  if (page === "contracts") {
	initContractsPage();
	}

  if (page === "missions") {
	  
	loadMissionPage();
  }


  if (page === "satchel_guild") {
	  
	"renderGuildSatchelPage()";
  }

  if (page === "journal") {
	  // 1. DATA PROCESSING: Grouping
	  const groupedData = {};
      player = await storage.loadPlayer(player.id);
	  if (player.journal && player.journal.entries) {
		  player.journal.entries.forEach(entry => {
			// Regex to match your format: [DD/MM/YYYY, HH:mm:ss]
			const match = entry.match(/\[(\d{2}\/\d{2}\/\d{4}), (\d{2}):\d{2}:\d{2}\]/);
			if (!match) return;

			const [full, date, hourStr] = match;
			const hour = parseInt(hourStr, 10);
			
			// Categorize time
			let category = "Nighttime";
			if (hour >= 5 && hour < 12) category = "Morning";
			else if (hour >= 12 && hour < 17) category = "Noon";
			else if (hour >= 17 && hour < 21) category = "Evening";

			const message = entry.split('] ')[1];

			if (!groupedData[date]) groupedData[date] = { "Morning": [], "Noon": [], "Evening": [], "Nighttime": [] };
			groupedData[date][category].push(message);
		  });
	  }
	  // 2. SORTING: Dates (Newest first)
	  const sortedDates = Object.keys(groupedData).sort((a, b) => {
		const [d1, m1, y1] = a.split('/').map(Number);
		const [d2, m2, y2] = b.split('/').map(Number);
		return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
	  });

	  // 3. RENDERING: Building HTML
	  let html = "<h1>Journal</h1>";
	  sortedDates.forEach(date => {
		html += `<div class="date-group"><h3>${date}</h3>`;
		
		// Iterate through categories to maintain custom order
		["Nighttime", "Evening", "Noon", "Morning",].forEach(cat => {
		  if (groupedData[date][cat].length > 0) {
			html += `
			  <div class="time-category">
				<h4>${cat}</h4>
				<ul>${groupedData[date][cat].map(msg => `<li>${msg}</li>`).join('')}</ul>
			  </div>`;
		  }
		});
		html += `</div>`;
	  });

	  main.innerHTML = html;
	}

  if (page === "cogwheel") {
  
		console.log(player.data.guild_name, player.data.party_A, player.data.party_B)
		document.getElementById("guildNameInput").value = player.data.guild_name;
		document.getElementById("partyAInput").value = player.data.party_A;
		document.getElementById("partyBInput").value = player.data.party_B;
		document.getElementById("typewriterSelect").value = String(player.data.skip_typewriter);


    // Make the button clickable
    document.getElementById("saveBtn").addEventListener("click", function () {

        // Update the player object
        player.data.guild_name = document.getElementById("guildNameInput").value;
        player.data.party_A = document.getElementById("partyAInput").value;
        player.data.party_B = document.getElementById("partyBInput").value;
		player.data.skip_typewriter = document.getElementById("typewriterSelect").value === "true";


        // Save to IndexedDB (if you want)
        
        storage.savePlayer(player);	//debug

        // Show the "Saved!" message
        const status = document.getElementById("saveStatus");
        status.textContent = "Saved!";

        // Optional: fade it out after 2 seconds
        setTimeout(() => status.textContent = "", 2000);
    });


  }

  if (page === "mail") {
	renderMailboxPage();
  }
  evaluateNotices()
}

function initContractsPage() {
    const visible = getVisiblePatrons();

    console.log("VISIBLE:", visible);   // ← ADD THIS HERE
    const charsheetEl = document.getElementById("charsheet");
    const scrollEl = document.getElementById("portrait-scroll");

    console.log("charsheet:", charsheetEl);
    console.log("portrait-scroll:", scrollEl);

    renderPortraitMenu(visible);

    if (visible.length > 0) {
        const firstId = visible[0].id;
        const hydrated = getHydratedAdventurer(firstId);
        renderCharSheet(hydrated);
    }
}

function renderMailboxPage() {
    const list = document.getElementById("mailbox-list");
    list.innerHTML = ""; // clear previous list

    const mailbox = player.mailbox || [];

    mailbox.forEach(mail => {
        const item = renderMailItem(mail);
        list.appendChild(item);
    });
}

function renderMailItem(mail) {
    const row = document.createElement("div");
    row.className = "mail-item";

    const header = document.createElement("div");
    header.className = "mail-header";
    header.textContent = `${mail.from} — ${mail.subject}`;
    row.appendChild(header);

    const preview = document.createElement("div");
    preview.className = "mail-preview";
    preview.textContent = mail.body.slice(0, 60) + "...";
    row.appendChild(preview);

    // View button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.onclick = () => openMailDialog(mail);
    row.appendChild(viewBtn);

    // Image button (only if exists)
    if (mail.image) {
        const imgBtn = document.createElement("button");
        imgBtn.textContent = "Image";
        imgBtn.onclick = () => showTemporaryImage(mail.image);
        row.appendChild(imgBtn);
    }

    return row;
}

function openMailDialog(mail) {
    const dialog = document.getElementById("mail-dialog");
    const title = document.getElementById("mail-title");
    const body = document.getElementById("mail-body");
    const imgBtn = document.getElementById("mail-image-btn");
    const closeBtn = document.getElementById("mail-close-btn");

    title.textContent = mail.subject;
    body.textContent = mail.body;

    // If mail has an image, show the button
    if (mail.image) {
        imgBtn.classList.remove("hidden");
        imgBtn.onclick = () => showTemporaryImage(mail.image);
    } else {
        imgBtn.classList.add("hidden");
    }

    // Close dialog
    closeBtn.onclick = () => {
        dialog.classList.add("hidden");
    };

    dialog.classList.remove("hidden");
}

function addMail(mail) {
	// correct for this system apparently
    if (!player.mailbox) player.mailbox = [];
    player.mailbox.push(mail);
    return storage.savePlayer(player);
}

const tutorialStates = [
    {
        condition: p => Number(p.tutorial) === 0,
        text: "Start Tutorial",
        mission: "tutor1_000"
    },
    {
        condition: p => p.tutorial === 1 && p.green_1 === 6,
        text: "Continue Tutorial",
        mission: "tutor2_101"
    },
    {
        condition: p => p.green_2 === 0,
        text: "Hold Guild Meeting",
        mission: "green2_001"
    }
];

function showTutorialButton() {
    const btn = document.getElementById("tutorial-button");
    if (!btn) return;

    btn.classList.add("venture-key");

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.style.display = "block";

    const state = tutorialStates.find(s => s.condition(player.missions));

    if (!state) {
        newBtn.style.display = "none";
        return;
    }

    newBtn.innerText = state.text;
    newBtn.addEventListener("click", () => {
        console.log("Starting:", state.mission);
        startMissionSystem(state.mission);
    });
}

const missionLabels = {
	green_1: "Tutorial in the Green Pastures",
	green_2: "Travelling to Townshop Tavern",
	green_3: "Entering the Dark Forest",
	dwood_1: "In the Dark Forest"
};

function buildPartySummary(partyKey) {
    const members = getPartyMembers(partyKey);

    const summary = {
        races: members.map(m => m.race),
        roles: members.map(m => m.role),
        personalTraits: members.flatMap(m => m.traits),	// NOTICE: THIS IS ONLY PERSONAL ADV TRAITS
        secretTraits: members.flatMap(m => Array.isArray(m.secretTraits) ? m.secretTraits : [])

    };

    player.missions.current_mission.summary = summary;
}

function getPartyMembers(partyKey) {
    let locationValue = 0;

    if (partyKey === "party_A") locationValue = 3;
    if (partyKey === "party_B") locationValue = 4;
    if (partyKey === "party_C") locationValue = 5;

    // KEEP the ID by using entries
    const rawMembers = Object.entries(player.patrons)
        .filter(([id, p]) => p.location === locationValue);

    // Hydrate properly
    return rawMembers.map(([id, p]) => getHydratedAdventurer(id));
}

async function startMission(partyKey) {
	
	    if (partyKey === "party_B") {
        pushStatus("party_B isn't implemented yet.");
        return;
    }
	// let missionId = player.missions.current_mission.id;

	// if (typeof missionId !== "string" || missionId.trim() === "") {
		// pushStatus("Please select a mission first.");
		// return;
	// }
	// const validation = validateParty(partyKey);


    // Otherwise → normal start mission flow
    // (your confirmation window, locking, etc.)


    // Tutorial block
    if (player.data.tutor === 0) {
        const win = document.querySelector(".tutorial-window");

        if (win) {
            win.style.display = "block";
            win.classList.add("active");

            setTutorialText("You haven't started the tutorial yet! <br><br> Go back to the Guild to begin.");

            setTutorialChoices([
                { label: "Back to Guild", action: () => { closeTutorial(); loadPage("guild"); } }
            ]);

            console.log("Mission blocked: Tutorial not complete.");
            return;
        }
    }
    // 🔴 TEMPORARY BLOCK: prevent party_B from starting missions

    const missionId = player.missions.current_mission.id;

    const party = player.missions.current_mission.party;
	


	// Prevent starting a mission that is already in progress
	if (player.missions.current_mission.active &&
		player.missions.current_mission.locked_mission === missionId) {

		pushStatus("This mission is already in progress and cannot be started again.");
		return;
	}

    if (!missionId) {
        pushStatus("Please select a mission first.");
        return;
    }

    if (!party) {
        pushStatus("Please select a party first.");
        return;
    }

    if (party === player.data.party_A && player.data.party_A_locked) {
        showMessage(`${party} is currently locked and cannot be sent.`);
        return;
    }

    if (party === player.data.party_B && player.data.party_B_locked) {
        showMessage(`${party} is currently locked and cannot be sent.`);
        return;
    }
	
	//const partyKey = player.missions.current_mission.party;
	const validation = validateParty(partyKey);
	if (validation !== true) return showMessage(validation);

    //console.log("Starting mission:", missionId, "with party:", party);
	// Determine which mission page should load
	let missionPage = null;

	if (missionId.startsWith("green_1")) missionPage = "mission_green_1";
	if (missionId.startsWith("green_2")) missionPage = "mission_green_2";
	if (missionId.startsWith("green_3")) missionPage = "mission_green_3";
	if (missionId.startsWith("dwood_1")) missionPage = "mission_dwood_1";

	// If no mission page exists → block and DO NOT lock
	if (!missionPage || !pageExists(missionPage)) {
		pushStatus("This mission is not implemented yet.");
		return;
	}

    // --- NEW: Confirmation window ---
	//const missionId = player.missions.current_mission.id;
	const missionLongName = missionLabels[missionId] || "Unknown Mission";
    const partyName = player.data[partyKey];
    //const missionLongName = missions[missionId].longName;

    showConfirm(
        `${partyName} is about to embark on "${missionLongName}".<br><br>` +
        `They cannot be modified until they return.<br><br>` +
        `Continue?`,
        async () => {
            // YES → lock party and start mission
            player.data[partyKey + "_locked"] = true;
			
			//also lock mission
			player.missions.current_mission.locked_mission = missionId; 
			// Mark party members as on mission
			Object.values(player.patrons).forEach(p => { 
				if (p.party === player.missions.current_mission.party) 
					p.status = "mission"; 
			});

			  // NEW: Save mission state
			  
			setPartyStatus(partyKey, "mission");
			player.missions.current_mission.active = true;
			player.missions.current_mission.page = missionPage;
			// 🔥 INSERT SUMMARY BUILDING HERE
			buildPartySummary(partyKey);
			buildPartyTraits(partyKey);

            await storage.savePlayer(player);
			
			hideRightMenu();
            loadPage(missionPage);
        },
        () => {
            // NO → do nothing
        }
    );
	// If mission page exists → lock party
	//player.data[partyKey + "_locked"] = true;
	// await storage.savePlayer(player);

	// Load mission
	
    // hideRightMenu();
	// loadPage(missionPage);

}

// Utility: Set status for all patrons in a given party
function setPartyStatus(partyKey, status) {
    // Map party key → location code
    const locationByParty = {
        party_A: 3,
        party_B: 4
    };

    const targetLocation = locationByParty[partyKey];
    if (targetLocation == null) {
        console.warn("Unknown partyKey in setPartyStatus:", partyKey);
        return;
    }

    Object.values(player.patrons).forEach(p => {
        if (p.location === targetLocation) {
            p.status = status;
        }
    });
}


function continueMission(partyKey) {
	
	updateContinueButton(partyKey)
    // Only continue if THIS party is the one on a mission
    if (!player.missions.current_mission.active ||
        player.missions.current_mission.party !== partyKey) {
        return;
    }

    hideRightMenu();
    loadPage(player.missions.current_mission.page);
	
}

function showConfirm(message, onYes, onNo) {
    const dialog = document.getElementById("confirm-dialog");
    const text = document.getElementById("confirm-text");
    const yesBtn = document.getElementById("confirm-yes");
    const noBtn = document.getElementById("confirm-no");

    text.innerHTML = message;

    yesBtn.onclick = () => {
        dialog.classList.add("hidden");
        onYes();
    };

    noBtn.onclick = () => {
        dialog.classList.add("hidden");
        if (onNo) onNo();
    };

    dialog.classList.remove("hidden");
}


function pageExists(pageName) {
    return !!pages[pageName]; // or whatever your page registry is called
}

function setPartyLock(isLocked) {
	
	// setPartyLock(true);  // when mission starts
	// setPartyLock(false); // when mission ends

	
    const partyKey = player.missions.current_mission.party;
    player.data[partyKey + "_locked"] = isLocked;
    return storage.savePlayer(player);
}

function runMission(missionId) {
    console.log("Running mission:", missionId);

    const startSceneId = getStartSceneId(missionId);

    console.log("Starting mission scene:", startSceneId);

    startMissionSystem(startSceneId);
}

function getStartSceneId(c_mission) {
    if (typeof c_mission !== "string") {
        console.warn("Invalid mission ID:", c_mission);
        return "green1_101"; // fallback
    }

    // Split mission ID: "green_2" → ["green", "2"]
    const [color, chapter] = c_mission.split("_");

    // Read mission progress from player data
    const progress = player.missions[c_mission];
    const stage = Number(progress) || 1;

    // Convert stage → suffix (1 → 101, 2 → 201, 3 → 301)
    const suffix = stage * 100 + 1;

    // Build final scene ID: "green2_101"
    return `${color}${chapter}_${suffix}`;


// | Mission ID | Stage | Returned Scene |
// | --- | --- | --- |
// | ``"green_1"`` | 1 | ``green1_101`` |
// | ``"green_1"`` | 2 | ``green1_201`` |
// | ``"green_2"`` | 1 | ``green2_101`` |
// | ``"green_2"`` | 3 | ``green2_301`` |
// | ``"blue_1"`` | 1 | ``blue1_101`` |
}

const missionConfig = {
    green_1: {
        label: "Tutorial in the Green Pastures",
        category: "Adventure",
        selectable: true,
        unlock: (player) => player.missions.green_1 <= 6
    },

    green_2: {
        label: "Travelling to Townshop Tavern",
        category: "Adventure",
        selectable: true,
        unlock: (player) => player.missions.green_2 <= 2
    },

    green_3: {
        label: "Entering the Dark Forest",
        category: "Adventure",
        selectable: false,
    },

    dwood_1: {
        label: "The Dark Forest",
        category: "Adventure",
        selectable: false,
    },


    dwood_fort1: {
        label: "The Dark Forest",
        category: "Adventure",
        selectable: false,
    },


    dwood_fort2: {
        label: "The Dark Forest",
        category: "Adventure",
        selectable: false,
    },

    tutorial: {
        selectable: false
    },

    current_mission: {
        selectable: false
    }
};

function getAvailableMissions(player) {
    return Object.entries(missionConfig)
        .filter(([id, cfg]) => cfg.selectable)
        .filter(([id, cfg]) => !cfg.unlock || cfg.unlock(player))
        .map(([id, cfg]) => ({
            id,
            label: cfg.label,
            category: cfg.category || "Other"
        }));
}

async function loadMissionPage() {
    console.log("Loading Mission Page");

    // Ensure mission structure exists
    if (!player.missions) player.missions = {};
    if (!player.missions.current_mission) {
        player.missions.current_mission = { id: "", party: "", active: false };
    }

    // Insert missions page HTML
    const main = document.getElementById("mainWindow");
    main.innerHTML = pages.missions;
	await new Promise(resolve => requestAnimationFrame(resolve));

    patronList = getVisiblePatrons();
    // renderPatronInventory();
    document.querySelectorAll(".patron-slot[draggable='true']").length;
	updateSecretMissionLine();
	updatePartyAGuideLine();

    // Fill static mission info
    document.getElementById("missions_line1").textContent = player.data.guild_name;
    document.getElementById("missions_line2").textContent = player.data.party_A;
    document.getElementById("missions_line21").textContent = player.data.party_A; // synergy party trait
    document.getElementById("missions_line3").textContent = player.data.party_B;
	
	const synergy = player.missions.current_mission.synergyTraits;

	if (Array.isArray(synergy) && synergy.length > 0) {
		document.getElementById("missions_line21").textContent = synergy.join(", ");
	} else {
		document.getElementById("missions_line21").textContent = "";
	}


	const hasPartyAGuide = Object.values(player.patrons)
		.some(p => p.location === 6);
	if (hasPartyAGuide) {
		document.getElementById("missions_line6").textContent = "Guide";
	} else {
		document.getElementById("missions_line6").textContent = "";
	}
	const hasSecretPatron = Object.values(player.patrons)
		.some(p => p.location === 9);
	if (hasSecretPatron) {
		document.getElementById("missions_line9").style.display = "inline-block";
		document.getElementById("missions_line9").textContent = "Secret";
	} else {
		document.getElementById("missions_line9").style.display = "none";
	}


    // Build mission dropdown
    const listContainer = document.getElementById("dynamic-mission-list");

    let missionHTML = `
        <label>Adv:</label>
        <select id="mission-select">
    `;
	
    Object.keys(player.missions).forEach(key => {
        if (key === "current_mission") return;
        if (key === "tutorial") return;
        if (key === "dwood_1") return;
        if (key === "dwood_fort1") return;
        if (key === "dwood_fort2") return;
		//here we are setting where do those missions end and exist visability.
        if (key === "green_1" && player.missions.green_1 > 1) return;
        if (key === "green_2" && player.missions.green_2 > 1) return;
        if (key === "green_3" && player.missions.green_3 > 1) return;

        const label = missionLabels[key] || key;
        const selected = (player.missions.current_mission.id === key) ? "selected" : "";

        missionHTML += `<option value="${key}" ${selected}>${label}</option>`;
    });

	if (missionHTML === `<label>Adv:</label><select id="mission-select">`) {
    missionHTML += `<option disabled>(No missions available)</option>`;
	}
    missionHTML += `</select>`;

    // Build party dropdown
    let partyHTML = `
        <label>Party:</label>
        <select id="party-select">
            <option value="party_A" ${player.data.party_A_locked ? "disabled" : ""}>
                ${player.data.party_A} ${player.data.party_A_locked ? "(Locked)" : ""}
            </option>

            <option value="party_B" ${player.data.party_B_locked ? "disabled" : ""}>
                ${player.data.party_B} ${player.data.party_B_locked ? "(Locked)" : ""}
            </option>
        </select>
    `;

    // Inject dropdowns
    listContainer.innerHTML = missionHTML + "<br><br>" + partyHTML;

	// Wait for DOM to finish updating
	await Promise.resolve();Select = document.getElementById("mission-select");
	const missionSelect = document.getElementById("mission-select");

	if (!missionSelect) {
		console.warn("mission-select not found — no missions available");
		return; // or handle gracefully
	}


    const partySelect = document.getElementById("party-select");

    // --- FIX #1: Sync mission dropdown with saved state ---
    if (typeof player.missions.current_mission.id !== "string" ||
        player.missions.current_mission.id.trim() === "") {

        player.missions.current_mission.id = missionSelect.value;
        await storage.savePlayer(player);
    } else {
        missionSelect.value = player.missions.current_mission.id;
    }

    // --- FIX #2: Sync party dropdown with saved state ---
    if (!player.missions.current_mission.party) {
        // Default to party_A if nothing saved
        player.missions.current_mission.party = "party_A";
        await storage.savePlayer(player);
    }

    // Set dropdown to match saved value
    partySelect.value = player.missions.current_mission.party;

    //updateMissionDisplay();

    // Mission dropdown listener
    missionSelect.addEventListener("change", async (e) => {
        player.missions.current_mission.id = e.target.value;
        await storage.savePlayer(player);
        updateMissionDisplay();
    });

    // Party dropdown listener
	partySelect.addEventListener("change", async (e) => {

		// Prevent changing party during an active mission
		if (player.missions.current_mission.active === true) {
			// Revert dropdown to the saved value
			partySelect.value = player.missions.current_mission.party;
			return;
		}

		// Otherwise allow change
		player.missions.current_mission.party = e.target.value;
		await storage.savePlayer(player);
		updateMissionDisplay();
	});


    // Mission start button
    const startBtn = document.getElementById("mission-start-button");
    startBtn.classList.add("venture-key");

    if (startBtn) {
        startBtn.style.display = "block";
        startBtn.addEventListener("click", () => {
            startMission(player.missions.current_mission.party);
        });
    }

    const contA = document.getElementById("continue-mission-A");
    contA.classList.add("venture-key");

    if (player.missions.current_mission.active &&
        player.missions.current_mission.party === "party_A") {

        contA.style.display = "block";
    } else {
        contA.style.display = "none";
    }

    updateContinueButton("party_A");
    updateContinueButton("party_B");
    renderPatronInventory();
    setTimeout(enablePatronDragDrop, 0);	// your mouse drag
	enablePatronTouchSupport();    // new tap support
}

function updateSecretMissionLine() {
    const hasSecretPatron = Object.values(player.patrons)
        .some(p => p.location === 9);

    const line = document.getElementById("missions_line9");

    if (hasSecretPatron) {
        line.textContent = "Secret";
    } else {
        line.textContent = "";
    }
}

function updatePartyAGuideLine() {
    const hasPartyAGuidePatron = Object.values(player.patrons)
        .some(p => p.location === 6);

    const line = document.getElementById("missions_line6");

    if (hasPartyAGuidePatron) {
        line.style.display = "inline-block";
        line.textContent = "Guide";
    } else {
        line.style.display = "none";
    }
}


function updateContinueButton(partyKey) {
    const suffix = partyKey === "party_A" ? "A" :
                   partyKey === "party_B" ? "B" : null;

    if (!suffix) return;

    const btn = document.getElementById(`continue-mission-${suffix}`);
    const nameSpan = document.getElementById(`continue-party-${suffix}-name`);

    if (!btn || !nameSpan) return;

    if (player.missions.current_mission.active &&
        player.missions.current_mission.party === partyKey) {

        btn.style.display = "block";
        nameSpan.textContent = player.data[partyKey];

    } else {
        btn.style.display = "none";
    }
}

async function updateMissionDisplay() {
	
	//player = await storage.loadPlayer(player.id);
    const missionDisplay = document.getElementById("current-mission-display");
    if (!missionDisplay) return;

    const missionLabels = {
        green_1: "Tutorial in the Green Pastures",
		green_2: "Travelling to Townshop Tavern",
		green_3: "Entering the Dark Forest",
		dwood_1: "The Dark Forest"
    };

    const id = player.missions.current_mission.id;
    const partyKey = player.missions.current_mission.party;

    const partyName =
        partyKey === "party_A" ? player.data.party_A :
        partyKey === "party_B" ? player.data.party_B :
        "None";

    /* ============================================================
       ORIGINAL MISSION DISPLAY (Legacy)
       Remove this block later if you retire missionDisplay
       ============================================================ */
    if (!id) {
        missionDisplay.textContent = "No mission selected.";
    } else {
        missionDisplay.textContent =
            `Current Mission: ${missionLabels[id] || id} (Party: ${partyName})`;
    }


    /* ============================================================
       NEW: PUSH STATUS MESSAGE (Add‑on)
       Remove this block later if you retire pushStatus
       ============================================================ */
    if (!id) {
		console.log("new push started")
        pushStatus("No mission selected.");
    } else {
		console.log("new push started")
        pushStatus(`Mission: ${missionLabels[id] || id} — Party: ${partyName}`);
    }
}

function hideRightMenu() {
  document.querySelector('.right-menu').style.display = 'none';
  document.querySelector('.right-menu-mini').style.display = 'flex';
}

function displayRightMenu() {
  document.querySelector('.right-menu').style.display = 'flex';
  document.querySelector('.right-menu-mini').style.display = 'none';
}

function closeTutorial() {
	console.log("closeTutorial() fired");

    const win = document.querySelector(".tutorial-window");
    if (win) {
		win.style.display = "none";
        win.classList.remove("active");
	}

	if (player.missions.tutorial === 0) {
		const btn = document.getElementById("tutorial-button");
		if (btn) {
			btn.style.display = "block";}
	}
}

function showMessage(text) {
    const status = document.getElementById("status");
    if (!status) return; // silently fail if missing

    status.textContent = text;

    // Fade out after 2 seconds
    setTimeout(() => {
        status.textContent = "";
    }, 2000);
}

function setTutorialChoices(choices) {
    const container = document.getElementById("tutorial-choices");
    if (!container) return;

    container.innerHTML = ""; // clear old buttons

    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.innerHTML  = choice.label;
        btn.onclick = choice.action;
        container.appendChild(btn);
    });
}
/*
1. The Data Mergers
These functions handle "Hydration"—the process of combining permanent lore with player-specific progress.

getFullPatronData(id): A basic helper that merges the static lore with player progress using the spread operator (...). It provides the most raw, combined version of an object.

getPatronView(advId): Designed specifically for the UI layer. In addition to merging data, it adds a calculated field (isContractExpired). This keeps your logic clean by calculating UI states (like whether a button should be disabled) right when you need to display the data.

getHydratedAdventurer(advId): Your "Master" function. It includes fallback safety (using the || operator). If an ID is missing, it returns safe defaults (like "Unknown") instead of crashing the game, which is crucial for preventing bugs when loading save files.

2. The State Factory
createDefaultPatronState(): This is a factory function. It defines the "schema" for a new patron. By centralizing this, you ensure that every time a player recruits someone, the character has all required fields (like status or contract_expiry) initialized properly, preventing undefined errors elsewhere.

3. The Mutator
recruitAdventurer(advId): This is an async workflow function that performs a guarded write.

It fetches the current state.

It performs a safety check (preventing accidental duplicate recruitment).

It uses the Factory (createDefaultPatronState) to initialize the new record.

It persists the change to your database (IDB).

Conceptual Summary
To visualize how these functions interact, think of your game data as two separate layers:

The Bottom Layer (Static): Constants (Name, base class, flavor text) that never change.

The Middle Layer (Dynamic): Variables (Status, expiry time, current health) that change based on gameplay.

The Top Layer (Hydrated Object): The result produced by your functions, providing a complete "current state" for your game logic to act upon.

Key takeaway: This architecture makes your game much easier to maintain. If you want to add a new property to all adventurers (like "Energy Level"), you only have to update your createDefaultPatronState() and the UI logic, rather than modifying every single existing save file.
*/

function getFullPatronData(id) {
    const staticAdvData = loreData.Adventurer[id];
    const playerAdvData = player.patrons[id];
    return { ...staticAdvData, ...playerAdvData };
}

function getPatronView(advId) {
    const lore = loreData.Adventurer[advId];
    const state = player.patrons[advId];

    if (!state) return null; // Patron not recruited yet

    // Returns a combined object ready for the UI
    return {
        ...lore,
        ...state,
        isContractExpired: Date.now() > state.contract_end
    };
}

// This is your master "hydration" function
function getHydratedAdventurer(advId) {
    const staticLore = loreData.Adventurer[advId] || { name: "Unknown", class: "Commoner" };
    const playerState = player.patrons[advId] || { status: "unrecruited" };

    // This creates a single object merging both
    return {
        id: advId,
        ...staticLore,     // Static data from lore.json
        ...playerState     // Dynamic data from save file
    };
}

function rollAdvantage(die) {
    const a = Math.ceil(Math.random() * die);
    const b = Math.ceil(Math.random() * die);
    return Math.max(a, b);
}

const Journal = {
    addEntry(text) {
        // Ensure journal exists
        if (!player.journal || !Array.isArray(player.journal.entries)) {
            player.journal = { entries: [] };
        }

        // Timestamp
        const timestamp = new Date().toLocaleString();
        const entry = `[${timestamp}] ${text}`;

        // Append to player's journal
        player.journal.entries.push(entry);
    },

    getJournalPage() {
        return {
            id: "journal",
            title: "Journal",
            content: player.journal.entries.join("\n\n"),
            scrollable: true
        };
    },

    renderJournal() {
        return {
            id: "journal",
            title: "Journal",
            content: `
                <div id="journal-container">
                    <div id="journal-text">
                        ${player.journal.entries.join("<br><br>")}
                    </div>
                </div>
            `
        };
    }
};

function renderPortraitMenu(list) {
    const container = document.getElementById("portrait-scroll");
    container.innerHTML = "";

    list.forEach(adv => {
        const img = document.createElement("img");
        img.src = adv.icon;
        img.dataset.id = adv.id;

		img.addEventListener("click", () => {
			const hydrated = getHydratedAdventurer(adv.id);
			renderCharSheet(hydrated);
		});


        container.appendChild(img);
    });
}

function renderCharSheet(adv) {
    const sheet = document.getElementById("charsheet");
    if (!sheet) {
        console.warn("charsheet not found");
        return;
    }

    const show = v => v !== null && v !== undefined && v !== "";

    // 1. Extract Lore Descriptions
    // We use optional chaining and a fallback string just in case the key is missing
    const roleDesc = loreData.Roles[adv.role]?.desc || "No role description available.";
    const raceDesc = loreData.Races[adv.race]?.desc || "No race description available.";

    sheet.innerHTML = `
    <div class="char-container">

        <div class="char-header">
            <img class="char-portrait" src="${adv.icon}">
            <div class="char-basic-info">
                <h1 class="char-name">${adv.name}</h1>

                <p><strong>Race:</strong> ${adv.race ?? "Unknown"}</p>
                <p><strong>Role:</strong> ${adv.role ?? "Unknown"} Lvl: ${adv.level ?? "?"}</p>
                <p><strong>Alignment:</strong> ${adv.alignment ?? "Neutral"}</p>
                <p><strong>Caste:</strong> ${adv.caste ?? "Omni"}</p>
            </div>
        </div>


        <div class="char-section">

            <div class="char-stats-grid">

                <div class="char-stats-block">
                    <ul class="char-stats">
                        ${show(adv.hp_modifier)        ? `<li>HP: ${adv.hp_modifier}</li>` : ""}
                        ${show(adv.strengh_mod)        ? `<li>STR: ${adv.strengh_mod}</li>` : ""}
                        ${show(adv.Dexterity_mod)        ? `<li>DEX: ${adv.Dexterity_mod}</li>` : ""}
                        ${show(adv.wisdom_mod)         ? `<li>WIS: ${adv.wisdom_mod}</li>` : ""}
                        ${show(adv.intelligence_mod)   ? `<li>INT: ${adv.intelligence_mod}</li>` : ""}
                        ${show(adv.charisma_mod)       ? `<li>CHA: ${adv.charisma_mod}</li>` : ""}
                    </ul>
                </div>

                <div class="char-stats-block">
                    <ul class="char-stats">
                        ${show(adv.AC)        ? `<li><strong>AC:</strong> ${adv.AC}</li>` : ""}
                        ${show(adv.currentHP) && show(adv.MaxHP)
                              ? `<li><strong>HP:</strong> ${adv.currentHP} / ${adv.MaxHP}</li>`
                              : ""}
                        ${show(adv.size)        ? `<li><strong>Size:</strong> ${adv.size}</li>` : ""}
                        ${show(adv.Exp)        ? `<li><strong>Exp:</strong> ${adv.Exp}</li>` : ""}

                    </ul>
                </div>

                <div class="char-stats-block">
                    <ul class="char-stats">
                        <li><strong>Proficiencies:</strong></li>

                        ${show(adv.proficiency_armor)  ? `<li><strong>Armor:</strong> ${adv.proficiency_armor}</li>` : ""}
                        ${show(adv.proficiency_weapon) ? `<li><strong>Weapon:</strong> ${adv.proficiency_weapon}</li>` : ""}
                        ${show(adv.RacialEnemy)        ? `<li><strong>Favored Enemy:</strong> ${adv.RacialEnemy}</li>` : ""}
                    </ul>
                </div>

            </div>
        </div>


        <div class="char-section">
            <div class="char-stats-grid">

                <div class="char-stats-block">
                    <h3>Traits</h3>

                    <ul class="char-traits">
                        ${(adv.traits ?? []).map(t => `<li>${t}</li>`).join("")}
                    </ul>

                    ${(() => {
                        const innate = getInnateTraits(adv);
						const roleTraits = loreData.Roles[adv.role]?.Traits || [];

						// Combine both arrays
						const allTraits = [...innate, ...roleTraits];

						if (!allTraits.length) return "";

						return `
							<h3>Innate</h3>
							<ul class="char-traits">
								${allTraits.map(t => `<li>${t}</li>`).join("")}
							</ul>
						`;
					})()}
                </div>

                <div class="char-stats-block">
                    <h3>
                        Contract - ${ { idle: "Signed", mission: "Signed" }[adv.status] || adv.status }
                    </h3>
                    
                    <div class="char-lore-info" style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                        <p><strong>${adv.role}:</strong> ${roleDesc}</p>
                        <p><strong>${adv.race}:</strong> ${raceDesc}</p>
                    </div>
                </div>

            </div>
        </div>

    </div>
`;
}

// Journal.addEntry("You discovered a hidden cave.");
// Journal.addEntry("A strange whisper echoes behind you.");

function getTimeCategory(hour) {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Noon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Nighttime";
}

function scaleApp() {
  const frame = document.querySelector('.app-wrapper');
  const targetWidth = 540;
  const targetHeight = 960;

  const scaleX = window.innerWidth / targetWidth;
  const scaleY = window.innerHeight / targetHeight;

  const scale = Math.min(scaleX, scaleY); // keep proportions

  frame.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleApp);
window.addEventListener('load', scaleApp);


function initGuildTooltips() {
  document.querySelectorAll('.guild_License, .guild_stash').forEach(unit => {
    const zone = unit.querySelector('.hover-zone');
    const tooltip = unit.querySelector('.tooltip');

    if (!zone || !tooltip) return;

    const showTooltip = () => {
      const largeSrc = zone.dataset.large || "/assets/patrons/default.png";
      tooltip.innerHTML = `<img src="${largeSrc}">`;
      tooltip.style.display = "block";
    };

    const hideTooltip = () => {
      tooltip.style.display = "none";
    };

    // Hover: show/hide tooltip
    zone.addEventListener('mouseenter', showTooltip);
    zone.addEventListener('mouseleave', hideTooltip);

    // Click: same behavior as hover (just ensure it's visible)
    zone.addEventListener('mousedown', (e) => {
      e.preventDefault(); // avoid text selection / context menu
      if (tooltip.style.display === "block") {
        hideTooltip();
      } else {
        showTooltip();
      }
    });

    // Click outside: hide tooltip
    document.addEventListener('mousedown', (e) => {
      if (!unit.contains(e.target)) {
        hideTooltip();
      }
    });
  });
}

// data-label="Guild licence"
// data-large="/assets/guild/adventurers_licence_50.png"


function openWindow(label, imageSrc) {
  const container = document.getElementById("window-container");

  container.innerHTML = `
    <div class="window">
      <div class="window-header">
        <span>${label}</span>
        <button class="close-window">X</button>
      </div>
      <div class="window-body">
        <img src="${imageSrc}">
      </div>
    </div>
  `;

  container.style.display = "block";

  container.querySelector(".close-window").addEventListener("click", () => {
    container.style.display = "none";
  });
  container.addEventListener("mousedown", (e) => {
    if (e.target === container) {
  container.style.display = "none";
  }
  });

}

document.addEventListener("click", function (e) {
    const node = e.target.closest(".poi");
    if (!node) return;

    const nodeId = node.dataset.node;
    missionController(nodeId);
});



// Re-attach listeners if new dropzones appear
const dragObserver = new MutationObserver(() => {
    enablePatronDragDrop();
});
dragObserver.observe(document.body, { childList: true, subtree: true });