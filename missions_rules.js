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

/*
future multiple set of missions to bypass caste rule.
const casteBypassMissions = new Set([
    "emergency_001",
    "emergency_002",
    "tutor1_110",
    "siege_escape",
    "flood_rescue"
]);
function ruleCasteCompatibility(party, mission) {

   Emergency override — skip caste/snob restrictions
    if (mission && casteBypassMissions.has(mission.id)) {
        return { ok: true };
    }

   Normal caste/snob logic continues here...
}
*/

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
			race: ["barbarian"],
			roles: [
				"bard"
			],
			anyOf: [
				["rogue"],
				["miner"],
				["thief"],
				["arcane trickster"],
				["deputy"]
			]
		}
	},


    "Hogfamily first": {
        requirements: {
            adventurers: [
                "Adv_Hogperson",
                "Adv_Hogmother",
                "Adv_Hogfather"
            ]
        }
    }
};

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

function buildPartyTraits(partyKey) {
    const members = getPartyMembers(partyKey);

    const visibleTraits = [];
    const hiddenTraits = [];
    const synergyTraits = [];

    // Pre-calc lookup tables
    const roles = new Set();
    const adventurerIds = new Set();

    for (const m of members) {

		// console.log("Processing member:", m);
		
        const role = m.role;		//?.toLowerCase()
		console.log("  role:", role);
		
		if (role) roles.add(role.toLowerCase());   // ⭐ FIXED
		
		console.log("  -> adding role:", role);
		
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
		
		
		console.log("role:", m.role);

		const normalizedRole = m.role; // or m.role.toLowerCase()
		console.log("lookup key:", normalizedRole);

		// ⭐ FIX: actually pull the role data from loreData
		const roleData = loreData.Roles[normalizedRole];

		console.log("roleData:", roleData);

		if (roleData && Array.isArray(roleData.Traits)) {
			console.log("  -> adding role traits:", roleData.Traits);
			visibleTraits.push(...roleData.Traits);
		} else {
			console.log("  -> NO TRAITS FOUND for role:", normalizedRole);
		}

    }

    // --- Evaluate Synergies ---
    for (const [synergyName, synergy] of Object.entries(PartySynergies)) {
        const req = synergy.requirements;

        let qualifies = true;

		// Required races
		if (qualifies && req.race) {
			const memberRaces = new Set(members.map(m => m.race?.toLowerCase()));
			for (const r of req.race) {
				if (!memberRaces.has(r.toLowerCase())) {
					qualifies = false;
					break;
				}
			}
		}


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
            synergyTraits.push(synergyName);
        }
    }

    // Remove duplicates
    const uniqueVisible = [...new Set(visibleTraits)];
    const uniqueHidden = [...new Set(hiddenTraits)];

    player.missions.current_mission.party_traits_visible = uniqueVisible;
    player.missions.current_mission.party_traits_hidden = uniqueHidden;
    player.missions.current_mission.synergyTraits = synergyTraits;
}

function partyHasTrait(traitName) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return all.some(t => t.toLowerCase() === traitsName.toLowerCase());
}


// if (partyHasTrait("Rage")) {
    // addMissionOption({
        // label: "Use Rage to intimidate the guards",
        // action: () => { /* your mission logic */ }
    // });
// }

function partyHasAnyTrait(traitsList) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return traitsList.some(t => all.includes(t));
}

// if (partyHasAnytraits(["Rage", "Berserker", "Bloodlust"])) {
    // unlockBerserkPath();
// }

function partyHasAllTraits(traitsList) {
    const visible = player.missions.current_mission.party_traits_visible || [];
    const hidden = player.missions.current_mission.party_traits_hidden || [];

    const all = [...visible, ...hidden];

    return traitsList.every(t => all.includes(t));
}


// if (partyHasAllTraits(["Calm", "Wise"])) {
    // unlockMeditationOption();
