let db;
let storyData = [];
let isTyping = false;
// Set this to true to skip the typewriter effect for testing
//const SKIP_TYPEWRITER = true;
const SKIP_TYPEWRITER = player?.data?.skip_typewriter ?? false;


/*  regarding missions.json = the current templates. Still need to add option choices based on TRAITS, when we get that running.
Reference Guide for Properties
When adding new entries, here is what each field does:

id (String): The unique identifier for this specific dialog block. Everything relies on this.

speaker (String): The name displayed at the top of the dialog box.

portrait (URL): The image path for the character speaking.

side (String): "left" or "right" (controls the layout/CSS class).

dialog (String): The text shown to the player. Use \n for line breaks.

interaction_type (String):

"next": Displays a single "NEXT >>" button.

"selection": Displays multiple buttons based on the options array.

options (Array): Used only if interaction_type is "selection".

text (String): What the button says.

target_id (String): Where the button jumps to. Use "STAY" to keep the player on the same screen.

disabled (Boolean): If true, the button is greyed out and unclickable.

frustration_text (String): The message that appears in the m-frustration-display when a disabled button is clicked.

color (Hex): Optional. Sets the color of the button border/text.

Pro-Tip for Maintaining This
Because this file will grow very large, I recommend using a JSON Validator (like JSONLint) whenever you finish editing. If you miss a single comma or bracket, the game will crash!

Does this full list cover all the interactive elements you were looking to build for your mission system?

If these are missing or null, your code will either throw a TypeError or display an error message to the player.

1. Mandatory (The "Must-Haves")
If these are missing or null, your code will either throw a TypeError or display an error message to the player.

id: Required. Your renderScene function uses storyData.find(s => s.id === sceneId). If a scene doesn't have an ID, you can never look it up.

interaction_type: Required. Your code checks if (scene.interaction_type === "next") or else if (scene.interaction_type === "selection"). If this is missing, the code won't know whether to show a "Next" button or a list of choices, and no buttons will appear.

target_id: Required (mostly). * If interaction_type is "next", you must have a target_id. If it's missing, the button will be created, but clicking it will call renderScene(undefined), which will crash the next load.

If interaction_type is "selection", the options inside the array must have target_id values.

2. Optional (Safely Ignored)
Your code uses conditional rendering (the ${scene.field ? ... : ''} pattern), which protects these fields. If they are null or missing, the browser just skips them.

portrait: Safely ignored. Your JS checks if (scene.portrait). If it's missing, it simply doesn't create the <img> tag.

speaker: Safely ignored. If missing, the <div class="m-speaker-name"> is never created.

options: Safely ignored. Your code only looks at scene.options if interaction_type is "selection". If you are using "next", you don't need this field at all.

side: Safely ignored (mostly). You use it for the CSS class: m-side-${scene.side}. If it's missing, the class will be m-side-undefined. This won't "break" the JS, but it might make the dialog look unstyled (you should define a default CSS class for m-side-undefined just in case).

color / frustration_text: Safely ignored by the createBtn function unless the button is explicitly set to disabled: true.


[
  {
    "id": "pattern_001_standard_narrative",
    "speaker": "Commander",
    "dialog": "This is a simple linear progression. Click the button to move forward.",
    "interaction_type": "next",
    "target_id": "pattern_002_branching"
  },
  {
    "id": "pattern_002_branching",
    "speaker": "Merchant",
    "dialog": "Choose your own adventure!",
    "interaction_type": "selection",
    "options": [
      { "text": "Take the left path", "target_id": "path_left" },
      { "text": "Take the right path", "target_id": "path_right" }
    ]
  },
  {
    "id": "pattern_003_gated_choice",
    "speaker": "Gatekeeper",
    "dialog": "You need to be skilled to pass this gate.",
    "interaction_type": "selection",
    "options": [
      { 
        "text": "Try to force it (Locked)", 
        "target_id": "STAY", 
        "disabled": true, 
        "frustration_text": "It's too heavy! You need at least 5 Strength." 
      },
      { 
        "text": "Use your Key", 
        "target_id": "success_scene", 
        "disabled": false, 
        "color": "#FFD700" 
      }
    ]
  },
  {
    "id": "pattern_004_mission_end",
    "speaker": "Narrator",
    "dialog": "This message will not be visble. Mission complete. Thanks for playing! ",
    "interaction_type": "next",
    "target_id": "END"
  }
]
*/


// closeMissionSystem()
// 1. DATABASE LOGIC
async function initDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open("MissionDB", 1);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            db.createObjectStore("gameState");
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve();
        };
    });
}

async function saveProgress(sceneId) {
    if (!db) return;
    const tx = db.transaction("gameState", "readwrite");
    tx.objectStore("gameState").put(sceneId, "currentScene");
}

async function getSavedProgress() {
    return new Promise((resolve) => {
        const tx = db.transaction("gameState", "readonly");
        const request = tx.objectStore("gameState").get("currentScene");
        request.onsuccess = () => resolve(request.result || "scene_001");
    });
}

function resetGame() {
    if (!db) return;
    const tx = db.transaction("gameState", "readwrite");
    tx.objectStore("gameState").clear();
    location.reload();
}

// 2. RENDERING LOGIC
//async function renderScene(sceneId) {

