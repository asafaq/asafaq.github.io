// 1. A variable that will hold your data
let loreData = null;
let lorePromise = null;

function updateLoadingText(loaded, total) {
    const el = document.getElementById("loadingScreen");
    if (el) el.textContent = `Loading assets... ${loaded}/${total}`;
}

function initializeGame() {
    console.log("Game engine ready.");
}

function startGame(assets) {
    console.log("Game starting with assets:", assets);
    // Your UI/game logic goes here
}

function showLoadingScreen() {
  const el = document.getElementById("loadingScreen");
  if (el) el.style.display = "flex";
}

initializeGame();

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

	const allowed = ["idle", "applicant", "mission", "secret"];

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
        <img id="guild-image" src="assets/guild/guild.png" />
        <div class="guild_License" style="top: 160px; left: 240px;">
          <img src="assets/guild/license_icon.png" class="item-icon">

          <div class="hover-zone"
               data-label="Guild License"
               data-large="assets/guild/adventurers_license_50.png">
          </div>

          <div class="tooltip"></div>
        </div>
		
		<div id="guild-stash">
			<div class="guild_stash">
				<img src="assets/guild/chest60.png" id="stash-chest-icon" class="item-icon chest-icon">
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
        <img id="contract_parchment" src="assets/guild/tavern.png" />
		<p style="margin: 40px; color: black;"></p>
		<div id="patron-container"></div>
		</div>
		  `,
		// this patrons will open 2 default patrons, but in the future needs to be able to read from DB which partons are inhouse to display.
    contracts: `
		<div id="charsheet"></div>

		<div id="portrait-bar">
			<div id="portrait-scroll"></div>
		</div>
		`,
    satchel_guild: `	
		<div id="satchel" class="satchel-window">
		<div class="close-btn" id="close-satchel">X</div>
			<img src="assets/inventory/knabsack.png" id="satchel-icon" class="item-icon chest-icon">
			<div class="satchel-grid hidden"></div>
		</div>
		`,
    satchel_mission: `	
		<div id="satchel" class="satchel-window">
		<div class="close-btn" id="close-satchel">X</div>
			<img src="assets/inventory/knabsack.png" id="satchel-icon" class="item-icon chest-icon">
			<div class="satchel-grid hidden"></div>
		</div>
		`,
    missions: `
      <div id="missions-container">
        <img id="contract_parchment" src="assets/missions/guild_party_party_window.png" />
			<p id="missions_line1"></p>
			<p id="missions_line2"></p>
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
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
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
			<img id="fantasy map" src="assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position:absolute; top:0; left:0; pointer-events:none;">
			<path d="M 140 460 C 180 460, 200 300, 240 300"
				  stroke="transparent" stroke-width="75"
				  style="pointer-events: all; cursor: pointer;"
				  class="poi" fill="none"
				  data-node="green_1_path" />

			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 140 440 C 300 400, 120 370, 205 315" 
				   stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				   stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Homebase -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 420px; left: 110px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/menu/menu_home.png" class="item-icon">
		</div>

		<!-- Objective: Fixed Coordinates -->
		<div class="mission_green_objective shine-container" 
			 style="position: absolute; top: 300px; left: 195px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/missions/mission_event_coins_s.png" class="item-icon">
		</div>
	</div>
	`,
	mission_green_2: `
	<div id="mission-container" style="position: relative;">
		<img id="fantasy map" src="assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 140 450 C 221 324 413 466 480 340"
              stroke="transparent" stroke-width="75" fill="none"
              style="pointer-events: stroke; cursor: pointer;"
              class="poi"
              data-node="green_2_path" />
			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 140 450 C 221 324 413 466 480 340" 
				  stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				  stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Homebase -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 420px; left: 110px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/menu/menu_home.png" class="item-icon">
		</div>

		<!-- Objective: Fixed Coordinates -->
		<div class="mission_green2_objective shine-container" 
			 style="position: absolute; top: 300px; left: 455px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/menu/menu_home.png" class="item-icon">
		</div>
	</div>
	`,
	mission_green_3: `
	<div id="mission-container" style="position: relative;">
		<img id="fantasy map" src="assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 480 340 C 480 240 300 300 340 240"
              stroke="transparent" stroke-width="75" fill="none"
              style="pointer-events: stroke; cursor: pointer;"
              class="poi"
              data-node="green_3_path" />
			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 480 340 C 480 240 300 300 340 240" 
				  stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				  stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

		<!-- Dark Forest Objective -->
		<div class="guild_homebase shine-container" 
			 style="position: absolute; top: 220px; left: 310px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/menu/menu_home.png" class="item-icon">
		</div>

		<!-- Township DepartureObjective: Fixed Coordinates -->
		<div class="mission_green2_objective shine-container" 
			 style="position: absolute; top: 300px; left: 455px; transform: scale(0.66); transform-origin: top left;">
			<img src="assets/menu/menu_home.png" class="item-icon">
		</div>
	</div>
	`,
		mission_dwood_1: `
	<div id="mission-container" style="position: relative;">
		<img id="fantasy map" src="assets/missions/dark_woods_map_s.png" />
		<!-- Dark Forest Objective -->
		
		<!-- POI: Fort -->
		<div id="dwood_fort"
			 class="poi"
			 data-node="dwood_fort"
			 style="position:absolute; top:174px; left:373px; transform:scale(1.5);">
			 <img src="assets/missions/mission_indicator_encounter.png">
		</div>

		<!-- POI: Swamp -->
		<div id="dwood_swamp"
			 class="poi"
			 data-node="dwood_swamp"
			 style="position:absolute; top:149px; left:147px; transform:scale(1.5);">
			 <img src="assets/missions/mission_indicator_encounter.png">
		</div>

		<!-- POI: Shrine -->
		<div id="dwood_shrine"
			 class="poi"
			 data-node="dwood_shrine"
			 style="position:absolute; top:421px; left:111px; transform:scale(1.5);">
			 <img src="assets/missions/mission_indicator_encounter.png">
		</div>

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 460 410 C 370 330 240 330 320 240"
              stroke="transparent" stroke-width="75" fill="none"
              style="pointer-events: stroke; cursor: pointer;"
              class="poi"
              data-node="dwood_path" />
			
			<!-- 2. The Visible Dashed Line -->
			<path class="marching-path" d="M 460 410 C 370 330 240 330 320 240"
				  stroke="rgba(0, 0, 0, 0.7)" stroke-width="4" 
				  stroke-dasharray="10, 10" stroke-linecap="round" fill="none" />
		</svg>

	</div>
	`,
	cogwheel: `
		<div>
	  <label>Guild Name:</label>
	  <input id="guildNameInput" type="text">
	</div>
	<div>
	  <label>Party A:</label>
	  <input id="partyAInput" type="text">
	</div>

	<div>
	  <label>Party B:</label>
	  <input id="partyBInput" type="text">
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
  
