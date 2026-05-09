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

        Bus.emit('LOG', "The party has returned from combat."); // If your main page has a log too
    }
});

// Example function to start a fight
// function launchBattle(encounterData) {
    // localStorage.setItem('currentBattle', JSON.stringify(encounterData));
   //Redirect or show the battle iframe
    // window.location.href = "battle.html"; 
// }



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
                ac: hydrated.AC,
                x: 1, 
                y: 2 + missionParty.length,
                color: '#3498db',
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
    window.location.href = "battle.html";
}