/*
condition:     - Requires trait(s). Single or ANY in array.
condition_not:     - Must NOT have trait.
disabled:     - true → always disabled.
condition_alignment:     - Requires at least one member with alignment.
condition_not_alignment:     - Disabled if ANY member has alignment.
condition_mission (future):     - Requires mission stage.
DISABLED IF:
    missing required trait
    OR forbidden trait present
    OR disabled === true
    OR required alignment missing
    OR forbidden alignment present
    OR mission stage unmet (future)
*/

function createDialogWindow(dlg, index = 0) {

    const isDual = dlg.portrait && dlg.portrait.length > 1;

    const div = document.createElement("div");
    div.className = `m-glass-panel ${isDual ? "m-glass-panel-dual" : ""}`;

    div.innerHTML = `
        ${dlg.portrait && dlg.portrait.length
            ? dlg.portrait.map((p, idx) => {
                const side = dlg.side[idx] || dlg.side[0] || "left";

                return `
                    <img src="${p}" class="m-portrait m-portrait-${side}">
                `;
            }).join("")
            : ""
        }

        <div class="m-text-area">

            ${dlg.speaker
                ? `<div class="m-speaker-name">${dlg.speaker}</div>`
                : ''
            }

            <div class="m-typewriter" id="typewriter-${index}"></div>

            <div
                class="m-frustration-display"
                id="m-frustration-display-${index}"
            ></div>

        </div>
    `;

    return div;
}

async function renderScene(sceneId) {

    if (isTyping) return;

    // --- 1. FIND SCENE DATA ---
    const scene = storyData.find(s => s.id === sceneId);
    console.log(sceneId);

    // --- 2. VALIDATE SCENE EXISTS ---
    if (!scene) {
        console.error("Scene not found:", sceneId);
        pushStatus(`Error: Scene ${sceneId} not found.`);
        return;
    }

    // --- 3. CHECK IF THIS SCENE IS AN ENDING ---
    if (scene.target_id === "END") {
        await handleMissionEnd(scene.id);
        return;
    }

    // --- 4. SAVE PROGRESS ---
    await saveProgress(sceneId);

    // --- 5. DOM ELEMENT LOOKUP ---
    const viewport = document.getElementById('m-viewport');
    const container = document.getElementById("m-dialog-container");
    const choiceContainer = document.getElementById('m-choices-container');

    if (!viewport || !container || !choiceContainer) {
        console.error("renderScene Error: UI elements not found in DOM.");
        return;
    }

    viewport.style.display = 'block';

    // --- CLEAR OLD DIALOG WINDOWS ---
    container.innerHTML = "";
	choiceContainer.innerHTML = '';

	// --- 6. NORMALIZE DIALOGS INTO AN ARRAY ---
	let dialogs = [];

	if (scene.dialogs && Array.isArray(scene.dialogs)) {
		// New format: dialogs: []
		dialogs = scene.dialogs;
	} else {
		// Old format: dialog, dialog2, dialog3, dialog4...
		let index = 1;

		while (true) {
			const key = index === 1 ? "dialog" : `dialog${index}`;
			if (!scene[key]) break; // stop when no more dialogs

				dialogs.push({
					text: scene[key],
					speaker: scene[`speaker${index}`] || scene.speaker || null,

					// ⭐ Portrait normalization (Step 2)
					portrait: (() => {
						const raw = index === 1
							? scene.portrait
							: scene[`portrait${index}`];

						if (!raw) return null;
						return Array.isArray(raw) ? raw : [raw];
					})(),

					side: (() => {
						const raw = index === 1
							? scene.side
							: scene[`side${index}`];

						if (!raw) return ["left"]; // default
						return Array.isArray(raw) ? raw : [raw];
					})()
				});


			index++;
		}
	}
	dialogs.forEach(d => {
		if (!d.speaker) d.speaker = scene.speaker;
	});
	const allSameSpeaker = dialogs.every(d => d.speaker === dialogs[0].speaker);

	let dialogGroups = [];

	if (allSameSpeaker) {
		dialogGroups.push({
			speaker: dialogs[0].speaker,
			portrait: dialogs[0].portrait,
			side: dialogs[0].side,
			texts: dialogs.map(d => d.text)
		});
	} else {
		// Each dialog gets its own window
		dialogs.forEach(d => {
			dialogGroups.push({
				speaker: d.speaker,
				portrait: d.portrait,
				side: d.side,
				texts: [d.text]
			});
		});
	}
	// --- 7. CREATE DIALOG WINDOWS AND TYPEWRITER LOGIC ---

	// Helper: type a single string into an element with per-character delay
	async function typeSingle(text, element, charDelay = 15) {
		for (let c = 0; c < text.length; c++) {
			element.innerHTML += text.charAt(c);
			await new Promise(r => setTimeout(r, charDelay));
		}
	}

	// Helper: type multiple texts sequentially into the same element
	async function typewriteMultiple(texts, element, options = {}) {
		const { charDelay = 15, betweenDelay = 250 } = options;
		for (let i = 0; i < texts.length; i++) {
			// If not the first text, add a line break before the next block
			if (i > 0) element.innerHTML += "<br><br>";
			await typeSingle(texts[i], element, charDelay);
			// small pause between blocks so it feels natural
			if (i < texts.length - 1) await new Promise(r => setTimeout(r, betweenDelay));
		}
	}

// --- 7 & 8. SEQUENTIAL WINDOW CREATION + TYPEWRITER ---

isTyping = true;

player = await storage.loadPlayer(player.id);
const SKIP_TYPEWRITER = player?.data?.skip_typewriter ?? false;

for (let i = 0; i < dialogGroups.length; i++) {

    // 1. Create window only now
    const win = createDialogWindow(dialogGroups[i], i);
    container.appendChild(win);

    // 2. Get the typewriter target
    const target = document.getElementById(`typewriter-${i}`);
    if (!target) continue;

    target.innerHTML = "";

    const texts = dialogGroups[i].texts || [];

    // 3. Typewriter or instant text
    if (SKIP_TYPEWRITER) {
        target.innerHTML = texts.join("<br><br>");
    } else {
        await typewriteMultiple(texts, target, { charDelay: 15, betweenDelay: 250 });
    }

    // 4. After finishing this window, the next one will appear
}

isTyping = false;

    // --- 9. RENDER CHOICES ---
    choiceContainer.innerHTML = '';

	if (scene.interaction_type === "next") {
		const nextTarget = resolveNextTarget(scene, player);
		createBtn("NEXT >>", nextTarget);
		return;
	}


    // --- 10. PROCESS OPTIONS (ALL YOUR ORIGINAL LOGIC) ---
// --- 10. FILTER AND RENDER OPTIONS ---

if (scene.options?.length) {

    // Filter conditional options BEFORE creating any UI.
    const availableOptions =
        await getAvailableOptions(scene.options);

    // Create all visible options.
    // Disabled options are still shown.
    for (const opt of availableOptions) {

        createBtn(
            opt.text,
            opt.target_id,
            opt.color,
            opt.disabled === true,
            opt.frustration_text,
            opt.shadow
        );
    }

    // All buttons now exist.
    // Position the dialog once.
    requestAnimationFrame(() => {
        adjustDialogContainer();
    });
}
}

