// --- Launcher for index.html ---

// --- 2. THE LISTENER (Battle -> Main Page) ---
window.addEventListener("message", (event) => {
    // Security: Ensure the message is from your battle engine
    if (event.data.type === "BATTLE_COMPLETE") {
        const results = event.data.result; // This is the PC array from battle.html

        // A. Sync results back to your player object
        results.forEach(pc => {
            const key = `adv_${pc.name}`;
            if (player.patrons[key]) {
                player.patrons[key].currentHP = pc.hp;
                // If HP is 0, you might want to change status to 'dead' or 'injured'
                if (pc.hp <= 0) player.patrons[key].status = 'injured';
            }
        });

        // B. CLEANUP (Crucial steps)
        localStorage.removeItem('currentBattle'); // Clear the "Battle Info" file
        
        const battleFrame = document.getElementById('battle-iframe');
        if (battleFrame) {
            battleFrame.remove(); // Remove the window if it was an iframe
        }

        // C. SAVE PROGRESS
        console.log("Battle synchronized. Saving player data...");
        // Call your existing Save/IDB function here
        // saveToIDB(player); 

        // Check if the parent and the Bus exist before calling
		if (window.parent && window.parent.Bus) {
			window.parent.Bus.emit('LOG', "The party has returned from combat.");
		} else {
			console.error("Could not find the Event Bus on the parent window.");
		}
		}
});

// Example function to start a fight
// function launchBattle(encounterData) {
    // localStorage.setItem('currentBattle', JSON.stringify(encounterData));
   //Redirect or show the battle iframe
    // window.location.href = "battle.html"; 
// }
// At the top of battlelauncher.js
const Bus = window.parent.Bus;

// Now your old code works again!
if (Bus) {
    Bus.emit('LOG', "The party has returned from combat.");
}

// In index.html - Make sure it looks like this!
window.Bus = { 
    events: {},
    on(event, cb) { /* ... */ },
    emit(event, data) { 
        /* ... your existing emit code ... */
        console.log("Main Page Bus received:", event, data);
    }
};

// Example Bestiary in your Parent code
const EncounterTemplates = {
    "tutor_test": [
        { name: 'Animated Bush', type: 'monster', hp: 4, maxHp: 4, x: 8, y: 4, color: '#e67e22', icon: 'assets/missions/monster_token.png', speed: 6, hasAction: false },
        { name: 'Animated Bush', type: 'monster', hp: 4, maxHp: 4, x: 8, y: 6, color: '#e67e22', icon: 'assets/missions/monster_token.png', speed: 6, hasAction: false }
    ],
    "tutor_test2": [
        { name: 'Ogre', type: 'monster', hp: 20, maxHp: 20, x: 7, y: 5, color: '#c0392b', icon: 'assets/missions/monster_token.png', speed: 4, hasAction: false }
    ]
};

const MAP_DATABASE = {
    "green_1": {
        url: "assets/mission/combat_green_1.png",
        obstacles: [{x: 2, y: 2}, {x: 2, y: 3}] // Trees/Rocks
    },
    "green_2": {
        url: "assets/mission/combat_green_1.png",
        obstacles: [{x: 4, y: 4}, {x: 4, y: 5}, {x: 5, y: 4}] // Center Wall
    }
};

//launchBattle("tutor_test");
function launchBattle(encounterKey) {
    const missionId = player.missions.current_mission.id; // e.g., "green_2"
    const monsterEncounter = EncounterTemplates[encounterKey]; // Pull from Bestiary
	const mapConfig = MAP_DATABASE[missionId] || MAP_DATABASE["green_1"]; // Fallback if ID missing


    const missionParty = [];
    const missionLocation = 3; 
    // 4. Build Party using Hydration
    for (let key in player.patrons) {
        const patronData = player.patrons[key];

        if (patronData.location === missionLocation) {
            // Use your specific hydration function for final stats
            const hydrated = getHydratedAdventurer(key); 

			missionParty.push({
				name: hydrated.name,
				type: 'pc',
				icon: hydrated.icon,
				hp: hydrated.currentHP,
				maxHp: hydrated.MaxHP,
				// --- NEW DATA INJECTION ---
				race: hydrated.race,
				role: hydrated.role,
				level: hydrated.level,
				// Full Stats
				stats: {
					str: hydrated.strengh_mod,
					dex: hydrated.Dexterity_mod,
					wis: hydrated.wisdom_mod,
					int: hydrated.intelligence_mod,
					cha: hydrated.charisma_mod
				},
				traits: hydrated.trait || [],
				inventory: hydrated.inventory || [],
				// --------------------------
				ac: hydrated.AC,
				x: 1, 
				y: 2 + missionParty.length,
				speed: hydrated.speed || 6,
				maxMove: hydrated.speed || 6,
				hasAction: true
			});
        }
    }

    const payload = {
        party: missionParty,
        monsters: monsterEncounter,
        missionId: missionId, // This tells the child which map to load
        // Pass the specific obstacles for THIS map
        obstacles: mapConfig.obstacles 
    };

    localStorage.setItem('currentBattle', JSON.stringify(payload));
    openBattleOverlay();
	
    // --- OVERLAY LOGIC ---
    let overlay = document.getElementById('battle-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'battle-overlay';
        // Styles to make it cover the whole screen
        overlay.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:10000; background:#000; display:block;";
        overlay.innerHTML = `<iframe id="battle-frame" src="battle.html" style="width:100%; height:100%; border:none;"></iframe>`;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "block";
        document.getElementById('battle-frame').src = "battle.html";
    }
}

function openBattleOverlay() {
    // Create the overlay div if it doesn't exist
    let overlay = document.getElementById('battle-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'battle-overlay';
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:10000; background:#000;";
        overlay.innerHTML = `<iframe id="battle-frame" src="battle.html" style="width:100%; height:100%; border:none;"></iframe>`;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "block";
        document.getElementById('battle-frame').src = "battle.html";
    }
}

window.addEventListener("message", (event) => {
    // Only respond to our specific battle signal
    if (event.data && event.data.type === "BATTLE_COMPLETE") {
        console.log("Battle Victory received. Closing overlay...");
        
        // 1. Hide the overlay
        const overlay = document.getElementById('battle-overlay');
        if (overlay) overlay.style.display = "none";
        
        // 2. Clear the iframe source to stop any background sounds/logic
        const frame = document.getElementById('battle-frame');
        if (frame) frame.src = "";

        // 3. Update your parent data
        // Since child saved to IDB, we just need to refresh our local player object
        if (typeof syncDataFromIDB === "function") {
            syncDataFromIDB();
        }
    }
});

