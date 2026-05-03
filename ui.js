// 1. A variable that will hold your data
let loreData = null; 

// 2. A variable for your player data (assuming you have this already)
//let player = { patrons: {} }; 

// 3. The "Loader" function
async function initializeGame() {
    try {
        const response = await fetch('lore.json');
        loreData = await response.json(); // THIS parses the JSON into a real object
        console.log("Lore loaded successfully!");
        
        // NOW you can start your game logic
        // recruitAdventurer("warrior_01"); // Example
    } catch (err) {
        console.error("Failed to load lore.json. Is it in the same folder?", err);
    }
}

// 4. Run it immediately when the script loads
initializeGame();


// This function takes your Lore list and merges it with current player data
// The "Hydration" Function: Merges Lore + Player State
function getVisiblePatrons() {
    if (!loreData.Adventurer) {
        console.warn("loreData.Adventurer is missing");
        return [];
    }

	const patronKeys = Object.keys(player.patrons);

	const allowed = ["idle", "applicant"];

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
		
		<div class="guild_stash" style="top: 200px; left: 80px;">
          <img src="assets/guild/chest60.png" class="item-icon">
          <div class="hover-zone"
               data-label="Guild Stash"
               data-large="assets/guild/inventory.png">
          </div>
          <div class="tooltip"></div>
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
      <div id="contracts-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<p style="margin: 40px; color: black;">Welcome to the guild contracts.<br>
		this is W.I.P<br>
		please return after completing the<br>
		tutorial.</p>
		</div>
		`,
    missions: `
      <div id="missions-container">
        <img id="contract_parchment" src="assets/missions/guild_party_party_window.png" />
			<p id="missions_line1"></p>
			<p id="missions_line2"></p>
			<p id="missions_line3"></p>

		<div id="guild-patron-inventory" class="inventory-row">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-a-patron-inventory" class="inventory-row">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-b-patron-inventory" class="inventory-row">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>

<div id="party-c-patron-inventory" class="inventory-row">
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
  <div class="slot"></div>
</div>
		</div>
		<!-- This is where our dynamic buttons will be injected -->
		<div id="dynamic-mission-list"></div>
		<button id="mission-start-button" class="tutorial-button">Start Mission</button>
		<div id="current-mission-display" class="mission-displaymission-display">No mission selected.</div>
		<button id="start-mission-A" onclick="startMission('party_A')">Start Mission (Party A)</button>

		<button id="continue-mission-A" onclick="continueMission('party_A')" style="display:none;">
			Continue Mission (<span id="continue-party-A-name"></span>)
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
	<div id="mission-container" style="position: relative;">
		<img id="fantasy map" src="assets/missions/fantasy_map_s.png" />

		<!-- Path Layer -->
		<svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
			<!-- 1. The "Hitbox" (Invisible but clickable) -->
			<path d="M 140 460 C 180 460, 200 300, 240 300" 
				  stroke="transparent" stroke-width="25" fill="none" 
				  style="pointer-events: stroke; cursor: pointer;" 
				  onclick="console.log('Winding path clicked!');
					runMission(player.missions.current_mission.id)" />
			
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
  const guildContainer = document.getElementById("guild-patron-inventory");
  const partyAContainer = document.getElementById("party-a-patron-inventory");
  const partyBContainer = document.getElementById("party-b-patron-inventory");

  // Any status in this list will be ignored
  const excludedStatuses = ["applicant", "retired", "dead"];

  function renderGroup(location) {
    return patronList
      .filter(p => p.location === location)
		.filter(p => {
			const key = "adv_" + p.name;   // build the correct IDB key
			const status = player.patrons?.[key]?.status?.trim().toLowerCase();
			return !excludedStatuses.includes(status);
		})

      .map(p => `
        <div class="patron-slot">
          <img src="${p.icon}" class="item-icon">
          <div class="hover-zone" data-label="${p.name}"></div>
          <div class="tooltip"></div>
        </div>
      `)
      .join('');
  }

  guildContainer.innerHTML = renderGroup(1) + renderGroup(2);
  partyAContainer.innerHTML = renderGroup(3);
  partyBContainer.innerHTML = renderGroup(4);
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

// 1. Define your patron data in an array. 
// You can easily add up to 12 objects here.
// 1. Single source of truth with the 'location' key
//	0 is Hidden
//	1	guild
//	2	tavern
//	3	mission
async function loadPage(page) {
  const main = document.getElementById("mainWindow");

  main.innerHTML = pages[page] || "<p>Unknown page</p>";

  if (page === "guild") {
    //loadPhaserScripts();
	patronList = getVisiblePatrons();
	console.log(patronList);
	const container = document.getElementById("patron-container");

	container.innerHTML = patronList
	  .filter(patron => patron.location === 1)
	  .map(patron => `
		<div class="patron-wrapper" 
			 style="position: absolute; top: ${patron.top}; left: ${patron.left};">
		  <img src="${patron.icon}" class="item-icon">
		  <div class="hover-zone" data-label="${patron.name}"></div>
		  <div class="tooltip"></div>
		</div>
	  `)
	  .join('');


    initGuildTooltips();   // <-- important
	showTutorialButton();
	displayRightMenu();
  }
  if (page === "tavern") {
    patronList = getVisiblePatrons();
	console.log(patronList);
	const container = document.getElementById("patron-container");

	container.innerHTML = patronList
	  .filter(patron => patron.location === 2)
	  .map(patron => `
		<div class="patron-wrapper" 
			 style="position: absolute; top: ${patron.top}; left: ${patron.left};">
		  <img src="${patron.icon}" class="item-icon">
		  <div class="hover-zone" data-label="${patron.name}"></div>
		  <div class="tooltip"></div>
		</div>
	  `)
	  .join('');
		
  }
  
  if (page === "missions") {
	  
	loadMissionPage();
    patronList = getVisiblePatrons();
	renderPatronInventory();
	updateMissionDisplay();
	// add code to manage patrons placement into party/guild. from "invx-grid"
	
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

function showTutorialButton() {
    const btn = document.getElementById("tutorial-button");
    if (!btn) return console.warn("tutorial-button element not found");

    // 1. Reset: Remove old listeners by cloning the button
    // This is the cleanest way to clear old 'onclick' or 'addEventListener' logic
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    const refreshedBtn = document.getElementById("tutorial-button");

    // 2. Logic to show and assign action
    refreshedBtn.style.display = "block";

    if (player.missions.tutorial === 0) {
        refreshedBtn.innerText = "Start Tutorial";
        refreshedBtn.addEventListener('click', () => {
            console.log("Starting Tutorial 1");
            startMissionSystem("tutor1_000");
        });
    } 
    else if (player.missions.tutorial === 1 && player.missions.green_1 === 6) {
        refreshedBtn.innerText = "continue tutorial";
        refreshedBtn.addEventListener('click', () => {
            console.log("Starting Tutorial 2: Recruit Amyssa");
            startMissionSystem("tutor2_101");
        });
    } else {
        // Hide if conditions aren't met
        refreshedBtn.style.display = "none";
    }
	}

const missionLabels = {
	green_1: "Tutorial in the Green Pastures",
};

async function startMission(partyKey) {
    // If this party is already on a mission → resume
    if (player.missions.current_mission.active &&
        player.missions.current_mission.party === partyKey) {

        continueMission(partyKey);
        return;
    }

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

    const missionId = player.missions.current_mission.id;
    const party = player.missions.current_mission.party;

    if (!missionId) {
        showMessage("Please select a mission first.");
        return;
    }

    if (!party) {
        showMessage("Please select a party first.");
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

    //console.log("Starting mission:", missionId, "with party:", party);
	// Determine which mission page should load
	let missionPage = null;

	if (missionId.startsWith("green_1")) missionPage = "mission_green_1";
	if (missionId.startsWith("green_2")) missionPage = "mission_green_2";

	// If no mission page exists → block and DO NOT lock
	if (!missionPage || !pageExists(missionPage)) {
		showMessage("This mission is not implemented yet.");
		return;
	}
	
	//const partyKey = player.missions.current_mission.party;

    // --- NEW: Confirmation window ---
	//const missionId = player.missions.current_mission.id;
	const missionLongName = missionLabels[missionId] || "Unknown Mission";
    const partyName = player.data[partyKey];
    //const missionLongName = missions[missionId].longName;

    showConfirm(
        `${partyName} is about to embark on "${missionLongName}".<br><br>` +
        `They cannot be modified until they return.<br><br>` +
        `Continue?`,
        () => {
			// Hardcoded patron placement for now DEBUG in the future this will be made integral.
			player.patrons.adv_Bragain.location = 3;
			player.patrons.adv_Hogperson.location = 3;
			
            // YES → lock party and start mission
            player.data[partyKey + "_locked"] = true;
			
			  // NEW: Save mission state
			player.missions.current_mission.active = true;
			player.missions.current_mission.page = missionPage;
			
            storage.savePlayer(player);
			
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


    showMessage("Mission type not implemented yet.");
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
    // c_mission example: "green_1"

    if (typeof c_mission !== "string") {
        console.warn("Invalid mission ID:", c_mission);
        return "green1_101"; // safe fallback
    }

    // Extract mission key, e.g. "green_1"
    const missionKey = c_mission;

    // Read mission progress from player data
    const progress = player.missions[missionKey];

    // If progress is missing or invalid, default to 1
    const stage = Number(progress) || 1;

    // Convert stage → suffix (1 → 101, 2 → 201, 3 → 301)
    const suffix = stage * 100 + 1;

    // Build final scene ID
    return `green1_${suffix}`;
}

async function loadMissionPage() {
    console.log("Loading Mission Page");

    // Ensure mission structure exists
    if (!player.missions) player.missions = {};
    if (!player.missions.current_mission) {
        player.missions.current_mission = { id: null, party: null };
    }

    // Insert missions page HTML
    const main = document.getElementById("mainWindow");
    main.innerHTML = pages.missions;

    // Fill static mission info
    document.getElementById("missions_line1").textContent = player.data.guild_name;
    document.getElementById("missions_line2").textContent = player.data.party_A;
    document.getElementById("missions_line3").textContent = player.data.party_B;

    // Build mission dropdown
    const listContainer = document.getElementById("dynamic-mission-list");

	let missionHTML = `
		<label>Choose Mission:</label>
		<select id="mission-select">
	`;

	Object.keys(player.missions).forEach(key => {
		if (key === "current_mission") return;
		if (key === "tutorial") return;

		// NEW RULE: hide green_1 if completed
		if (key === "green_1" && player.missions.green_1 > 5) return;
		
		const label = missionLabels[key] || key;
		const selected = (player.missions.current_mission.id === key) ? "selected" : "";

		missionHTML += `<option value="${key}" ${selected}>${label}</option>`;
	});

	missionHTML += `</select>`;



    // Build party dropdown
	let partyHTML = `
		<label>Select Party:</label>
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
	// FORCE-SAVE the default party on page load
	const partySelect = document.getElementById("party-select");
	player.missions.current_mission.party = partySelect.value;
	await storage.savePlayer(player);

	// FORCE-SAVE mission ID on page load
	player.missions.current_mission.id = document.getElementById("mission-select").value;
	await storage.savePlayer(player);
    // Update mission display
    updateMissionDisplay();

    // Mission dropdown listener
    document.getElementById("mission-select").addEventListener("change", async (e) => {
        player.missions.current_mission.id = e.target.value;
        await storage.savePlayer(player);
        updateMissionDisplay();
    });

    // Party dropdown listener
    document.getElementById("party-select").addEventListener("change", async (e) => {
        player.missions.current_mission.party = e.target.value;
        await storage.savePlayer(player);
        updateMissionDisplay();
    });

    // Mission start button
    const startBtn = document.getElementById("mission-start-button");

    if (startBtn) {
        startBtn.style.display = "block";

        startBtn.addEventListener("click", () => {
            startMission();
        });
    }
	const startA = document.getElementById("start-mission-A");
	// continue button
	const contA = document.getElementById("continue-mission-A");

	if (player.missions.current_mission.active && 
		player.missions.current_mission.party === "party_A") {

		startA.style.display = "none";
		contA.style.display = "block";

	} else {
		startA.style.display = "block";
		contA.style.display = "none";
	}

}

function updateContinueButton(partyKey) {
	
	// updateContinueButton("party_A");
	// updateContinueButton("party_B");

    const btn = document.getElementById(`continue-mission-${partyKey}`);
    const nameSpan = document.getElementById(`continue-party-${partyKey}-name`);

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
    };

    const id = player.missions.current_mission.id;
    const partyKey = player.missions.current_mission.party;

    const partyName =
        partyKey === "party_A" ? player.data.party_A :
        partyKey === "party_B" ? player.data.party_B :
        "None";

    if (!id) {
        missionDisplay.textContent = "No mission selected.";
    } else {
        missionDisplay.textContent =
            `Current Mission: ${missionLabels[id] || id} (Party: ${partyName})`;
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

async function nextTutorialStep(step) {
    switch (step) {
        case 0:
            setTutorialText("You haven't started the tutorial and don't have a mission available yet.<BR><BR>Go back to the guild window and select startTutorial.");
            setTutorialChoices([
                { label: "Finish", action: () => closeTutorial() }
            ]);
            break;

        case 1:
            setTutorialText("Great! Let's begin. You are the Master of a guild of 'Adventurers', you hire them, send them off to do 'adventuring', and they come back with spoils for you. Simple enough right? Well... there haven't been any spoils for a while now...");
            setTutorialChoices([
                { label: "Continue", action: () => nextTutorialStep(2) }
            ]);
            break;

        case 2:
            setTutorialText("NOT THIS AGAIN  ...<BR>WHEN ARE YOU TWO FAT DRUNK BLOBS<BR>ARE EVER GOING TO MAKE ME A PROFIT ???.");
            setTutorialChoices([
                { label: "Got it", action: () => nextTutorialStep(3) }
            ]);
            break;

        case 3:
            setTutorialText("WHAT AM I FEEDING AND HOUSING YOU LOT FOR ???<BR>GO AND GET AT IT ALREADY MAKE ME SOME COIN !!!.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(4) }
            ]);
            break

        case 4:
            setTutorialText("AND TRY FIND THAT WORTHLESS BARD,<BR>CLAUDIO WAS SUPPOSED TO BE BACK HERE BY NOW !!!");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(5) }
            ]);
            break;

        case 5:
            setTutorialText("BUT DON'T GO OFF GETTING YOURSELF KILLED !!!<BR>YOU'RE NOT EVEN INSURED YET ...");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(6) }
            ]);
            break;

        case 6:
            setTutorialText("Now the player will go to the missions window, select Brag+Hog and a mission to 'Make Coin', and head off.<BR><BR>*door slams*");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(888) }
            ]);
            break;

        case 7:
            setTutorialText("Scenery changed, now the patrons are on their way.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(8) }
            ]);
            break;

        case 8:
            setTutorialText("Hog:	'Well we've done it now eh 'raggo<BR><BR>Brag:	'Ehhh, that won't be much of a fuss,<BR>I reckon we can go dig up that pot we've saved for later.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(9) }
            ]);
            break;

        case 9:
            setTutorialText("Hog:	WHAT POT?!<BR><BR>		Brag, have you been holding up on me again?");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(10) }
            ]);
            break;

        case 10:
            setTutorialText("Brag	Noooo I would never! <BR>		Don't you remember we've talked about this.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(11) }
            ]);
            break;

        case 11:
            setTutorialText("Hog:		'Talked???'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(12) }
            ]);
            break;

        case 12:
            setTutorialText("Brag:	'Yeah we've said we can't just let the boss have it all or he'll dump us to the curve again.'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(13) }
            ]);
            break;

        case 13:
            setTutorialText("Hog -	'...........<BR>		?!<BR>		When have WE ever FOUND anything?!'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(14) }
            ]);
            break;

        case 14:
            setTutorialText("Brag:	'Well, just leave it to me then,<BR>		let's go find our pot o' gold, bring it to the chief,<BR>		And we'll be Ok for a while ... ");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(888) }
            ]);
            break;

        case 888:	//update here mission log and change tutor===1, and save game.
            setTutorialText("Tutorial complete!");
			if (player.missions.tutorial === 0) {
				player.missions.tutorial = 1; // This sets the value to 1 and removes the tutor button    // This creates 'green' inside 'missions'
				if (!player.missions) {
					player.missions = {};
				}
				player.missions.green_1 = 1; 	//enables first mission.
				await storage.savePlayer(player);
				console.log("Tutorial status updated!");
			}
            setTutorialChoices([
                { label: "Finish", action: () => closeTutorial() }
            ]);
            break;
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

	
function setTutorialText(text) {
    const box = document.getElementById("tutorial-text");
    if (box) box.innerHTML  = text;
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

function createDefaultPatronState() {	
	//createDefaultPatronState() acts as a factory function. Its purpose is to guarantee that every new adventurer added to your save file starts with the exact same baseline of properties, preventing "undefined" errors later in your code when you try to access things like status or loyalty.
    return {
        status: "idle",
        //contract_expiry: Date.now() + 86400000,
        //custom_terms: null // This field doesn't exist in lore.json, and that's okay!
    };
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
    player.patrons[advId] = createDefaultPatronState();

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
  document.querySelectorAll('.guild_License').forEach(unit => {
    const zone = unit.querySelector('.hover-zone');
    const tooltip = unit.querySelector('.tooltip');

	let clickActive = false;
	
	zone.addEventListener('mousedown', (e) => {
		e.preventDefault(); // stops right-click menu
		clickActive = true;

		const label = zone.dataset.label;
		openWindow(label, largeSrc);

		if (tooltip.style.display === "block") {
			tooltip.style.display = "none";
		} else {
			tooltip.innerHTML = `<img src="${largeSrc}">`;
			tooltip.style.display = "block";
		}
	});
    zone.addEventListener('mouseenter', () => {
		if (!clickActive) {
		  const largeSrc = zone.dataset.large;
		  tooltip.innerHTML = `<img src="${largeSrc}">`;
		  tooltip.style.display = "block";
		}
	});
    zone.addEventListener('mouseleave', () => {
		if (!clickActive) {
		  tooltip.style.display = "none";
		}
	});
	document.addEventListener('mousedown', (e) => {		//this makes sure the window closes when user clicks elsewhere.
	  if (!unit.contains(e.target)) {
		tooltip.style.display = "none";
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