function adjustDialogContainer() {
    const container = document.getElementById("m-dialog-container");
    const choiceContainer = document.getElementById("m-choices-container");

    // Example: push dialog container upward so choices are always visible
    const choiceHeight = choiceContainer.offsetHeight;

    container.style.marginBottom = (choiceHeight - 25) + "px";
}

async function optionConditionMet(opt) {

    // No condition = always visible
    if (!opt.condition) {
        return true;
    }

    const c = opt.condition;

    // --- TRAIT ---
    if (c.type === "trait") {
        if (Array.isArray(c.value)) {
            return c.value.some(t => partyHasTrait(t));
        }

        return partyHasTrait(c.value);
    }

    // --- TRAIT NOT ---
    if (c.type === "trait_not") {
        return !partyHasTrait(c.value);
    }

    // --- ALIGNMENT ---
    if (c.type === "alignment") {
        return members.some(m => m.alignment === c.value);
    }

    // --- ALIGNMENT NOT ---
    if (c.type === "alignment_not") {
        return !members.some(m => m.alignment === c.value);
    }

    // --- RACE ---
    if (c.type === "race") {
        const races =
            player?.missions?.current_mission?.summary?.races || [];

        return races.includes(c.value);
    }

    // --- DIRECT MISSION VALUE ---
    // Example:
    // player.missions.dwood_1 === 5
    if (c.type === "mission_value") {

        const actual =
            player?.missions?.[c.mission] ?? 0;

        if (c.operator === "==") return actual === c.value;
        if (c.operator === "!=") return actual !== c.value;
        if (c.operator === ">")  return actual > c.value;
        if (c.operator === ">=") return actual >= c.value;
        if (c.operator === "<")  return actual < c.value;
        if (c.operator === "<=") return actual <= c.value;

        return false;
    }

    // --- NESTED MISSION KEY ---
    // Example:
    // player.missions.green_2keys.shrine === 3
    if (c.type === "mission_key") {

        const keys =
            player?.missions?.[c.mission] || {};

        const actual =
            keys[c.key] ?? 0;

        if (c.operator === "==") return actual === c.value;
        if (c.operator === "!=") return actual !== c.value;
        if (c.operator === ">")  return actual > c.value;
        if (c.operator === ">=") return actual >= c.value;
        if (c.operator === "<")  return actual < c.value;
        if (c.operator === "<=") return actual <= c.value;

        return false;
    }

    // --- SILVER ---
    if (c.type === "silver") {

        const silver =
            player?.missions?.current_mission?.satchel?.silver ?? 0;

        return silver >= c.value;
    }

    // --- COUNTERFEIT ELECTRUM ---
    if (c.type === "counterfeit_electrum") {

        const counterfeit =
            player?.treasury?.counterfeit_electrum ?? 0;

        return counterfeit >= c.value;
    }

    // --- ELECTRUM ---
    if (c.type === "electrum") {

        try {

            const coins = await getActiveCoins(player.id);

            return coins && coins.length >= c.value;

        } catch (err) {

            console.error("Failed to get active coins:", err);

            return false;
        }
    }

    console.warn("Unknown option condition:", c);

    return false;
}

async function getAvailableOptions(options) {

    const availableOptions = [];

    for (const opt of options || []) {

        // Conditions control visibility.
        // DO NOT filter out disabled options.
        if (!(await optionConditionMet(opt))) {
            continue;
        }

        availableOptions.push(opt);
    }

    return availableOptions;
}