function renderPatronInventory() {
	
// 1. Define your patron data in an array. 
// You can easily add up to 12 objects here.
// 1. Single source of truth with the 'location' key
//	0 is Hidden
//	1	guild
//	2	tavern
//	3	party_A
//	***	party_A_Companion (This is for the carriage handler)
//	4	party_B
//	5	party_C
//	6	party_A_Guide
//	4	party_B
//	4	party_B
//	9	Secret
	
  const guildContainer = document.getElementById("guild-patron-inventory");
  const guild2Container = document.getElementById("guild2-patron-inventory");
  const partyAContainer = document.getElementById("party-a-patron-inventory");
  const partyAGuideContainer = document.getElementById("party-a-guide-inventory");
  const partyBContainer = document.getElementById("party-b-patron-inventory");
  const partyCContainer = document.getElementById("party-c-patron-inventory");
  const secretContainer = document.getElementById("secret-patron-inventory");

  const excludedStatuses = ["applicant", "retired", "dead"];

  // Ensure patronList only contains valid patrons
  patronList = patronList.filter(p => player.patrons[p.id]);

  function renderGroup(location) {
    return patronList
      .filter(p => p.location === location)
      .filter(p => {
        const status = player.patrons[p.id]?.status?.trim().toLowerCase();
        return status && !excludedStatuses.includes(status);
      })
      .map(p => {
        const status = player.patrons[p.id]?.status?.trim().toLowerCase();
        const isIdle = status === "idle";

        return `
          <div class="patron-slot"
               draggable="${isIdle}"
               data-adv="${p.id}">
            <img src="${p.icon}" class="item-icon" draggable="false">
            <div class="hover-zone" data-label="${p.name}"></div>
            <div class="tooltip"></div>
          </div>
        `;
      })
      .join("");
  }

  guildContainer.innerHTML = renderGroup(1);
  guild2Container.innerHTML = renderGroup(2);
  partyAContainer.innerHTML = renderGroup(3);
  partyBContainer.innerHTML = renderGroup(4);
  partyCContainer.innerHTML = renderGroup(5);
  partyAGuideContainer.innerHTML = renderGroup(6);
  secretContainer.innerHTML = renderGroup(9);

}

