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
async function renderScene(sceneId) {
    if (isTyping) return;
// 1. FIND SCENE DATA
    const scene = storyData.find(s => s.id === sceneId);
	console.log(sceneId)
    // 2. VALIDATE SCENE EXISTS
    if (!scene) {
        console.error("Scene not found:", sceneId);
        pushStatus(`Error: Scene ${sceneId} not found.`);
        return;
    }
    // 3. CHECK IF THIS SCENE IS AN ENDING
    // This catches scenes like tutor2_118 that point to "END"
    if (scene.target_id === "END") {
        await handleMissionEnd(scene.id);
        return;
    }

    // --- 3. DOM ELEMENTS CHECK ---
    const viewport = document.getElementById('m-viewport');
    const dialogBox = document.getElementById('m-dialog-box');
    const choiceContainer = document.getElementById('m-choices-container');

    if (!viewport || !dialogBox || !choiceContainer) {
        console.error("renderScene Error: UI elements not found in DOM.");
        return;
    }

    // Handle unknown scene ID
    if (!scene) {
        dialogBox.innerHTML = `Error: Scene ${sceneId} not found in JSON.`;
        return;
    }

    // --- 4. SETUP ---
    await saveProgress(sceneId);
    viewport.style.display = 'block';
    dialogBox.className = `m-glass-panel m-side-${scene.side}`;
    
    dialogBox.innerHTML = `
        ${scene.portrait ? `<img src="${scene.portrait}" class="m-portrait" onerror="this.src='https://placeholder.com'">` : ''}
        <div class="m-text-area">
            ${scene.speaker ? `<div class="m-speaker-name">${scene.speaker}</div>` : ''}
            <div id="m-typewriter-container"></div>
            <div id="m-frustration-display" style="color: PaleTurquoise; margin-top: 10px; font-style: italic;"></div>
        </div>
    `;

// --- 5. TYPEWRITER EFFECT ---
    const typeTarget = document.getElementById('m-typewriter-container');
    if (typeTarget) {
        isTyping = true;
        typeTarget.innerHTML = "";


        player = await storage.loadPlayer(player.id);
		// Now read the updated value
		const SKIP_TYPEWRITER = player?.data?.skip_typewriter ?? false;
        if (SKIP_TYPEWRITER) {
            // INSTANT MODE
            typeTarget.innerHTML = scene.dialog;
        } else {
            // NORMAL SPEED MODE
            for (let i = 0; i < scene.dialog.length; i++) {
                typeTarget.innerHTML += scene.dialog.charAt(i);
                await new Promise(r => setTimeout(r, 25));
            }
        }
        isTyping = false;
    }

    // --- 6. RENDER BUTTONS ---
    choiceContainer.innerHTML = '';
    if (scene.interaction_type === "next") {
        createBtn("NEXT >>", scene.target_id);
    } else if (scene.options) {
		scene.options.forEach(opt => {
			let isDisabled = false;

			// Condition: requires a trait
			if (opt.condition) {
				if (Array.isArray(opt.condition)) {
					// ANY of the traits must be present
					const hasAny = opt.condition.some(t => partyHasTrait(t));
					if (!hasAny) isDisabled = true;
				} else {
					// Single trait
					if (!partyHasTrait(opt.condition)) isDisabled = true;
				}
			}

			// Condition: must NOT have a trait
			if (opt.condition_not) {
				if (partyHasTrait(opt.condition_not)) {
					isDisabled = true;
				}
			}

			// Respect explicit disabled flag from JSON
			if (opt.disabled === true) {
				isDisabled = true;
			}

			if (opt.condition_alignment) {
				const hasAlignment = members.some(m => m.alignment === opt.condition_alignment);
				if (!hasAlignment) isDisabled = true;
			}

			if (opt.condition_not_alignment) {
				const hasAlignment = members.some(m => m.alignment === opt.condition_not_alignment);
				if (hasAlignment) isDisabled = true;
			}

			// "condition_mission": { "dwood_1": 4 }
			// Condition: requires mission stage

			

			createBtn(opt.text, opt.target_id, opt.color, isDisabled, opt.frustration_text, opt.shadow);
		});

		
		
		
		
		
    }
}
let frustrationTimeout; // Keep track of the timer globally

function createBtn(text, targetId, color = null, isDisabled = false, frustrationText = "", shadow = null) {
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
            const display = document.getElementById('m-frustration-display');
            clearTimeout(frustrationTimeout);
            display.innerText = frustrationText;
            frustrationTimeout = setTimeout(() => {
                display.innerText = "";
            }, 3000);
        } else {
            renderScene(targetId);
        }
    };
    
    document.getElementById('m-choices-container').appendChild(btn);
}

// Add this helper function to show the text briefly
function showTemporaryMessage(text) {
    const dialogBox = document.getElementById('m-dialog-box');
    const msg = document.createElement('div');
    msg.className = 'm-frustration-popup';
    msg.innerText = text;
    
    // Style it so it overlays or sits below the main text
    msg.style.color = '#ff4444'; // Red for frustration
    msg.style.padding = '10px';
    msg.style.marginTop = '10px';
    msg.style.fontStyle = 'italic';
    
    dialogBox.appendChild(msg);
    
    // Remove it after 3 seconds
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

    loadPage("missions");
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
            Journal.addEntry("You've saved Claudio from a cage.");
			awardManualXP(["Bragain", "Claudio", "Hogperson"], 150);
			
            loadPage("mission_green_1");
        },
        "green1_056END": async () => {
            player = await storage.loadPlayer(player.id);
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
        "green2_240a_end": async () => {
            player.missions.green_2 = 3;
            recruitAdventurer("adv_Hogmother");
			awardManualXP("Hogmother", 2000);
            player.patrons.adv_Hogmother.location = 3;
            player.patrons.adv_Hogmother.status = "mission";
			
            
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            Journal.addEntry(`You've met up with Hogmother and she has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`);
            loadPage("mission_green_2");
        },

        // --- THE "BRANCHING" TRANSITION YOU WROTE ---
        "green2_245b_end": async () => {
            player.missions.green_2 = 3;
            player.missions.green_3 = 2;
            player.missions.current_mission.id = "green_3";
            player.missions.current_mission.locked_mission = "green_3";
            player.missions.current_mission.page = "mission_green_3";
            recruitAdventurer("adv_Lurch");
			awardManualXP("Lurch", 2000);
            player.patrons.adv_Lurch.location = 9;
            player.patrons.adv_Lurch.status = "secret";
			
            recruitAdventurer("adv_Hogmother");
			awardManualXP("Hogmother", 2000);
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
			
			awardManualXP("Finnick", 1000);
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

			launchBattle("forest_mix_test", () => {
				loadPage("mission_dwood_1");
			});
		},

        "dwoodfort2_324end": async () => {
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