function resolveNextTarget(scene, player) {
    // If no branching rules exist, return default
	  // "branches": [
		// {
		  // "condition": "party_member",
		  // "value": "Adv_Tonica",
		  // "target": "Mission0101"
		// }]

    if (!scene.branches || scene.branches.length === 0) {
        return scene.target_id;
    }

    for (const branch of scene.branches) {

        switch (branch.condition) {

            case "party_member":
				// get location of adv_[branch.value]
				// equal it to current_party: "party_A"
				current_party = player.missions.current_mission.current_party
				PartyMembers = getPartyMembers(current_party) 
				const names = PartyMembers.map(m => m.name)
				console.log(names, branch.value);
					if (names.includes(branch.value)) {
						console.log(names, branch.target_id);
					return branch.target_id;}
                break;

            case "flag":
                if (player.flags[branch.value] === true) {
                    return branch.target_id;
                }
                break;

            case "variable_equals":
                if (player.vars[branch.value.name] === branch.value.equals) {
                    return branch.target_id;
                }
                break;

            // Add more condition types here
        }
    }

    // Fallback
    return scene.target_id;
}

function typewriteMultiple(texts, elementId, callback) {
    let i = 0;

    function next() {
        if (i >= texts.length) {
            callback && callback();
            return;
        }

        typewriter(texts[i], elementId, () => {
            i++;
            next();
        });
    }

    next();
}


function renderMissionOptions(mission) {
    const partyTraits = allPartyTraits(mission);

    return mission.options
        .map(opt => {
            // Hidden option logic
            if (opt.hidden && opt.requiresTrait) {
                const hasTrait = partyTraits.includes(opt.requiresTrait);

                if (!hasTrait) {
                    return ""; // Trait not present → do not show
                }

                // Trait present → reveal hidden option with special color
                return `
                    <div class="mission-option hidden-option" style="color:${opt.color || '#ff00ff'}">
                        ${opt.text}
                    </div>
                `;
            }

            // Normal option
            return `
                <div class="mission-option">
                    ${opt.text}
                </div>
            `;
        })
        .join("");
}


let frustrationTimeout; // Keep track of the timer globally

function createBtn(
    text,
    targetId,
    color = null,
    isDisabled = false,
    frustrationText = "",
    shadow = null
) {

    const btn = document.createElement('button');

    btn.className = 'm-btn';
    btn.innerText = text;

    if (color) {
        btn.style.color = color;
        btn.style.borderColor = color;
        btn.style.boxShadow = `inset 0 0 5px ${color}44`;
    }

    if (shadow) {
        btn.style.textShadow = shadow;
    }

    btn.onclick = () => {

        if (isDisabled && frustrationText) {

            // Find the currently visible dialog window
            const dialogs =
                document.querySelectorAll('#m-dialog-container .m-glass-panel');

            if (!dialogs.length) {
                console.warn("No dialog window found for frustration text.");
                return;
            }

            // Use the last dialog window
            const dialog =
                dialogs[dialogs.length - 1];

            const display =
                dialog.querySelector('.m-frustration-display');

            if (!display) {
                console.warn("Frustration display not found.");
                return;
            }

            clearTimeout(frustrationTimeout);

            display.innerText = frustrationText;
            display.style.display = 'block';

            frustrationTimeout = setTimeout(() => {
                display.innerText = "";
                display.style.display = 'none';
            }, 3000);

            return;
        }

        renderScene(targetId);
    };

    document
        .getElementById('m-choices-container')
        .appendChild(btn);
}
// Add this helper function to show the text briefly
function showTemporaryMessage(text) {
    const container = document.getElementById('m-dialog-container');
    if (!container) return;

    // Find the last dialog window (the most recent one)
    const dialogWindows = container.querySelectorAll('.m-glass-panel');
    const lastWindow = dialogWindows[dialogWindows.length - 1];
    if (!lastWindow) return;

    // Create the popup message
    const msg = document.createElement('div');
    msg.className = 'm-frustration-popup';
    msg.innerText = text;

    // Style it
    msg.style.color = '#ff4444';
    msg.style.padding = '10px';
    msg.style.marginTop = '10px';
    msg.style.fontStyle = 'italic';

    // Append to the last dialog window
    lastWindow.appendChild(msg);

    // Auto-remove after 3 seconds
    setTimeout(() => msg.remove(), 3000);
}


// 3. THE TRIGGER FUNCTION
// Call this function from your own code to start the system
async function startMissionSystem(specificSceneId = null) {
    try {
        if (!db) await initDB();
        
        const response = await fetch('missions.json');
        if (!response.ok) throw new Error("missions.json not found");
        storyData = await response.json();

        // If you pass a scene ID, it starts there. Otherwise, it loads saved progress.
        const startScene = specificSceneId || await getSavedProgress();
        renderScene(startScene);
    } catch (err) {
        console.error("Mission System Error:", err);
    }
}

// const missionLabels = {
	// green_1: "Tutorial in the Green Pastures",
	// green_2: "Travelling to Townshop Tavern",
	// green_3: "Entering the Dark Forest",
	// dwood_1: "In the Dark Forest"
// };