function enablePatronDragDrop() {
    const slots = document.querySelectorAll(".patron-slot");
    const zones = document.querySelectorAll(".dropzone");

    // DRAG START
    slots.forEach(slot => {
        slot.addEventListener("dragstart", e => {
            e.dataTransfer.setData("advId", slot.dataset.adv);
            slot.classList.add("dragging");
        });

        slot.addEventListener("dragend", () => {
            slot.classList.remove("dragging");
        });
    });

    // DROP ZONES
    zones.forEach(zone => {
        zone.addEventListener("dragover", e => {
            e.preventDefault();
            zone.classList.add("drag-over");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("drag-over");
        });

		zone.addEventListener("drop", async e => {
			e.preventDefault();
			zone.classList.remove("drag-over");

			const advId = e.dataTransfer.getData("advId");
			if (!advId) return;

			const patron = player.patrons[advId];
			const origin = patron.location;

			// Determine new location
			let newLocation = 1;
			if (zone.id === "guild-patron-inventory") newLocation = 1;
			if (zone.id === "guild2-patron-inventory") newLocation = 2;
			if (zone.id === "party-a-patron-inventory") newLocation = 3;
			if (zone.id === "party-b-patron-inventory") newLocation = 4;
			if (zone.id === "party-c-patron-inventory") newLocation = 5;
			if (zone.id === "party-a-guide-inventory") newLocation = 6;
			if (zone.id === "secret-patron-inventory") newLocation = 9;

			// --- PARTY LOCK CHECKS (origin + destination) ---
			const isLocked = loc => ({
				3: player.data.party_A_locked,
				4: player.data.party_B_locked,
				5: player.data.party_C_locked
			}[loc] || false);

			// Block leaving a locked party
			if (isLocked(origin)) {
				
				pushStatus("Cannot move patron — origin party is locked.");
				console.warn("Cannot move patron — origin party is locked.");
				return;
			}

			// Block entering a locked party
			if (isLocked(newLocation)) {
				pushStatus("Cannot move patron — destination party is locked.");
				console.warn("Cannot move patron — destination party is locked.");
				return;
			}
			// -------------------------------------------------

			// Update patron location
			patron.location = newLocation;

			await storage.savePlayer(player);

			patronList = getVisiblePatrons();
			renderPatronInventory();

			setTimeout(enablePatronDragDrop, 0);
		});



    });
}

