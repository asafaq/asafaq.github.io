// --- Launcher for index.html ---

// --- 2. THE LISTENER (Battle -> Main Page) ---
// --- 2. THE LISTENER (Battle -> Main Page) ---
window.addEventListener("message", async (event) => {
    if (event.data.type === "BATTLE_COMPLETE") {
        const results = event.data.result;
        const earnedXP = event.data.xp || 0;
        const earnedLoot = event.data.loot || [];

        if (results && Array.isArray(results)) {
            const xpPerPC = results.length > 0 ? Math.floor(earnedXP / results.length) : 0;

            results.forEach(pc => {
                const key = `adv_${pc.name}`;
                
                if (player && player.patrons && player.patrons[key]) {
                    const patron = player.patrons[key];
                    patron.currentHP = pc.hp;
                    
                    if (pc.hp <= 0) patron.status = 'injured';

                    if (typeof patron.Exp === 'undefined') patron.Exp = 0;
                    if (!patron.Level) patron.Level = 1;

                    // Fallback to determine class configurations on older characters safely
                    if (!patron.classKey) {
                        const lore = loreData.Adventurer[pc.name] || {};
                        const r = lore.role?.toLowerCase() || "";
                        const c = lore.race?.toLowerCase() || "";
                        patron.classKey = CLASS_REGISTRY[r] ? r : (CLASS_REGISTRY[c] ? c : "default");
                    }

                    patron.Exp += xpPerPC;

                    let nextLevel = patron.Level + 1;
                    let xpNeeded = XP_TABLES.getRequiredXP(patron.classKey, nextLevel);

                    while (patron.Exp >= xpNeeded && nextLevel <= 20) {
                        patron.Level = nextLevel;
                        let hpGained = 0;

                        // Check if character is inside the rolling tier or flat reward tier
                        if (patron.Level <= 9) {
                            const lore = loreData.Adventurer[pc.name];
                            const hpDie = lore?.hp_die ?? 6;
                            let hpMod = lore?.hp_modifier ?? 0;
                            
                            // Apply your custom rule: max +2 hpMod contribution
                            if (hpMod > 2) hpMod = 2;

                            const roll1 = Math.ceil(Math.random() * hpDie);
                            const roll2 = Math.ceil(Math.random() * hpDie);
                            hpGained = Math.max(roll1, roll2) + hpMod;
                        } else {
                            // Flat high-level reward scaling rules
                            const config = CLASS_REGISTRY[patron.classKey] || { hpStyle: "thief" };
                            if (config.hpStyle === "warrior") hpGained = 3;
                            else if (config.hpStyle === "priest") hpGained = 2;
                            else hpGained = 1;
                            
                            // Note: hpMod is completely ignored here per your criteria!
                        }

                        patron.MaxHP += hpGained;
                        patron.currentHP = patron.MaxHP; // Leveling up fully heals characters

                        if (window.Bus && typeof window.Bus.emit === 'function') {
                            window.Bus.emit('LOG', `🎉 LEVEL UP! ${pc.name} reached Level ${patron.Level}! (+${hpGained} Max HP)`);
                        }
                        
                        nextLevel = patron.Level + 1;
                        xpNeeded = XP_TABLES.getRequiredXP(patron.classKey, nextLevel);
                    }
                }
            });
        }

        // --- (Your standard loot packing and overlay cleanup logic continues below here) ---
        if (!player.inventory) player.inventory = [];
        if (earnedLoot && earnedLoot.length > 0) {
            earnedLoot.forEach(droppedItem => {
                const existingItem = player.inventory.find(i => i.item === droppedItem.item);
                if (existingItem) existingItem.qty += droppedItem.qty;
                else player.inventory.push({ item: droppedItem.item, qty: droppedItem.qty });
            });
        }

        localStorage.removeItem('currentBattle');
        const overlay = document.getElementById('battle-overlay');
        if (overlay) overlay.remove();

        try {
            await storage.savePlayer(player);
            console.log("💾 Player data saved permanently with updated levels.");
        } catch (error) {
            console.error("❌ Error writing save state:", error);
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

// Global Registry mapping every class/role to its behavior rules
const CLASS_REGISTRY = {
    // --- ⚔️ WARRIORS (+3 HP after level 9) ---
    warrior:    { table: "warrior",   hpStyle: "warrior" },
    paladin:    { table: "warrior",   hpStyle: "warrior" },
    "fallen paladin":    { table: "warrior",   hpstyle: "warrior" },
    barbarian:  { table: "warrior",   hpStyle: "warrior" },
    fighter:    { table: "warrior",   hpStyle: "warrior" },
    brute:    	{ table: "warrior",   hpStyle: "warrior" },
    baker:    	{ table: "warrior",   hpStyle: "warrior" },
    bouncer:    { table: "warrior",   hpStyle: "warrior" },
    squire:     { table: "warrior",   hpStyle: "warrior" },
    deputy:     { table: "warrior",   hpStyle: "warrior" },
    "sword saint":     { table: "warrior",   hpstyle: "warrior" },

    // --- 🔮 PRIESTS / UTILITY (+2 HP after level 9) ---
    priest:     { table: "priest",    hpStyle: "priest" },
    shaman:     { table: "priest",    hpStyle: "priest" },
    druid:      { table: "priest",    hpStyle: "priest" },
    warlock:    { table: "priest",    hpStyle: "priest" },
    cleric:     { table: "priest",    hpstyle: "priest" },
    clericbot:  { table: "priest",    hpstyle: "priest" },
    bard:   	{ table: "priest",    hpStyle: "priest" },
    spy:    	{ table: "priest",    hpStyle: "priest" },
    carriagefarer:    	{ table: "mage",    hpstyle: "mage" },

    // --- 🧙 MAGES (+1 HP after level 9 ) ---
    mage:       { table: "mage",      hpStyle: "mage" },
    wizard:     { table: "mage",      hpStyle: "mage" },
    sorcerer:   { table: "mage",      hpStyle: "mage" },

    // --- 🗡️ THIEVES (+1 HP after level 9) ---
    thief:      { table: "thief",     hpStyle: "thief" },
    miner:      { table: "thief",     hpStyle: "thief" },
    "arcane trickster":      { table: "swordmage",     hpStyle: "thief" },

    // --- 🗺️ NON-STANDARD ARCHEPLAY / ANCESTRY CLASSES ---
    swordmage:  { table: "swordmage", hpStyle: "warrior" }, 
    dwarf:      { table: "dwarf",     hpStyle: "warrior" },
    "Master Archer":   { table: "swordmage",      hpStyle: "mage" },
    huntress:   { table: "fighter",      hpStyle: "priest" },
};

const XP_TABLES = {
    // 3 Main Core Classes (Halved requirements)
    warrior:   [0, 1000, 2000, 4000, 9000, 17500, 35000, 62500, 125000, 250000, 375000],
    priest:    [0, 750, 1500, 3000, 6500, 11250, 22500, 45000, 90000, 137500, 225000],
    thief:     [0, 625, 1250, 2500, 5000, 10000, 21250, 42500, 85000, 140000, 220000],
    
    // Core Magic Track
    mage:      [0, 1250, 2500, 5000, 10000, 20000, 45000, 90000, 187500, 287500, 375000],

    // Non-Standard Classes
    swordmage: [0, 1500, 3000, 6000, 12000, 24000, 48000, 95000, 175000, 275000, 375000],
    dwarf:     [0, 1000, 2000, 4000, 9000, 17500, 35000, 62500, 125000, 250000, 375000],
    default:   [0, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 375000],

    getRequiredXP: function(classKey, targetLevel) {
        // Fallback safety to prevent undefined lookups
        const config = (typeof CLASS_REGISTRY !== 'undefined' && CLASS_REGISTRY[classKey]) || { table: "default" };
        const table = this[config.table] || this.default || [0];
        
        // Clamp level boundaries cleanly
        const safeLevel = Math.max(1, targetLevel);
        
        if (safeLevel <= table.length) {
            return table[safeLevel - 1] ?? 0;
        }
        
        // Safe linear calculations for Epic Levels 12-20
        const baseXP = table[table.length - 1] ?? 0;
        const penultXP = table[table.length - 2] ?? 0;
        const flatIncrement = baseXP - penultXP;
        
        return baseXP + ((safeLevel - table.length) * flatIncrement);
    }
};

async function recruitAdventurer(advId) {

    // 1. Safety check: Ensure player state exists
    if (!player || !player.patrons) {
        console.error("Critical: 'player.patrons' is not initialized!");
        return;
    }

    // 2. Prevent overwriting if already successfully recruited
    if (player.patrons[advId] !== undefined) {
        console.warn(`Adventurer ${advId} is already in your patrons list!`);
        return;
    }

    // 3. Generate state using your factory function
    // (createDefaultPatronState is synchronous, so no await here)
    const newbornState = createDefaultPatronState(advId);

    console.log("DEBUG Gatekeeper:", {
        advId,
        newbornState,
        type: typeof newbornState,
        MaxHP: newbornState?.MaxHP,
        isMissingState: !newbornState,
        isNotObject: typeof newbornState !== "object",
        isBadHP: !newbornState?.MaxHP
    });

    // 4. Validate the generated state
    if (!newbornState || typeof newbornState !== 'object' || !newbornState.MaxHP) {
        console.error(`Recruitment Aborted: Factory returned an invalid state for "${advId}". Database save blocked.`);
        return;
    }

    // 5. Mutate state in memory
    player.patrons[advId] = newbornState;

    // 6. Persist to storage — THIS is the only place async matters
    try {
        await storage.savePlayer(player);   // <-- the only meaningful await
        console.log(`🎉 Adventurer ${advId} recruited successfully!`, player.patrons[advId]);
    } catch (err) {
        console.error("Failed to commit recruitment save to IndexedDB:", err);
        delete player.patrons[advId]; // rollback
    }
}


function createDefaultPatronState(advId) {
    const lore = loreData.Adventurer[advId];

    if (!lore) {
        console.warn(`Missing lore for ${advId}`);
        return null;
    }

    const hpDie = lore.hp_die ?? 6;
    const hpMod = lore.hp_modifier ?? 0;
    const level = lore.level ?? 1;

    function rollAdvantage(die) {
        const r1 = Math.ceil(Math.random() * die);
        const r2 = Math.ceil(Math.random() * die);
        return Math.max(r1, r2);
    }

    console.log(`\n=== HP DEBUG: ${advId} ===`);
    console.log(`Level: ${level}`);
    console.log(`HP Die: d${hpDie}`);
    console.log(`HP Mod: ${hpMod}`);

    // Level 1 HP
    let MaxHP = hpDie + hpMod;
    console.log(`Level 1 HP = ${hpDie} + ${hpMod} = ${MaxHP}`);

    // Level-up HP
	if (level > 1) {
		for (let lvl = 2; lvl <= level; lvl++) {
			const roll = rollAdvantage(hpDie);
			const gain = roll + hpMod;
			MaxHP += gain;

			console.log(
				`Level ${lvl} gain: roll(${roll}) + mod(${hpMod}) = ${gain} → Total: ${MaxHP}`
			);
		}
	}

    console.log(`FINAL MaxHP for ${advId}: ${MaxHP}`);
    console.log(`=== END HP DEBUG ===\n`);

    return {
        status: "idle",
        AC: 10, // unchanged, irrelevant to HP debug
        MaxHP,
        currentHP: MaxHP,
        Level: level,
        Exp: 0,
        classKey: "default"
    };
}

/**
 * Universal XP Distributor
 * @param {string|string[]} targets - A single name (e.g. "Bragain") or an array of names (e.g. ["Bragain", "Claudio"])
 * @param {number} totalXP - The amount of XP to grant (automatically split if targeting a list)
 */

// awardManualXP("Bragain", 500);
// awardManualXP(["Amyssa", "Bragain", "Claudio", "Hogperson"], 2000);
 
 // Filter active adventurers assigned to location 3 right out of your state object
//const missionParty = Object.keys(player.patrons)
//    .filter(key => player.patrons[key].location === 3)
//    .map(key => key.replace("adv_", "")); // Strip prefix back to name literals

// Give the combined squad a flat 1000 XP drop pool
//awardManualXP(missionParty, 1000);
 

async function awardManualXP(targets, totalXP) {
    // 1. Normalize targets into an array format
    const targetNames = Array.isArray(targets) ? targets : [targets];
    if (targetNames.length === 0 || totalXP <= 0) return;

    // 2. Calculate the split share
    const xpPerPC = Math.floor(totalXP / targetNames.length);
    if (xpPerPC <= 0) {
        console.warn("❌ Grant cancelled: XP amount too small to divide among targets.");
        return;
    }

    console.log(`Giving ${xpPerPC} Exp to: ${targetNames.join(", ")}`);

	// 3. Process each character profile
	targetNames.forEach(name => {
		// ⭐ UNIVERSAL NORMALIZATION STEP
		// Trim accidental whitespace, lower-case it to safely check for 'adv_', 
		// then remove the prefix if it exists.
		let cleanName = name.trim();
		if (cleanName.toLowerCase().startsWith("adv_")) {
			cleanName = cleanName.substring(4); // Strips away the 'adv_' prefix
		}

		// Always re-apply the unified lowercase prefix followed by the exact key text
		const key = `adv_${cleanName}`;
		
		if (player && player.patrons && player.patrons[key]) {
			const patron = player.patrons[key];
			
			// Use cleanName for logs and lookup so that it strips the 'adv_' from the screen output
			console.log(`🎯 Processing matched key: ${key}`);

			// ... [The rest of your XP allocation and Level Up loop logic goes here, unchanged!] ...

            // 4. Handle Level Up evaluation loops
            let nextLevel = patron.Level + 1;
            let xpNeeded = XP_TABLES.getRequiredXP(patron.classKey, nextLevel);

            while (patron.Exp >= xpNeeded && nextLevel <= 20) {
                patron.Level = nextLevel;
                let hpGained = 0;

                if (patron.Level <= 9) {
                    const lore = loreData.Adventurer[name];
                    const hpDie = lore?.hp_die ?? 6;
                    let hpMod = lore?.hp_modifier ?? 0;
                    
                    if (hpMod > 2) hpMod = 2; // Cap your mod contribution to max +2

                    const roll1 = Math.ceil(Math.random() * hpDie);
                    const roll2 = Math.ceil(Math.random() * hpDie);
                    hpGained = Math.max(roll1, roll2) + hpMod;
                } else {
                    // Flat level 10+ rewards matching your exact targets
                    const config = CLASS_REGISTRY[patron.classKey] || { hpStyle: "thief" };
                    if (config.hpStyle === "warrior") hpGained = 3;
                    else if (config.hpStyle === "priest") hpGained = 2;
                    else hpGained = 1; // Mages and Thieves get flat +1 HP
                }

                patron.MaxHP += hpGained;
                patron.currentHP = patron.MaxHP; // Fully heal on level up

                if (window.Bus && typeof window.Bus.emit === 'function') {
                    window.Bus.emit('LOG', `🎉 MANUAL LEVEL UP! ${name} reached Level ${patron.Level}! (+${hpGained} Max HP)`);
                }
                
                nextLevel = patron.Level + 1;
                xpNeeded = XP_TABLES.getRequiredXP(patron.classKey, nextLevel);
            }
        } else {
            console.warn(`⚠️ Character key "${key}" was not found inside player.patrons.`);
        }
    });

    // 5. Commit mutations permanently to your IndexedDB layout
    try {
        await storage.savePlayer(player);
        console.log("💾 Storage synced successfully following manual XP injection.");
        
        // UI Hook refresh trigger if you use one
        if (typeof renderCharacterSheets === "function") renderCharacterSheets();
    } catch (error) {
        console.error("❌ Failed to commit manual XP adjustments to storage:", error);
    }
}


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
			// 🚫 Skip passive patrons after hydration
			if (hydrated.passive === true) {
				console.log(`Skipping passive patron: ${hydrated.name}`);
				continue;
			}
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
