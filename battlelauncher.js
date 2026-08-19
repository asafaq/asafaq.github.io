// --- Launcher for index.html ---

// --- 2. THE LISTENER (Battle -> Main Page) ---
// --- 2. THE LISTENER (Battle -> Main Page) ---
window.addEventListener("message", async (event) => {
	
    if (event.data.type === "UNIT_DEFEATED") {
		
        const name = event.data.name;
		if (!player.counter) player.counter = {};
		if (!player.counter.beaten) player.counter.beaten = {};

        if (!player.counter.beaten[name]) {
            player.counter.beaten[name] = 0;
        }

        player.counter.beaten[name]++;

        //Bus.emit('LOG', `📊 ${name} defeated ${player.counter.beaten[name]} times.`);
    }
	
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
                    //sync hp and available skills after fight.
					patron.currentHP = pc.hp;
					
					if (pc.skills) {
						patron.skills = pc.skills;
					}					
					if (pc.statuseffect) {
						patron.statuseffect = pc.statuseffect;
					}

                    if (typeof patron.Exp === 'undefined') patron.Exp = 0;
                    if (!patron.Level) patron.Level = 1;

                    // Fallback to determine class configurations on older characters safely
                    if (!patron.expClassKey) {
                        const lore = loreData.Adventurer[pc.name] || {};
                        const r = lore.role?.toLowerCase() || "";
                        const c = lore.race?.toLowerCase() || "";
                        patron.expClassKey = CLASS_REGISTRY[r] ? r : (CLASS_REGISTRY[c] ? c : "default");
                    }

                    patron.Exp += xpPerPC;

                    // === LEVEL UP LOOP (now unified with helper) ===
                    let nextLevel = patron.Level + 1;
                    let xpNeeded = EXP_TABLES.getRequiredXP(patron.expClassKey, nextLevel);

                    while (patron.Exp >= xpNeeded && nextLevel <= 20) {
                        patron.Level = nextLevel;

                        const lore = loreData.Adventurer[`adv_${pc.name}`];
                        const hpGained = calculateLevelUpHP(patron.Level, lore, patron.expClassKey);

                        patron.MaxHP += hpGained;
                        patron.currentHP = patron.MaxHP; // heal on level up

                        if (window.Bus && typeof window.Bus.emit === 'function') {
                            window.Bus.emit('LOG', `🎉 LEVEL UP! ${pc.name} reached Level ${patron.Level}! (+${hpGained} Max HP)`);
                        }

                        nextLevel = patron.Level + 1;
                        xpNeeded = EXP_TABLES.getRequiredXP(patron.expClassKey, nextLevel);
                    }
                }
            });
        }

        // --- Loot handling (unchanged) ---
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

async function awardManualXP(targets, totalXP) {
    const targetNames = Array.isArray(targets) ? targets : [targets];
    if (targetNames.length === 0 || totalXP <= 0) return;

    const xpPerPC = Math.floor(totalXP / targetNames.length);
    if (xpPerPC <= 0) {
        console.warn("❌ Grant cancelled: XP amount too small to divide among targets.");
        return;
    }

    console.log(`Giving ${xpPerPC} Exp to: ${targetNames.join(", ")}`);

    // Process each character
    for (const name of targetNames) {   // ← changed to for...of so we can use await cleanly
        let cleanName = name.trim();
        if (cleanName.toLowerCase().startsWith("adv_")) {
            cleanName = cleanName.substring(4);
        }
        const key = `adv_${cleanName}`;

        if (!player?.patrons?.[key]) {
            console.warn(`⚠️ Character key "${key}" not found in player.patrons.`);
            continue;
        }

        const patron = player.patrons[key];
        const oldLevel = patron.Level;
        const oldExp = patron.Exp || 0;

        patron.Exp = oldExp + xpPerPC;
        console.log(`→ Added ${xpPerPC} XP to ${cleanName} (${oldExp} → ${patron.Exp})`);

        // === LEVEL UP LOOP ===
        let leveledUp = false;
        let nextLevel = patron.Level + 1;
        let xpNeeded = EXP_TABLES.getRequiredXP(patron.expClassKey, nextLevel);

        while (patron.Exp >= xpNeeded && nextLevel <= 20) {
            leveledUp = true;
            patron.Level = nextLevel;

            const lore = loreData.Adventurer[key];
            const hpGained = calculateLevelUpHP(patron.Level, lore, patron.expClassKey);

            patron.MaxHP += hpGained;
            patron.currentHP = patron.MaxHP;

            console.log(`🎉 ${cleanName} leveled up to ${patron.Level}! (+${hpGained} HP)`);

            if (window.Bus && typeof window.Bus.emit === 'function') {
                window.Bus.emit('LOG', `🎉 MANUAL LEVEL UP! ${cleanName} reached Level ${patron.Level}! (+${hpGained} Max HP)`);
            }

            nextLevel = patron.Level + 1;
            xpNeeded = EXP_TABLES.getRequiredXP(patron.expClassKey, nextLevel);
        }

        if (!leveledUp) {
            console.log(`No level up for ${cleanName} (Exp: ${patron.Exp}, next needed: ${xpNeeded})`);
        }
    }

    // === SAVE ONCE AFTER ALL CHARACTERS ARE PROCESSED ===
    try {
        await storage.savePlayer(player);
        console.log("💾 Storage synced successfully after manual XP award.");
        
        if (typeof renderCharacterSheets === "function") {
            renderCharacterSheets();
        }
    } catch (error) {
        console.error("❌ Failed to save player data:", error);
    }
}

