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
        snob: m.trait?.includes("Snob")
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
			// Hydration warnings
			for (const c of castes) {
				if (c.caste === undefined || c.caste === null || Number.isNaN(c.caste)) {
					console.warn(
						`[HYDRATION WARNING] Patron "${c.id}" has invalid caste value:`,
						c.caste,
						" | Raw caste:", members.find(m => m.id === c.id)?.caste
					);
				}
			}

            // Snob rule: cannot associate with lower caste
            if (A.snob && A.caste > B.caste) {
                return `${members[i].name} is a Snob and refuses to associate with lower castes.`;
            }

            if (B.snob && B.caste > A.caste) {
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

const PartySynergies = {
    "Trouble Makers": {
        requirements: {
            roles: ["barbarian", "bard"],	//roles → all must be present
            anyOfRoles: ["rogue", "miner"]	//anyOfRoles → at least one must be present
        }
    },

    "Hogfamily first": {
        requirements: {
            adventurers: [					//adventurers → specific IDs must be present
                "Adv_Hogperson",
                "Adv_Hogmother",
                "Adv_Hogfather"
            ]
        }
    }
};


function buildPartyTraits(partyKey) {
    const members = getPartyMembers(partyKey);

    const visibleTraits = [];
    const hiddenTraits = [];

    // Pre-calc lookup tables
    const roles = new Set();
    const adventurerIds = new Set();

    for (const m of members) {
        const role = m.role?.toLowerCase();
        if (role) roles.add(role);

        if (m.id) adventurerIds.add(m.id);

        // Visible personal traits
        if (Array.isArray(m.traits)) {
            visibleTraits.push(...m.traits);
        }

        // Secret traits
        if (Array.isArray(m.secretTraits)) {
            hiddenTraits.push(...m.secretTraits);
        }

        // Innate racial traits
        const innate = getInnateTraits(m);
        visibleTraits.push(...innate);
    }

    // --- Evaluate Synergies ---
    for (const [synergyName, synergy] of Object.entries(PartySynergies)) {
        const req = synergy.requirements;

        let qualifies = true;

        // Required roles
        if (req.roles) {
            for (const r of req.roles) {
                if (!roles.has(r.toLowerCase())) {
                    qualifies = false;
                    break;
                }
            }
        }

        // Any-of roles
        if (qualifies && req.anyOfRoles) {
            const match = req.anyOfRoles.some(r => roles.has(r.toLowerCase()));
            if (!match) qualifies = false;
        }

        // Required adventurers
        if (qualifies && req.adventurers) {
            for (const adv of req.adventurers) {
                if (!adventurerIds.has(adv)) {
                    qualifies = false;
                    break;
                }
            }
        }

        if (qualifies) {
            visibleTraits.push(synergyName);
        }
    }

    // Remove duplicates
    const uniqueVisible = [...new Set(visibleTraits)];
    const uniqueHidden = [...new Set(hiddenTraits)];

    player.missions.current_mission.party_traits_visible = uniqueVisible;
    player.missions.current_mission.party_traits_hidden = uniqueHidden;
}

function partyHasTrait(traitName) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return all.some(t => t.toLowerCase() === traitName.toLowerCase());
}


// if (partyHasTrait("Rage")) {
    // addMissionOption({
        // label: "Use Rage to intimidate the guards",
        // action: () => { /* your mission logic */ }
    // });
// }

function partyHasAnyTrait(traitList) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return traitList.some(t => all.includes(t));
}

// if (partyHasAnyTrait(["Rage", "Berserker", "Bloodlust"])) {
    // unlockBerserkPath();
// }

function partyHasAllTraits(traitList) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return traitList.every(t => all.includes(t));
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
    const errors = validatePartyAllErrors(partyKey);

    if (errors.length === 0) {
        return true; // all good
    }

    // Show the first error in the status bar
    pushStatus("Party cannot depart:\n• " + errors[0]);

    // Also store all errors for UI popups or debugging
    player.missions.current_mission.lastValidationErrors = errors;

    return false;
}



function validatePartyAllErrors(partyKey) {
    const members = getPartyMembers(partyKey);
    const missionId = player.missions.current_mission.id;
    const rules = missionRules[missionId] || {};

    const errors = [];

    for (const rule of validationRules) {
        const result = rule(members, rules);

        // If rule returns a string → it's an error
        if (result !== true) {
            errors.push(result);
        }
    }

    return errors;
}

function showAllPartyErrors() {
    const errors = player.missions.current_mission.lastValidationErrors || [];

    if (errors.length === 0) {
        pushStatus("No validation errors.");
        return;
    }

    const msg = "Party cannot depart:\n" + errors.map(e => "• " + e).join("\n");
    pushStatus(msg, 8000);
}

const missionNodes = {
	
	// path : 1
	// shrine : 2,3
	// swamp : 4
    dwood_fort: {
        title: "Darkwood Fort",
        desc: "A fortified outpost deep in the Dark Woods.",
        missionId: "dwood_1",
        requires: null
    },

    dwood_swamp: {
        title: "Murkwater Swamp",
        desc: "The swamp home to the Trollkin Trixter.",
        missionId: "dwood_1",
        requires: null
    },

    dwood_shrine: {
        title: "Ancient Shrine",
        desc: "The Shrine to Narlia.",
        missionId: "dwood_1",
        requires: null
    },

    dwood_path: {
        title: "The Dark Woods",
        desc: "You make your way through the dark woods.",
        missionId: "dwood_1",
        requires: null
    }
};

function missionController(nodeId) {
    const current = player.missions.current_mission;
    const missionId = current.id;

    console.log("Mission Controller:", missionId, "Node:", nodeId);

    // 1. Dark Woods / node-based missions
    if (missionNodes[nodeId]) {
        return openMissionNode(nodeId);
    }

    // 2. Green missions: clicking the path
    if (nodeId === "green_1_path" ||
        nodeId === "green_2_path" ||
        nodeId === "green_3_path") {

        pushStatus("Continuing your journey...");
        // Use your existing progression logic
        runMission(missionId);
        return;
    }

    pushStatus("Nothing interesting happens here.");
    console.warn("Unknown mission node clicked:", nodeId);
}

function openMissionNode(nodeId) {
    const node = missionNodes[nodeId];

    if (!node) {
        pushStatus("Unknown mission node: " + nodeId);
        return;
    }

    // Check progression requirement
    if (node.requires && !player.missions[node.requires]) {
        pushStatus(`You cannot access ${node.title} yet.`);
        return;
    }

    // Show a short message instead of a popup
    pushStatus(`${node.title}: ${node.desc}`);
    // Store selected node for engagement
    selectedNode = node;
	runMission(node.missionId);
}
