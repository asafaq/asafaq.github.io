// 1. A variable that will hold your data
let loreData = null; 

// 2. A variable for your player data (assuming you have this already)
//let player = { patrons: {} }; 

// 3. The "Loader" function
async function initializeGame() {
    try {
        const response = await fetch('lore.json');
        loreData = await response.json(); // THIS parses the JSON into a real object
        console.log("Lore loaded successfully!", loreData);
        
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
               data-large="assets/guild/adventurers_licence_50.png">
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
		<p style="margin: 40px; color: black;">Welcome to the Tavern! W.I.P<br>
		this is the room to find new adventurers looking for a contract, and where your past adventurers will wait and tell all their tales and exploits while soaking their sorrows and trauma in ales.<br>
		please return after completing the tutorial.</p>
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

		<button id="tutorial-button" class="tutorial-button">Start Mission</button>
		`,
	journal: `
      <div id="journal-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<div id="journal-text"></div>
		</div>
		`,
	mail: `
      <div id="mail-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<p style="margin: 40px; color: black;">Welcome to the guild contracts.<br>
		this is W.I.P<br>
		please return after completing the<br>
		tutorial.</p>
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
					runMission(player.missions.current_mission)" />
			
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

    if (player.data.tutor === 0) {
        refreshedBtn.innerText = "Start Tutorial";
        refreshedBtn.addEventListener('click', () => {
            console.log("Starting Tutorial 1");
            startTutorial();
        });
    } 
    else if (player.data.tutor === 1 && player.missions.green_1 === 6) {
        refreshedBtn.innerText = "continue tutorial";
        refreshedBtn.addEventListener('click', () => {
            console.log("Starting Tutorial 2: Recruit Amyssa");
            startTutorial2();
        });
    } else {
        // Hide if conditions aren't met
        refreshedBtn.style.display = "none";
    }
	}

function startMission() {
    hideRightMenu();

    // 1. Tutorial block
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
            return; // STOP here
        }
    }
    // READ the mission type the player selected
    const missionType = player.missions.current_mission;   // e.g. "green"

    // For the tutorial, all stages live in mission_green_1
    // In the future: mission_blue_1, mission_red_1, etc.    
	// FORCE green missions to always load mission_green_1
	if (missionType.startsWith("green")) {
		loadPage("mission_green_1");
		return;
	}



    // Load the mission shell (map UI, objectives UI, dialog UI)
	
	//console.log(missionPage);
    //loadPage(missionPage);

}

function runMission(current_mission) {
    // 1. Get the prefix (e.g., 'green1')
	
	console.log(current_mission)
    
	const startSceneId = getStartSceneId(current_mission)
    // 2. Combine it with the starting scene suffix
    //const startSceneId = missionPrefix + "_001"; 
    
    console.log("Starting mission scene:", startSceneId); // Will show 'green1_001'
    
    // 3. Call the mission system with the new variable
    startMissionSystem(startSceneId);
	
}

function getMissionSuffix(prefix) {
  const index = Number(prefix.replace("green", ""));
  return index * 100 + 1; // 101, 201, 301, ...
}

function getStartSceneId(prefix) {
  const suffix = getMissionSuffix(prefix);
  return `green1_${suffix}`;
}


	
	//logic that progress the missions.
	//introduce mission tracker.
	//player.missions.current_mission = {green1}
	//let currentMission = player.missions.current_mission;
	
	//startMissionSystem('green1_001');

	//if currentMission is green1 run	//startMissionSystem('green1_001');
	//if currentMission === green_1 {
		//check player.missions.green_1 {which stage}
		// stage1 load player.missions.green_1{1}
		
		// now the player has clicked the path first time in first missions.
		// cut and preset the last text part of the tutorial steps 8-13
		// add a marker on the map
		// set player.missions.green_1 = 2
	//}
async function loadMissionPage() {
    console.log("we called loadMissionPage");

    // 1. Ensure mission structure exists
    if (!player.missions) player.missions = {};

    // 2. Insert the missions page HTML FIRST
    const main = document.getElementById("mainWindow");
    main.innerHTML = pages.missions;

    // 3. NOW your <p id="missions_lineX"> elements exist
    // Fill them with player.data
    document.getElementById("missions_line1").textContent = player.data.guild_name;
    document.getElementById("missions_line2").textContent = player.data.party_A;
    document.getElementById("missions_line3").textContent = player.data.party_B;

    // 4. Build mission dropdown
    const listContainer = document.getElementById("dynamic-mission-list");
    const missionOptions = [{ id: "green", label: "Green Mission" }];

    let dropdownHTML = `<select id="mission-select">`;
    missionOptions.forEach(m => {
        const selected = (player.missions.current_mission === m.id) ? "selected" : "";
        dropdownHTML += `<option value="${m.id}" ${selected}>${m.label}</option>`;
    });
    dropdownHTML += `</select>`;

    // 5. No buttons yet
    let buttonsHTML = "";

    // 6. Inject dropdown + buttons
    listContainer.innerHTML = dropdownHTML + buttonsHTML;

    // 7. Attach dropdown listener
    document.getElementById("mission-select").addEventListener("change", async (e) => {
        player.missions.current_mission = e.target.value;
        await storage.savePlayer(player);
        console.log("Current mission set to:", e.target.value);
    });

    // 8. Mission start button
    const btn = document.getElementById("tutorial-button");
    if (btn) {
        btn.style.display = "block";
        console.log("mission-button:", player.data.tutor, "TESTING LIVE");

        btn.addEventListener('click', function () {
            if (!player.missions.current_mission) {
                console.log(`mission button clicked, but current_mission is: ${player.missions.current_mission}`);
                return;
            }
            console.log("mission button clicked");
            startMission();
        });
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
	if (player.data.tutor === 0) {
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

	if (player.data.tutor === 0) {
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
			if (player.data.tutor === 0) {
				player.data.tutor = 1; // This sets the value to 1 and removes the tutor button    // This creates 'green' inside 'missions'
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
    entries: [],

    addEntry(text) {
        const timestamp = new Date().toLocaleString();
        this.entries.push(`[${timestamp}] ${text}`);
    },

    getJournalPage() {
        return {
            id: "journal",
            title: "Journal",
            content: this.entries.join("\n\n"),
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
              ${this.entries.join("<br><br>")}
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