function calculateLevelUpHP(level, loreInput, expClassKey = null) {
    let lore = loreInput;
	console.log("calculateLevelUpHP", level, loreInput, expClassKey);
    if (!lore) {
        console.warn(`Missing lore for HP calculation at level ${level} for character "${loreInput}"`);
        return 1; // safe fallback
    }

    const hpDie = lore.hp_die ?? 6;
    let hpMod = lore.hp_modifier ?? 0;

    let roll;

    if (level >= 10) {
        // Levels 10-20: Single roll (no advantage)
        roll = Math.ceil(Math.random() * hpDie);
        console.log(`Level ${level} HP gain: roll(${roll}) + ${hpMod} = ${roll + hpMod} (die=${hpDie})`);
    } else {
        // Levels 1-9: Advantage roll (max of two rolls)
        const roll1 = Math.ceil(Math.random() * hpDie);
        const roll2 = Math.ceil(Math.random() * hpDie);
        roll = Math.max(roll1, roll2);
        console.log(`Level ${level} HP gain: max(${roll1},${roll2}) + ${hpMod} = ${roll + hpMod} (die=${hpDie})`);
    }

    let gain = roll + hpMod;

    // Minimum 1 HP gain
    if (gain < 1) {
        gain = 1;
    }

    // Extract name or fallback to 'The character' if property is missing
    const characterName = lore.name ?? "The character";
    pushStatus(`${characterName} has gained level ${level} and gained ${gain} HP`);

    return gain;
}



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
    // --- ⚔️ WARRIORS  ---
    warrior:    { table: "warrior",   hpStyle: "warrior" },
    paladin:    { table: "warrior",   hpStyle: "warrior" },
    "fallen paladin":    { table: "warrior",   hpstyle: "warrior" },
    "green knight":    { table: "warrior",   hpstyle: "warrior" },
    barbarian:  { table: "warrior",   hpStyle: "warrior" },
    fighter:    { table: "warrior",   hpStyle: "warrior" },
    brute:    	{ table: "warrior",   hpStyle: "warrior" },
    baker:    	{ table: "warrior",   hpStyle: "warrior" },
    bouncer:    { table: "warrior",   hpStyle: "warrior" },
    squire:     { table: "warrior",   hpStyle: "warrior" },
    deputy:     { table: "warrior",   hpStyle: "warrior" },
    "sword saint":     { table: "warrior",   hpstyle: "warrior" },

    // --- 🔮 PRIESTS / UTILITY  ---
    priest:     { table: "priest",    hpStyle: "priest" },
    shaman:     { table: "priest",    hpStyle: "priest" },
    druid:      { table: "priest",    hpStyle: "priest" },
    warlock:    { table: "priest",    hpStyle: "priest" },
    cleric:     { table: "priest",    hpstyle: "priest" },
    clericbot:  { table: "priest",    hpstyle: "priest" },
    bard:   	{ table: "priest",    hpStyle: "priest" },
    spy:    	{ table: "priest",    hpStyle: "priest" },
    carriagefarer:    	{ table: "mage",    hpstyle: "mage" },

    // --- 🧙 MAGES  ---
    mage:       { table: "mage",      hpStyle: "mage" },
    wizard:     { table: "mage",      hpStyle: "mage" },
    sorcerer:   { table: "mage",      hpStyle: "mage" },

    // --- 🗡️ THIEVES  ---
    thief:      { table: "thief",     hpStyle: "thief" },
    miner:      { table: "thief",     hpStyle: "thief" },
    "arcane trickster":      { table: "swordmage",     hpStyle: "thief" },

    // --- 🗺️ NON-STANDARD ARCHEPLAY / ANCESTRY CLASSES ---
    swordmage:  { table: "swordmage", hpStyle: "warrior" }, 
    dwarf:      { table: "dwarf",     hpStyle: "warrior" },
    "Master Archer":   { table: "swordmage",      hpStyle: "mage" },
    huntress:   { table: "fighter",      hpStyle: "priest" },
};

