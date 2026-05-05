// missions_rules.js

const missionRules = {
    green_1: {
        minMembers: 2,
        maxMembers: 6,
        requiresRole: null,
        requiresTrait: null
    },

    green_2: {
        minMembers: 3,
        maxMembers: 6,
        //requiresRole: "Adv",
        requiresTrait: null
    },

    espionage: {
        minMembers: 3,
        maxMembers: 3,
        //requiresTrait: "Courage"
		requiresRole: "Spy"
    }
};

const casteOrder = {
    Underclass: 0,
    Commoner: 1,
    Noble: 2,
    Aristocrat: 3,
    Royalty: 4,
    Omni: 999 // special, always allowed
};

function getEffectiveCaste(patron) {
    let caste = patron.caste;

    if (caste === "Omni") return casteOrder.Omni;

    // Outcast_X → X - 2
    if (caste.startsWith("Outcast_")) {
        const base = caste.replace("Outcast_", "");
        return Math.max(0, casteOrder[base] - 2);
    }

    // Poser_X → X + 2
    if (caste.startsWith("Poser_")) {
        const base = caste.replace("Poser_", "");
        return Math.min(4, casteOrder[base] + 2);
    }

    // Normal caste
    return casteOrder[caste];
}

function ruleCasteCompatibility(members, mission) {
    console.log("Members passed to caste rule:", members);

    // Emergency override
    if (mission?.id === "emergency_001") {
        return { ok: true };
    }

    // ...rest of your caste/snob logic...

    // Extract effective caste values
    const castes = members.map(m => ({
        id: m.id,
        caste: getEffectiveCaste(m),
        snob: m.traits?.includes("Snob")
    }));

    for (let i = 0; i < castes.length; i++) {
        for (let j = i + 1; j < castes.length; j++) {

            const A = castes[i];
            const B = castes[j];

            // Omni ignores caste rules
            if (A.caste === casteOrder.Omni || B.caste === casteOrder.Omni) continue;

            const diff = Math.abs(A.caste - B.caste);

            // Base rule: must be same or adjacent
            if (diff > 1) {
                return `Caste mismatch: ${members[i].name} and ${members[j].name} cannot associate.`;
            }

            // Snob rule: cannot associate with lower caste
            if (A.snob && A.caste < B.caste) {
                return `${members[i].name} is a Snob and refuses to associate with lower castes.`;
            }

            if (B.snob && B.caste < A.caste) {
                return `${members[j].name} is a Snob and refuses to associate with lower castes.`;
            }
        }
    }

    return true;
}

// future multiple set of missions to bypass caste rule.
// const casteBypassMissions = new Set([
    // "emergency_001",
    // "emergency_002",
    // "tutor1_110",
    // "siege_escape",
    // "flood_rescue"
// ]);
// function ruleCasteCompatibility(party, mission) {

//    Emergency override — skip caste/snob restrictions
    // if (mission && casteBypassMissions.has(mission.id)) {
        // return { ok: true };
    // }

//    Normal caste/snob logic continues here...
// }



function ruleAlignmentCompatibility(members) {
    // Extract alignments
    const alignments = members.map(m => ({
        name: m.name,
        alignment: m.alignment
    }));

    for (let i = 0; i < alignments.length; i++) {
        for (let j = i + 1; j < alignments.length; j++) {

            const A = alignments[i].alignment;
            const B = alignments[j].alignment;

            // Only forbidden combination:
            // Lawful + Chaotic
            const forbidden =
                (A === "Lawful" && B === "Chaotic") ||
                (A === "Chaotic" && B === "Lawful");

            if (forbidden) {
                return `${alignments[i].name} (${A}) cannot join a party with ${alignments[j].name} (${B}).`;
            }
        }
    }

    return true;
}


function getInnateTraits(patron) {
    const race = patron.race;
    const raceData = loreData.Races[race];

    if (!raceData || !raceData.Traits) return [];

    return raceData.Traits; // array of strings
}

