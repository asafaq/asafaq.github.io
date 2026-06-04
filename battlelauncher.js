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
        
		const overlay = document.getElementById('battle-overlay');
		if (overlay) {
			overlay.remove();   // removes BOTH overlay + iframe
		}


        // C. SAVE PROGRESS
        console.log("Battle synchronized. Saving player data...");
        // Call your existing Save/IDB function here
        // saveToIDB(player); 
		// unimplements yet.
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

let BATTLE_DATA = null;

async function loadBattleData() {
    if (!BATTLE_DATA) {
        const res = await fetch("battle.json");
        BATTLE_DATA = await res.json();
    }
    return BATTLE_DATA;
}


//launchBattle("tutor_test");
async function launchBattle(encounterKey) {

	const old = document.getElementById('battle-overlay');
		if (old) old.remove();


    const data = await loadBattleData();

    const encounter = data.encounters[encounterKey];
    const map = data.maps[encounter.map];

    const monsters = [];

    encounter.monsters.forEach(group => {
        const template = data.monsters[group.id];

        group.spawns.forEach((spawn, index) => {
            monsters.push({
                ...template,
				id: group.id, 
                x: spawn.x,
                y: spawn.y,
                hasAction: false
            });
        });
    });



    const missionParty = [];
    const missionLocation = 3; 		// add a map location dict
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
				hasAction: true,
				
				hitBonus: 0,
				damageBonus: 0,
				isSinging: false,
			});
        }
    }

	const payload = {
		party: missionParty,      // your PCs
		monsters: monsters,       // monsters built from JSON
		missionId: encounter.map, // the map key (string)
		map: map,                 // full map object from JSON
		obstacles: map.obstacles, // array of obstacles
		monsterDB: data.monsters,
		xp: encounter.xp || 0,
		loot: encounter.loot || []
	};
	console.log("PAYLOAD BEFORE SAVE:", payload);
	localStorage.setItem('currentBattle', JSON.stringify(payload));


	// ⭐ Delay iframe load so localStorage is fully written
	setTimeout(() => {
		battleOverlay();
	}, 0);

}

function battleOverlay() {
    let overlay = document.getElementById('battle-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'battle-overlay';
        overlay.style = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000;
            z-index: 10000;
            display: block;
        `;
        overlay.innerHTML = `
            <iframe id="battle-frame"
                src="battle.html"
                style="width:100%; height:100%; border:none;">
            </iframe>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "block";
        document.getElementById('battle-frame').src = "battle.html";
    }
}