function getClassKey(role) {
    if (!role) return "default";

    // 1. Clean up input for safe matching
    const cleanRole = role.toString().trim();

    // 2. Direct lookup for exact matches
    if (CLASS_REGISTRY.hasOwnProperty(cleanRole)) {
        return CLASS_REGISTRY[cleanRole].table || "default";
    }

    // 3. Case-insensitive fallback lookup
    const lowerRole = cleanRole.toLowerCase();
    const matchedKey = Object.keys(CLASS_REGISTRY).find(
        (key) => key.toLowerCase() === lowerRole
    );

    if (matchedKey) {
        return CLASS_REGISTRY[matchedKey].table || "default";
    }

    // 4. Ultimate fallback if role isn't registered
    return "default";
}

const EXP_TABLES = {
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

    getRequiredXP: function(expClassKey, targetLevel) {
        // Fallback safety to prevent undefined lookups
        const config = (typeof CLASS_REGISTRY !== 'undefined' && CLASS_REGISTRY[expClassKey]) || { table: "default" };
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
	// console.log("ADV ID RECEIVED:", advId);
	// console.log("LORE EXISTS:", advId in loreData.Adventurer);
	// console.log("LORE ENTRY:", loreData.Adventurer[advId]);

    if (!lore) {
        console.warn(`Missing lore for ${advId}`);
        return null;
    }

    // --- Core Properties ---
	const race = (lore.race || '').toLowerCase();
	const role = (lore.role || '').toLowerCase();
    const Dexterity = lore.Dexterity_mod ?? 0;
    const wisdom = lore.wisdom_mod ?? 0;
    const hpDie = lore.hp_die ?? 6;
    const hpMod = lore.hp_modifier ?? 0;
    const level = lore.level ?? 1;

    function rollAdvantage(die) {
        const r1 = Math.ceil(Math.random() * die);
        const r2 = Math.ceil(Math.random() * die);
        return Math.max(r1, r2);
    }

    // Level 1 HP
    let MaxHP = hpDie + hpMod;
    console.log(`Level 1 HP = ${hpDie} + ${hpMod} = ${MaxHP}`);

    // Level-up HP
	if (level > 1) {
		for (let lvl = 2; lvl <= level; lvl++) {
			const gain = calculateLevelUpHP(lvl, lore);
			MaxHP += gain;
		}
	}	
	// Armor proficiency → numeric bonus (all lowercase keys)
    const armorBonus = {
        unarmored: 0,
        light: 2,
        medium: 4,
        heavy: 6
    };

    // Normalize armor proficiency
    let prof = (lore.proficiency_armor || "unarmed").toLowerCase();
    if (!armorBonus.hasOwnProperty(prof)) {
        prof = "unarmed";
    }
    // --- Compute AC ---
    let AC = 10 + Dexterity + (armorBonus[prof] || 0);

    // Barbarian bonus only when unarmed
    if (race === "barbarian" && prof === "unarmored") {
        AC += hpMod;
    }

    // Barbarian bonus only when unarmed
    if (race === "direwolf" && prof === "unarmored") {
        AC += hpMod;
    }

    // Monk AC formula (only when unarmed)
    if (role === "monk" && prof === "unarmed") {
        AC = 10 + wisdom;
    }

    // --- Dynamic ClassKey and EXP Calculation ---
    const expClassKey = getClassKey(role); 
    let initialExp = 0;

    // 1. Safe check that the global tables exist first
    if (typeof EXP_TABLES !== "undefined") {
        // 2. Define classTable out here so BOTH blocks below can use it safely
        const classTable = EXP_TABLES[expClassKey] || EXP_TABLES["default"];
        
        if (level > 1) {
            // Corrected index calculation using level - 1
            if (classTable && classTable[level - 1] !== undefined) {
                initialExp = classTable[level - 1];
            } else {
                console.warn(`EXP profile missing for class ${expClassKey} at level ${level}. Defaulting to 0.`);
            }
        } 
        else if (level === 1 && (lore.exp === 0 || lore.exp === undefined)) {
            // Level 2 threshold is exactly at array index 1
            if (classTable && classTable[1] !== undefined) {
                initialExp = Math.floor(classTable[1] / 2);
                console.log(`Level 1 catch-up bonus granted to ${advId}: ${initialExp} EXP (Half of Level 2 target ${classTable[1]})`);
            }
        }
    }


    return {
        status: "idle",
        AC,
        MaxHP,
        currentHP: MaxHP,
        Level: level,
        Exp: initialExp, 
        expClassKey,
		
    };
}

/**
 * Calculates HP gain when leveling up (modern D&D style - always roll die)
 * Used by both character creation and manual XP award.
 */
 


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
        const res = await fetch("battle.JSON");
        BATTLE_DATA = await res.json();
    }
    return BATTLE_DATA;
}