function buildPartyTraits(partyKey) {
    const members = getPartyMembers(partyKey);

    const allTraits = [];
	
    let hasBarbarian = false;
    let hasRogue = false;
    let hasBard = false;
    let hasMiner = false;

    for (const m of members) {
        // DEBUG LOG — this is where you inspect the data
        console.log("Member:", m.name, "Race:", m.race, "Role:", m.role);

        // Track race/roles for synergy traits
        if (m.race?.toLowerCase() === "barbarian") {
            hasBarbarian = true;
        }

        const role = m.role?.toLowerCase();
        if (role === "rogue") hasRogue = true;
        if (role === "bard") hasBard = true;
        if (role === "miner") hasMiner = true;

        // Personal traits
        if (m.traits && Array.isArray(m.traits)) {
            allTraits.push(...m.traits);
        }

        // Innate racial traits
        const innate = getInnateTraits(m);
        allTraits.push(...innate);
    }

    // --- Synergy Trait: Trouble Makers ---
    // Condition A: Barbarian + Rogue + Bard
    // Condition B: Barbarian + Miner + Bard (if you want Miner instead of Rogue)
    if (
        hasBarbarian &&
        hasBard &&
        (hasRogue || hasMiner)
    ) {
        allTraits.push("Trouble Makers");
    }

    // Remove duplicates
    const uniqueTraits = [...new Set(allTraits)];

    player.missions.current_mission.party_traits = uniqueTraits;
}

function partyHasTrait(traitName) {
    const traits = player.missions.current_mission.party_traits;
    if (!traits) return false;

    return traits.some(t => t.toLowerCase() === traitName.toLowerCase());
}

// if (partyHasTrait("Rage")) {
    // addMissionOption({
        // label: "Use Rage to intimidate the guards",
        // action: () => { /* your mission logic */ }
    // });
// }

function partyHasAnyTrait(traitList) {
    const traits = player.missions.current_mission.party_traits;
    if (!traits) return false;

    return traitList.some(t => traits.includes(t));
}

// if (partyHasAnyTrait(["Rage", "Berserker", "Bloodlust"])) {
    // unlockBerserkPath();
// }

function partyHasAllTraits(traitList) {
    const traits = player.missions.current_mission.party_traits;
    if (!traits) return false;

    return traitList.every(t => traits.includes(t));
}

// if (partyHasAllTraits(["Calm", "Wise"])) {
    // unlockMeditationOption();
// }


function getPartyMembers(partyKey) {
    const locationMap = {
        party_A: 3,
        party_B: 4,
        party_C: 5
    };

    const loc = locationMap[partyKey];

    return Object.values(player.patrons)
        .filter(p => p.location === loc);
}

function ruleMinMembers(members, rules) {
    const count = members.length;
    const hasIndependent = members.some(m => m.traits?.includes("Independent"));

    if (hasIndependent) {
        if (count < 1) return "At least one member is required.";
        return true;
    }

    if (rules.minMembers && count < rules.minMembers) {
        return `This mission requires at least ${rules.minMembers} members.`;
    }

    return true;
}

function ruleMaxMembers(members, rules) {
    if (rules.maxMembers && members.length > rules.maxMembers) {
        return `This mission allows no more than ${rules.maxMembers} members.`;
    }
    return true;
}

function ruleRequiredRole(members, rules) {
    if (!rules.requiresRole) return true;

    const hasRole = members.some(m => m.role === rules.requiresRole);
    if (!hasRole) {
        return `This mission requires a ${rules.requiresRole}.`;
    }

    return true;
}

function ruleRequiredTrait(members, rules) {
    if (!rules.requiresTrait) return true;

    const hasTrait = members.some(m => m.traits?.includes(rules.requiresTrait));
    if (!hasTrait) {
        return `This mission requires someone with the trait "${rules.requiresTrait}".`;
    }

    return true;
}

const validationRules = [
    ruleMinMembers,
    ruleMaxMembers,
    ruleRequiredRole,
    ruleRequiredTrait,
    ruleCasteCompatibility,
    ruleAlignmentCompatibility
];

function validateParty(partyKey) {
    const members = getPartyMembers(partyKey);
    const missionId = player.missions.current_mission.id;
    const rules = missionRules[missionId] || {};

    for (const rule of validationRules) {
        const result = rule(members, rules);
        if (result !== true) return result;
    }

    return true;
}