function addSilver(number, container) {
    // Convert string numerals to actual numbers
    const amount = Number(number);

    // Fail if conversion didn't produce a valid number
    if (!Number.isFinite(amount)) {
        console.warn("addSilver failed: 'number' must be a valid numeral.");
        return;
    }

    // --- STASH ---
    if (container === "stash") {
        player.treasury ??= {};
        player.treasury.silver ??= 0;

        player.treasury.silver += amount;
        return;
    }

    // --- SATCHEL ---
    if (container === "satchel") {
        player.missions ??= {};
        player.missions.current_mission ??= {};
        player.missions.current_mission.satchel ??= {};
        player.missions.current_mission.satchel.silver ??= 0;

        player.missions.current_mission.satchel.silver += amount;
        return;
    }

    console.warn("addSilver failed: container must be 'stash' or 'satchel'.");
}

function addCounterfeitElectrum(number) {
    // Convert string numerals to actual numbers
    const amount = Number(number);

    // Fail if conversion didn't produce a valid number
    if (!Number.isFinite(amount)) {
        console.warn("addCounterfeitElectrum failed: 'number' must be a valid numeral.");
        return;
    }

	player.treasury ??= {};
	player.treasury.counterfeit_electrum ??= 0;

	player.treasury.counterfeit_electrum += amount;
	console.log(player.treasury.counterfeit_electrum, number)
	return;
}