// }


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
	// fort :5 
	green_1: {   missionId: "green_1",	},
	green_2: {   missionId: "green_2",	},
	green_3: {   missionId: "green_3",	},
    dwood_fort2: {
        title: "Darkwood Fort",
        desc: "A fortified outpost deep in the Dark Woods.",
        missionId: "dwood_fort_2",
        requires:  {	dwood_1: 5,
						dwood_fort_1: 2
						}
    },
	
    dwood_fort: {
        title: "Darkwood Fort",
        desc: "A fortified outpost deep in the Dark Woods.",
        missionId: "dwood_fort_1",
        requires:  {	dwood_1: 4	}
    },

    dwood_swamp: {
        title: "Murkwater Swamp",
        desc: "The swamp home to the Trollkin Trickster.",
        missionId: "dwood_swamp1",
        requires: {}
    },

    dwood_shrine: {
        title: "Ancient Shrine",
        desc: "The Shrine to Narlia.",
        missionId: "dwood_1",
        requires: {}
    },

    dwood_path: {
        title: "The Dark Woods",
        desc: "You make your way through the dark woods.",
        missionId: "dwood_1",
        requires: {}
    },
	
	dwood_platform: {
		missionId: "dwoodplat_1",
		requires: { dwood_1: 0 }
				},
	
	dwood_glade: {
		missionId: "dwood_glade_1",
		requires: { dwood_1: 0 }
				}
};

function missionController(nodeId) {
    const current = player.missions.current_mission;
    const missionId = current.id;

    console.log("Mission Controller:", missionId, "Node:", nodeId);

    // 1. Dark Woods / node-based missions
    if (missionNodes[nodeId]) {
		
		const node = missionNodes[nodeId];
		if (node && node.requires) {
			for (const reqMission in node.requires) {
				const requiredStage = node.requires[reqMission];
				const playerStage = player.missions[reqMission]?.stage || 0;

				if (playerStage < requiredStage) {
					return pushStatus(`You cannot access this yet ${playerStage} . You need ${reqMission} stage ${requiredStage}.`);
				}
			}
		}
        return openMissionNode(nodeId);
    }

    // 2. Green missions: clicking the path
	const missionRules = {
	  green_1: {
		"*": { action: "run", mission: "green_1" }
	  },

	  dwood_path: {
		1: { action: "run", mission: "dwood_1" },
		">1": { action: "status", text: "you've reached the Glade, there's no need to backtrack now, and you can't head towards the fortress yet either." }
	  },



	  dwood_shrine: {
		1: { action: "status", text: "you can't reach the shrine yet." },
		2: { action: "run", mission: "dwood_1" },
		3: { action: "run", mission: "dwood_1" },
		4: { action: "status", text: "The stone shrine stands in eternal peace." }
	  },

	  dwood_swamp: {
		1: { action: "status", text: "you can't reach the swamp yet." },
		2: { action: "status", mission: "you dread facing the Trollkin without a plan..." },
		3: { action: "status", mission: "you dread facing the Trollkin without a plan..." },
		4: { action: "run", text: "dwood_swamp1" }
	  },
	  
	  dwood_platform: {
		"*": { action: "run", mission: "dwoodplat_1" }
	  }

	  // add more nodes here...
	};

    pushStatus("Nothing interesting happens here.");
    console.warn("Unknown mission node clicked:", nodeId);
}

function matchesCondition(condition, value) {
  if (!isNaN(condition)) return Number(condition) === value;

  const match = condition.match(/(>=|<=|>|<)(\d+)/);
  if (!match) return false;

  const [, operator, num] = match;
  const n = Number(num);

  switch (operator) {
    case ">":  return value > n;
    case "<":  return value < n;
    case ">=": return value >= n;
    case "<=": return value <= n;
  }
}

function handleNodeEntry(nodeId, player, missionId) {
  const rules = missionRules[nodeId];
  if (!rules) return;

  const missionState = player.missions.dwood_1; // or dynamic if needed

  for (const condition in rules) {
    if (matchesCondition(condition, missionState)) {
      const rule = rules[condition];

      if (rule.action === "run") {
        runMission(rule.mission || missionId);
      }

      if (rule.action === "status") {
        pushStatus(rule.text);
      }

      return; // stop after first match
    }
  }
}


function openMissionNode(nodeId) {
    const node = missionNodes[nodeId];

    if (!node) {
        pushStatus("Unknown mission node: " + nodeId);
        return;
    }

    // Check progression requirement
    // if (node.requires && !player.missions[node.requires]) {
        // pushStatus(`You cannot access ${node.title} yet.`);
        // return;
    // }

    // Show a short message instead of a popup
    pushStatus(`${node.title}: ${node.desc}`);
    // Store selected node for engagement
    selectedNode = node;
	runMission(node.missionId);
}