//document.getElementById("battle-frame").src = "battle.html";
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
	let eligible = [];

	for (let key in player.patrons) {
		const patronData = player.patrons[key];

		if (patronData.location === missionLocation) {
			const hydrated = getHydratedAdventurer(key);

			if (hydrated.passive === true) {
				console.log(`Skipping passive patron: ${hydrated.name}`);
				continue;
			}
			if (hydrated.currentHP === 0) {
				console.log(`Skipping currentHP === 0 patron: ${hydrated.name}`);
				continue;
			}

			eligible.push(hydrated);
		}
	}

	// ⭐ Sort PCs by HP (highest first)
	eligible.sort((a, b) => b.currentHP - a.currentHP);

	// ⭐ Assign map positions AFTER sorting
	eligible.forEach((hydrated, index) => {
		const coords = getPCPosition(index);
		//const prof = getProficiencyBonus({ id: hydrated.name });
		missionParty.push({
			name: hydrated.name,
			type: 'pc',
			icon: hydrated.icon,
			hp: hydrated.currentHP,
			maxHp: hydrated.MaxHP,
			status: hydrated.status,
			race: hydrated.race,
			role: hydrated.role,
			level: hydrated.Level,
			stats: {
				str: hydrated.strengh_mod,
				dex: hydrated.Dexterity_mod,
				wis: hydrated.wisdom_mod,
				int: hydrated.intelligence_mod,
				cha: hydrated.charisma_mod
			},
			prof: hydrated.prof,
			skills: hydrated.skills || {},
			traits: hydrated.traits || [],
			inventory: hydrated.inventory || [],
			statuseffect: hydrated.statuseffect || {},
			ac: hydrated.AC,
			x: coords.x,
			y: coords.y,

			speed: hydrated.speed || 6,
			maxMove: hydrated.speed || 6,
			hasAction: true,

			hitBonus: 0,
			damageBonus: 0,
			isSinging: false,
		});
	});

	
	if (missionParty.length === 0) {
		pushStatus("No available adventurers for this mission.");
		return;
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

/**
 * Determines starting coordinates for a PC token based on their party order.
 * 
 * @param {number} index - The current index of the character in the party (0 to 5).
 * @returns { {x: number, y: number} } Coordinates object
 */
function getPCPosition(index) {
    // 1. Check for custom mission-defined overrides first
    const missionPositions = player?.missions?.current_mission?.positions;
    if (missionPositions && missionPositions[index]) {
        return {
            x: missionPositions[index].x,
            y: missionPositions[index].y
        };
    }

    // 2. Default sequential grid layout layout
    const defaultSlots = [
        { x: 1, y: 4 }, // 1st character (Index 0)
        { x: 1, y: 5 }, // 2nd character (Index 1)
        { x: 1, y: 6 }, // 3rd character (Index 2)
        { x: 0, y: 4 }, // 4th character (Index 3)
        { x: 0, y: 5 }, // 5th character (Index 4)
        { x: 0, y: 6 }, // 6th character (Index 5)
        { x: 0, y: 7 }, // 7th character 
        { x: 0, y: 3 }, // 8th character 
        { x: 1, y: 7 }, // 9th character 
        { x: 1, y: 3 }, // 10th character 
        { x: 0, y: 8 }, // 11th character 
        { x: 0, y: 2 }  // 12th character 
    ];

    if (index < defaultSlots.length) {
        return defaultSlots[index];
    }

    // ⭐ Auto-place extras in columns to the right
    const extraIndex = index - defaultSlots.length;

    return {
        x: 2 + Math.floor(extraIndex / 3), // every 3 PCs move one column right
        y: 4 + (extraIndex % 3)            // cycle through rows 4,5,6
    };
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
                style="position: fixed; 
                transform-origin: center center;
				border:none;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				">
            </iframe>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "block";
        document.getElementById('battle-frame').src = "battle.html";
    }
}