async function handleMissionEnd(sceneId) {
	
	// any "END" scene will end even without any notices after playing.
	//const missionLabel = missionLabels[key] || key;
	const viewport = document.getElementById('m-viewport');
	if (viewport) {
		viewport.style.display = 'none';
	}  
	
    // 1. Identify "Full Return" points vs "Mid-Mission" points
    const campaignEndScenes = ["tutor1_110", "green1_056END", "tutor2_118END"];
    const isCampaignEnd = campaignEndScenes.includes(sceneId);

    const endings = {
// --- TUTORIAL 1 ---

"tutor1_110": async () => {

    // Load player (async)
    player = await storage.loadPlayer(player.id);
	
    player.treasury ??= {};
    player.treasury.silver ??= {};
    player.treasury.silver = 10
	
	console.log("LOREDATA CHECK:", Object.keys(loreData.Adventurer));
    // Ensure mission structure exists
    player.missions ??= {};
    player.missions.current_mission ??= {};
    player.missions.current_mission.party ??= {};

    player.missions.tutorial = 1;
    player.missions.green_1 = 1;

    // RECRUIT — these MUST be awaited because they save to storage
    await recruitAdventurer("adv_Hogperson");
    await recruitAdventurer("adv_Bragain");
    await recruitAdventurer("adv_Claudio");
    await recruitAdventurer("adv_Amyssa");
    player.patrons.adv_Bragain.location = 3;
    player.patrons.adv_Hogperson.location = 3;
    player.patrons.adv_Claudio.location = 0;

    player.missions.current_mission.current_party = "party_A";
    player.missions.current_mission.id = "green_1";

    const partyKey = player.missions.current_mission.party;
    buildPartyTraits(partyKey);
    buildPartySummary(partyKey);

    Journal.addEntry("You've purchase yourself a Tavern.");
    Journal.addEntry("You've signed a contract with the government and recieved your Adventurers' Guild Licence.");
    Journal.addEntry("You've recruited Hogperson, Bragain and Claudio.");

    // XP — if this function writes to storage, it MUST be awaited
    await awardManualXP(["Bragain", "Claudio", "Hogperson", "Amyssa"], 800);

    player.patrons.adv_Amyssa.status = "applicant";

    await loadPage("missions");
},


        // --- GREEN 1 ARC (ALL STAGES) ---
        "green1_008END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 2;
            player.patrons.adv_Bragain.location = 3;
            player.patrons.adv_Hogperson.location = 3;
            player.patrons.adv_Claudio.location = 0;
            Journal.addEntry("You've agreed to head towards a stash of coins.");
            loadPage("mission_green_1");
        },
        "green1_019END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 3;
            Journal.addEntry("In the nearby green pastures, you've smashed a rock to bits.");
			awardManualXP("Bragain", 50);
            loadPage("mission_green_1");
        },
        "green1_025END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 4;
            Journal.addEntry("You've cheered up a wandering traveler.");
			awardManualXP("Hogperson", 50);
            loadPage("mission_green_1");
        },
		"green1_502end": async () => {
			player.missions.green_1 = 6;
			launchBattle("tutor_test", () => {
				loadPage("mission_green_1");
			});
		},

        "green1_502endskip": async () => {
            player.missions.green_1 = 6;
            loadPage("mission_green_1");
        },
        "green1_048END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 5;
            player.patrons.adv_Claudio.location = 3;
			const partyKey = player.missions.current_mission.party;
			buildPartySummary(partyKey);
            buildPartyTraits(partyKey);
			setPartyStatus(partyKey, "mission")
            Journal.addEntry("You've successfully demoralized a band of Koboldogs.");
            Journal.addEntry("You've saved Claudio from a slaver's cage.");
			awardManualXP(["Bragain", "Claudio", "Hogperson"], 150);
			
            loadPage("mission_green_1");
        },
        "green1_056END": async () => {
            player = await storage.loadPlayer(player.id);
			player.treasury ??= {};
			player.treasury.silver ??= {};
			player.treasury.silver = 50
            player.missions.green_1 = 6;
            Journal.addEntry("You've found 50 silver coins and returned to the guild.");
			endMission();
            loadPage("tavern");
        },

        // --- TUTORIAL 2 / GREEN 2 START ---
        "tutor2_118END": async () => {
            await addMail({
                id: crypto.randomUUID(),
                from: "Hogmother",
                subject: "Dad update",
				body: "My Dear Hoggy!\n\nYour father has gone missing! He went out to work and never came back.\n\nI'll be travelling to the Township Tavern to gather information and post a missing fliar hoping to recruit investigators to try and find him.\n\nI wish you the best my precious Hoggy\nI'm so proud of you!\nLove and kisses\nHogmother XOXO",
                timestamp: Date.now(),
                image: "assets/missions/hogmother_letter.jpg"
            });
            player = await storage.loadPlayer(player.id);
            player.missions.tutorial = 2; 
            player.missions.green_1 = 7;
            player.missions.green_2 ??= 0;
            player.patrons.adv_Amyssa.status = "idle";
			recruitRandoms();
            Journal.addEntry("You've recruited Amyssa to sign a 25 silver coins contract.");
            loadPage("tavern");
        },
        "green2_008end": async () => {
            player.missions.green_2 = 1;
            Journal.addEntry("You've decided to travel to the Township Tavern and meet up with Hogmother.");
            loadPage("missions");
        },
        "green2_*101end": async () => {
            //player.missions.green_2 = 1;
            //Journal.addEntry("You've decided to travel to the Township Tavern and meet up with Hogmother.");
            let CR = calculatePartyCR();
			CR = Math.round(CR);
			const num = Math.floor(Math.random() * 10) + 1;
			const result = CR * num;
			addSilver(result, "satchel")
			loadPage("mission_green_2");
			const message = `You've picked up ${result} silver coins.`;
			pushStatus(message);
        },
		"green2_117end": async () => {
            player.missions.green_2 = 2;
            player.patrons.adv_Amyssa.location = 3;
            player.patrons.adv_Amyssa.status = "mission";
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            Journal.addEntry(`Amyssa has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`);
            loadPage("mission_green_2");
        },
        "green2_*1_202end": async () => {
			launchBattle("g2_reddeer");
        },
		"green2*1_2103end": async () => {
			const App = findMemberTrait("Appraisal");   // returns an array of names

			// If you expect only ONE member, take the first:
			const memberName = App[0];
			
			console.log(memberName);
			const checkAppraisal = rollSkillCheck(memberName, charisma, yes, 18)
			// Hydrate the adventurer by name
			// const patron = getHydratedAdventurer(memberName);

			// Get charisma modifier
			// const Cha = patron.charisma_mod;

			// Get proficiency bonus
			// const prof = getProficiencyBonus(patron);

			// Roll a d20
			// const roll = Math.ceil(Math.random() * 20);

			// const result = roll + Cha + prof;


			// Compare result
			// if (result >= 18) {
			if (checkAppraisal.success) {

				// Roll a d100
				const roll2 = Math.ceil(Math.random() * 100);

				if (roll2 >= 99) {
					runMission("green2*1_2107*");   // must be a string
				} else {
					runMission("green2*1_2107");
				}
			} else {
				loadPage("mission_green_2");
			}
		},

		"green2*1_2107end": async () => {
			const gem = generateGem(count = 1, rarity = null, color = null, cutShape = "raw")
			player.missions.current_mission.satchel.push(gem);
			await loadPage("mission_green_2");
			pushStatus(`You obtained a ${gem.cut !== "raw" ? gem.cut + "‑cut " : ""}${gem.color} ${gem.name} (${gem.rarity}). Value: ${gem.finalValue}.`);

		},
		"green2*1_2107*end": async () => {
			const gem = generateGem(count = 1, rarity = null, color = null, cutShape = "yes")
			player.missions.current_mission.satchel.push(gem);
			await loadPage("mission_green_2");
			pushStatus(`You obtained a ${gem.cut !== "raw" ? gem.cut + "‑cut " : ""}${gem.color} ${gem.name} (${gem.rarity}). Value: ${gem.finalValue}.`);
		},
		"green2*4end": async () => {
			// unlocking shrine			
            Journal.addEntry(`the ${player.data.party_A} have taken a detour from their way to ${player.missions.current_mission.id} towards a Shrine.`);

			player.missions.green_2keys ??= {};
			player.missions.green_2keys.path2 ??= {};
			player.missions.green_2keys.path2 = 1;

            player.missions.green_2 += 1;
			loadPage("mission_green_2");

		},
		"green2*5end": async () => {
			// skipping shrine, moving on as usual green_2
            player.missions.green_2 += 1;
			loadPage("mission_green_2");
		},
		"greenshrine1_106end": async () => {
			player.missions.green_2keys.shrine = 1;
			Journal.addEntry(`the ${player.data.party_A} have located an odd standing statue in the Shrine.`);

            player.missions.green_2 += 1;
			loadPage("mission_green_2");
		},
		"greenshrine1_209end": async () => {
			player.missions.green_2keys.shrine = 2;
			Journal.addEntry(`the ${player.data.party_A} have resolved the standing statue in the Shrine might be a petrified person.`);

			loadPage("mission_green_2");
		},
		"greenshrine1_211aend": async () => {
			Journal.addEntry(`the ${player.data.party_A} have paid an Electrum coin to Obtain ingredients for scribing a Remove Petrification scroll, allowing Amyssa to scribe the desired scroll..`);

			const user = player.id;
			const note = "Obtain ingredients for scribing a Remove Petrification scroll";

			console.log("Sending note: frontend ", note);
			await spendCoins(user, 1, note);
			
			player.missions.current_mission.satchel ??= {};
			player.missions.current_mission.satchel["Remove Petrification Scroll"] ??= 0;
			player.missions.current_mission.satchel["Remove Petrification Scroll"] += 1;
			player.missions.green_2keys.shrine = 2;
		},
		"greenshrine1_211bend": async () => {
			Journal.addEntry(`the ${player.data.party_A} have paid a counterfeit Electrum coin to Obtain ingredients for scribing a Remove Petrification scroll, allowing Amyssa to scribe the desired scroll..`);
			await addCounterfeitElectrum(-1)
			player.missions.current_mission.satchel ??= {};
			player.missions.current_mission.satchel["Remove Petrification Scroll"] ??= 0;
			player.missions.current_mission.satchel["Remove Petrification Scroll"] += 1;

			player.missions.green_2keys.shrine = 2;
		},
		"greenshrine1_211cend": async () => {
			Journal.addEntry(`the ${player.data.party_A} have paid 250 silver coins to Obtain ingredients for scribing a Remove Petrification scroll, allowing Amyssa to scribe the desired scroll..`);
			await addSilver(-250, "satchel");
			player.missions.current_mission.satchel ??= {};
			player.missions.current_mission.satchel["Remove Petrification Scroll"] ??= 0;
			player.missions.current_mission.satchel["Remove Petrification Scroll"] += 1;
			player.missions.green_2keys.shrine = 2;
		},
		"greenshrine2_110end": async () => {
			player.missions.green_2keys.shrine = 3;
            player.missions.green_3 = 2;
			Journal.addEntry(`the ${player.data.party_A} have rescued Tonica from her petrified state, and she has joined the party.`);
			player.missions.current_mission.satchel["Remove Petrification Scroll"] -= 1;

			await recruitAdventurer("adv_Tonica");
			player.patrons.adv_Tonica.location = 3;
			player.patrons.adv_Tonica.status = "mission";
			loadPage("mission_green_3");
		},

        "green2_940a_end": async () => {
            player.missions.green_2 = 3;
            recruitAdventurer("adv_Hogmother");
			//awardManualXP("Hogmother", 2000);
            player.patrons.adv_Hogmother.location = 3;
            player.patrons.adv_Hogmother.status = "mission";
			
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            Journal.addEntry(`You've met up with Hogmother and she has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`);
            loadPage("mission_green_2");
        },

        // --- THE "BRANCHING" TRANSITION YOU WROTE ---
        "green2_945b_end": async () => {
            player.missions.green_2 = 3;
            player.missions.green_3 = 1;
            player.missions.current_mission.id = "green_3";
            player.missions.current_mission.locked_mission = "green_3";
            player.missions.current_mission.page = "mission_green_3";
            recruitAdventurer("adv_Lurch");
			//awardManualXP("Lurch", 2000);
            player.patrons.adv_Lurch.location = 9;
            player.patrons.adv_Lurch.status = "secret";
			
            recruitAdventurer("adv_Hogmother");
			//awardManualXP("Hogmother", 2000);
            player.patrons.adv_Hogmother.location = 3;
            player.patrons.adv_Hogmother.status = "mission";
            
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
			
			Journal.addEntry(
				`You've met up with Hogmother and she has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`
			);
			Journal.addEntry(
				`You've dealt with Lurch who has agreed on to spy for the ${player.data.party_A} and meet them later as they make their own way to ${player.missions.current_mission.id}.`
			);
			
            loadPage("mission_green_3");
        },

        // --- GREEN 3 / DEEPWOOD TRANSITION ---
        "green3_243END": async () => {
            player.missions.green_3 = 3;
            player.missions.dwood_1 = 0;
            player.missions.current_mission.id = "dwood_1";
            player.missions.current_mission.locked_mission = "dwood_1";
            player.missions.current_mission.page = "mission_dwood_1";
            recruitAdventurer("adv_Awetruce");
            player.patrons.adv_Awetruce.location = 6;
            player.patrons.adv_Awetruce.status = "mission";
            recruitAdventurer("adv_Finnick");
			
            player.patrons.adv_Finnick.location = 3;
            player.patrons.adv_Finnick.status = "mission";
            
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            Journal.addEntry(`You've met with Awetruce who have agreed to overwatch you in the dark woods.`);
            Journal.addEntry(`You've met with Finnick the Young who joined the ${player.data.party_A}`);
            loadPage("mission_dwood_1");
        },

        // --- DEEPWOOD CONTENT ---
        "dwood1_181end": async () => {
            player.missions.dwood_1 = 2;
            Journal.addEntry("You've been approched by the vile Trollkin, and Amyssa lost her spellbook.");
            recruitAdventurer("adv_Trollkin");
            player.patrons.adv_Trollkin.location = 0;
            player.patrons.adv_Trollkin.status = "rival";
            loadPage("mission_dwood_1");
        },
		
        "dwood1_219end": async () => {
            player.missions.dwood_1 = 3;
			//player.missions.dwood_fort2 = 0;
            Journal.addEntry("Claudio and Finnick have decided to outsmart the Trollkin and manipulate the Spellbook out of him.");
			// change Claudio portrait.
            // change Amyssa portrait.
            loadPage("mission_dwood_1");
        },
		
        "dwood1_310end": async () => {
            player.missions.dwood_1 = 4;
            //Journal.addEntry(".");
            loadPage("mission_dwood_1");
        },

        "dwoodswamp1_127end": async () => {
            player.missions.dwood_1 = 5;
            //player.missions.dwood_fort2 = 0;
            Journal.addEntry("You've successfully seduced and robbed the Trollkin out of Amyssa's Spellbook.");
            loadPage("mission_dwood_1");
        },

        "dwoodplat1_104end": async () => {
			
            loadPage("mission_dwood_1");
		},

        "dwoodplat1_105end": async () => {
            Journal.addEntry("Awotruce have agreed to participate in the slaying of the Ugress.");
            player.missions.dwood_fort1 = 2;
            loadPage("mission_dwood_1");
		},

        "dwoodglade_110end": async () => {
            Journal.addEntry("You've met with your contact Lurch who have filled you in on the inside details from the fort: The Ugress has taken control of the place, the garrison is preparing for war, and there are folk with them.");
            player.missions.dwood_fort2 = 1;
            loadPage("mission_dwood_1");
		},

        "dwoodfort2_102end": async () => {
            Journal.addEntry("You've inspected the sewers downfall, at the fortress.");
            player.missions.dwood_fort1 = 3;
            loadPage("mission_dwood_1");
		},

        "dwoodfort1_301end": async () => {
            Journal.addEntry("You've started a bushfire, in front of the fortress.");
            player.missions.dwood_fort2 = 2;
            loadPage("mission_dwood_1");
		},

        "dwoodfort2_223end": async () => {
            Journal.addEntry("You've emerged out in the Fortress of the Ugress from the sewers, and is ready to face her.");
            player.missions.dwood_fort2 = 3;

			launchBattle("forest_mix3", () => {
				loadPage("mission_dwood_1");
			});
		},

        "dwoodfort3_124end": async () => {
            Journal.addEntry("You've faced the Ugress, killing her.");
            Journal.addEntry("Awetruce has died, fighting the Ugress.");
            Journal.addEntry("Marlnus has joined up with you.");
            Journal.addEntry("Finnick has returned to his village.");
            player.missions.dwood_fort2 = 4;
            player.patrons.adv_Finnick.location = 0;
            player.patrons.adv_Finnick.status = "applicant";
            player.patrons.adv_Lurch.location = 0;
            player.patrons.adv_Lurch.status = "applicant";
            player.patrons.adv_Awetruce.location = 0;
            player.patrons.adv_Awetruce.status = "dead";
            player.patrons.adv_Wormtail.location = 0;
            player.patrons.adv_Wormtail.status = "applicant";
            recruitAdventurer("adv_Hogfather");
            recruitAdventurer("adv_Marlnus");
			endMission();
            loadPage("tavern");
		}
    };

    if (endings[sceneId]) {
        await endings[sceneId]();  
        // Finalized Global Cleanup
        if (isCampaignEnd) {
            endMission(); // Triggers your location/party resets
            if (typeof db !== 'undefined') {
                const tx = db.transaction("gameState", "readwrite");
                tx.objectStore("gameState").clear();
            }
            const viewport = document.getElementById('m-viewport');
            if (viewport) viewport.style.display = 'none';
        }

        if (typeof player !== 'undefined' && typeof storage !== 'undefined') {
			
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            await storage.savePlayer(player);
			player = await storage.loadPlayer(player.id);
        }
        return true;
    }
    return false;
}