function showTemporaryImage(src) {
	// showTemporaryImage("assets/myImage.png");

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
  const main = document.getElementById("mainWindow");

  main.innerHTML = pages[page] || "<p>Unknown page</p>";

if (page === "guild") {
  patronList = getVisiblePatrons();
  console.log(patronList);

  const container = document.getElementById("patron-container");

  container.innerHTML = patronList
    .filter(patron => patron.location === 1)
    .map(patron => {
      const large = patron.large || patron.icon || "assets/patrons/default.png";

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
		const large = patron.large || "assets/patrons/default.png";

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
		["Morning", "Noon", "Evening", "Nighttime"].forEach(cat => {
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

function getIdleDescription(adv, player) {
  const hydrated = getHydratedAdventurer(adv.id);

  const globalIdle = loreData.passive.idleDescriptions;
  const traitReferrals = loreData.passive.traitReferrals;

  // 1. If idle → override with trait referral
  if (hydrated.status === "idle") {
    return traitReferrals[hydrated.trait] || traitReferrals.default;
  }

  // 2. Otherwise → use normal idle descriptions
  return globalIdle[hydrated.status] || globalIdle.default;
}

function getTraitReferral(adv) {
  const hydrated = getHydratedAdventurer(adv.id);
  const traits = loreData.passive.traitReferrals;

  // Only show trait referral when idle
  if (hydrated.status !== "idle") {
    return "";
  }

  // hydrated.trait is an array → loop through it
  for (const t of hydrated.trait) {
    if (traits[t]) {
      return traits[t];
    }
  }

  // If none of the traits match → fallback
  return traits.default;
}

function initPatronClicks() {
  document.querySelectorAll('.patron-wrapper').forEach(wrapper => {
    const zone = wrapper.querySelector('.hover-zone');
    if (!zone) return;

    zone.addEventListener('mousedown', () => {
	  const id = zone.dataset.id;
	  const adv = getHydratedAdventurer(id); // refresh data
      const large = zone.dataset.large || adv.icon || "assets/patrons/default.png";

      openPatronWindow(adv, large);
    });
  });
}

async function openPatronWindow(adv, portrait) {
  const container = document.getElementById("window-container");

  // Hydrate first
  const hydrated = getHydratedAdventurer(adv.id);

  const idleDescription = getIdleDescription(hydrated, player); // <p><strong>Description:</strong> ${idleDescription}</p>
  const traitReferral = getTraitReferral(adv);
  const isApplicant = hydrated.status === "applicant";

  container.innerHTML = `
    <div class="infoPopupPatron ${isApplicant ? "applicant-mode" : ""}">
      <div class="window-header">
        <span>${hydrated.name}</span>
        <button class="close-window">X</button>
      </div>

      <div class="window-body patron-window">
        <img class="patron-portrait" src="${portrait}">

		${!isApplicant ? `
		  <div class="patron-stats">
			<p><strong>Status:</strong> ${hydrated.status}</p>
			${traitReferral ? `<p> ${traitReferral}</p>` : ""}
		  </div>
		` : ""}


        ${isApplicant ? `
          <div class="hire-section">
            <p><strong>Applicant:</strong> Would you like to hire this adventurer?</p>
            <button id="hire-yes">Hire</button>
            <button id="hire-no">Decline</button>
          </div>
        ` : ""}
      </div>
    </div>
  `;

  container.style.display = "block";

  // Close window button
  container.querySelector(".close-window").addEventListener("click", () => {
    container.style.display = "none";
  });

  // Click outside to close
  container.addEventListener("mousedown", (e) => {
    if (e.target === container) {
      container.style.display = "none";
    }
  });

  // Applicant hiring logic
  if (isApplicant) {
    const yesBtn = document.getElementById("hire-yes");
    const noBtn = document.getElementById("hire-no");

    yesBtn.addEventListener("click", () => {
	  pushStatus("You can't afford Amyssa yet, there isn't any money in the stash!");
      // console.log(`${hydrated.name} hired!`);
      // recruitAdventurer(hydrated.id);
      container.style.display = "none";
    });

    noBtn.addEventListener("click", () => {
      console.log(`${hydrated.name} declined.`);
      container.style.display = "none";
    });
  }
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
        traits: members.flatMap(m => m.traits)
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
function setPartyStatus(party, status) {
    Object.values(player.patrons).forEach(p => {
        if (p.party === party) {
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

    patronList = getVisiblePatrons();
    renderPatronInventory();
	updateSecretMissionLine();
	updatePartyAGuideLine();

    // Fill static mission info
    document.getElementById("missions_line1").textContent = player.data.guild_name;
    document.getElementById("missions_line2").textContent = player.data.party_A;
    document.getElementById("missions_line3").textContent = player.data.party_B;
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
		//here we are setting where do those missions end and exist visability.
        if (key === "green_1" && player.missions.green_1 > 6) return;
        if (key === "green_2" && player.missions.green_2 > 2) return;
        if (key === "green_3" && player.missions.green_3 > 2) return;

        const label = missionLabels[key] || key;
        const selected = (player.missions.current_mission.id === key) ? "selected" : "";

        missionHTML += `<option value="${key}" ${selected}>${label}</option>`;
    });

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

    const missionSelect = document.getElementById("mission-select");
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

    updateMissionDisplay();

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
    setTimeout(enablePatronDragDrop, 0);
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

function updateMissionDisplay() {
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

function startTutorial() {
	// TODO: Replace with mission-based tutorial system
	if (player.missions.tutorial === 0) {
		const win = document.querySelector(".tutorial-window");
		if (win) {
			const btn = document.getElementById("tutorial-button");
			if (btn) {
				btn.style.display = "none";}
			console.log("tutorial-window:", win);

			win.style.visibility = "visible";
			win.style.display = "block";
			win.classList.add("active");

			
    setTutorialChoices([
        {
            label: "start the Tutorial",
            action: () => {
                setTutorialText("Are you ready to start the Tutorial? This is going to take about 5-6 minutes of dialog.");
                setTutorialChoices([
					{
						label: "OK",
						action: () =>	{
							closeTutorial();
							startMissionSystem("tutor1_101");}
							}]);
            }
        },
        {
            label: "Go back",
            action: () => {
                setTutorialText("No, let me back.");
                setTutorialChoices([{ label: "Got it", action: () => closeTutorial() }]);
            }
        }
    ]);
			
            }

		}
	}

function startTutorial2() {
	// TODO: Replace with mission-based tutorial system
	if (player.missions.green_1 === 6) {
	startMissionSystem("tutor2_101")
	}
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

function createDefaultPatronState(advId) {
    const lore = loreData.Adventurer[advId];

    if (!lore) {
        console.warn("Missing lore for", advId);
        return { status: "idle" };
    }

    // Armor proficiency → numeric bonus (all lowercase keys)
    const armorBonus = {
        unarmed: 0,
        light: 2,
        medium: 4,
        heavy: 6
    };

    const Dexterity = lore.Dexterity_mod ?? 0;
    const wisdom = lore.wisdom_mod ?? 0;
    const hpDie = lore.hp_die ?? 0;
    const hpMod = lore.hp_modifier ?? 0;
    const level = lore.level ?? 1;

    // Normalize armor proficiency
    let prof = (lore.proficiency_armor || "unarmed").toLowerCase();
    if (!armorBonus.hasOwnProperty(prof)) {
        prof = "unarmed";
    }

    // Normalize race + role
    const race = lore.race?.toLowerCase() || "";
    const role = lore.role?.toLowerCase() || "";

    // --- Compute AC ---
    let AC = 10 + Dexterity + (armorBonus[prof] || 0);

    // Barbarian bonus only when unarmed
    if (race === "barbarian" && prof === "unarmed") {
        AC += hpMod;
    }

    // Barbarian bonus only when unarmed
    if (race === "direwolf" && prof === "unarmed") {
        AC += hpMod;
    }

    // Monk AC formula (only when unarmed)
    if (role === "monk" && prof === "unarmed") {
        AC = 10 + wisdom;
    }

    // --- Compute MaxHP ---
    function rollAdvantage(die) {
        const a = Math.ceil(Math.random() * die);
        const b = Math.ceil(Math.random() * die);
        return Math.max(a, b);
    }

    let MaxHP = hpDie + hpMod; // Level 1 guaranteed max

    for (let lvl = 2; lvl <= level; lvl++) {
        MaxHP += rollAdvantage(hpDie) + hpMod;
    }

    return {
        status: "idle",
        AC,
        MaxHP,
        currentHP: MaxHP
    };
}

function rollAdvantage(die) {
    const a = Math.ceil(Math.random() * die);
    const b = Math.ceil(Math.random() * die);
    return Math.max(a, b);
}

async function recruitAdventurer(advId) {
    // 1. Get the latest player state from your storage
    // (Assuming you have a function to get player data)
    //let player = await storage.getPlayer(); 

    // 2. Safety check: Prevent overwriting if already recruited
    if (player.patrons[advId]) {
        console.warn("Adventurer already recruited!");
        return;
    }

    // 3. Inject the new state using your factory
    player.patrons[advId] = createDefaultPatronState(advId);

    // 4. Save the updated object back to IDB
    await storage.savePlayer(player);
    
    console.log(`Adventurer ${advId} recruited successfully!`);
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
                    <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
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
                        ${(adv.trait ?? []).map(t => `<li>${t}</li>`).join("")}
                    </ul>

                    ${(() => {
                        const innate = getInnateTraits(adv);
                        if (!innate.length) return "";

                        return `
                            <h3>Innate</h3>
                            <ul class="char-traits">
                                ${innate.map(t => `<li>${t}</li>`).join("")}
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
  const frame = document.querySelector('.app-frame');
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
      const largeSrc = zone.dataset.large || "assets/patrons/default.png";
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
// data-large="assets/guild/adventurers_licence_50.png"


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