// Dummy placeholder to prevent the crash you were seeing earlier
function resetPartyTraits() {
    console.log("Party traits reset.");
}

function endMission() {
    const partyKey = player.missions.current_mission.party;;

    if (!partyKey) {
        console.warn("endMission called with empty partyKey");
        return;
	}
    
    const locationValue = {
        "party_A": 3,
        "party_B": 4,
        "party_C": 5
    }[partyKey];
	setPartyStatus(partyKey, "idle")

    // Remove dynamic location from all patrons in this party
    if (locationValue !== undefined) {
        for (const [id, patron] of Object.entries(player.patrons)) {
            if (patron.location === locationValue) {
                delete patron.location; // ← forces fallback to loreData default
            }
        }
    }


    setPartyLock(false);
    player.missions.current_mission.active = false;
    player.missions.current_mission.page = null;
    player.missions.current_mission.locked_mission = "";
    player.missions.current_mission.synergyTraits = [];

    player.missions.current_mission.id = "";
    player.missions.current_mission.party = "";
}

function recruitRandoms() {

	recruitAdventurer("adv_Desmond");
	recruitAdventurer("adv_Tinman");
	recruitAdventurer("adv_Crusher");
	recruitAdventurer("adv_Wormtail");
	recruitAdventurer("adv_Aasibelle");


	player.patrons.adv_Desmond.status = "applicant";
	player.patrons.adv_Tinman.status = "applicant";
	player.patrons.adv_Crusher.status = "applicant";
	player.patrons.adv_Wormtail.status = "applicant";
	player.patrons.adv_Aasibelle.status = "applicant";
}