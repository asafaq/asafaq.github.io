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
        requiresTrait: null,
		requiresMemberName: "Hogperson"
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

//skills["Deception"]; // → "Charisma"
//skills.Survival;     // → "Wisdom"

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

function allPartyTraits(mission) {
    const m = mission || player?.missions?.current_mission || {};

    return [
        ...(m.party_traits_visible ?? []),
        ...(m.party_traits_hidden ?? [])
    ];
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

    return all.some(t => t.toLowerCase() === traitName.toLowerCase());
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

function findMemberTrait(traitName) {
    const patrons = player.patrons || {};
    const normalizedTrait = traitName.toLowerCase();

    const matches = [];

    for (const advId in patrons) {
        const patron = getHydratedAdventurer(advId);
        if (!patron) continue;

        // Must be in location 3
        if (patron.location !== 3) continue;

        // Must have traits
        if (!Array.isArray(patron.traits)) continue;

        // Check trait match (case-insensitive)
        const hasTrait = patron.traits.some(
            t => t.toLowerCase() === normalizedTrait
        );

        if (hasTrait) {
            matches.push(patron.name);
        }
    }

    return matches;
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

// Rule 1: Verifies a member is present by name if required by the mission rules
function ruleRequiredMember(members, rules) {
    if (!rules.requiresMemberName) return true;

    // Safe check ensuring m exists and has a name property
    const hasMember = members.some(m => m && m.name === rules.requiresMemberName);
    if (!hasMember) {
        return `This mission requires ${rules.requiresMemberName} to be present.`;
    }

    return true;
}

// Rule 2: Globally restricts "Crusher" from all missions except one unique adventure
function ruleGlobalRestrictedMember(members, rules) {
    const RESTRICTED_NAME = "Crusher";
    const EXCEPTION_MISSION_ID = "Crusher's Day Off"; // Replace with your actual exception ID

    const hasRestricted = members.some(m => m && m.name === RESTRICTED_NAME);
    const currentMissionId = player.missions.current_mission.id;

    // If Crusher is in the party, and it's NOT the allowed unique adventure
    if (hasRestricted && currentMissionId !== EXCEPTION_MISSION_ID) {
        return `${RESTRICTED_NAME} cannot go out on missions.`;
    }

    return true;
}



const validationRules = [
    ruleMinMembers,
    ruleMaxMembers,
    ruleRequiredRole,
    ruleRequiredTrait,
    ruleCasteCompatibility,
    ruleAlignmentCompatibility,
    ruleRequiredMember,
    ruleGlobalRestrictedMember
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


	// adv → the adventurer’s name or ID
	// ability → the ability modifier (e.g., charisma_mod)
	// prof → "yes" or "no" (or boolean)
	// dc → difficulty class (number)

	// const result = rollSkillCheck("Lira", "charisma_mod", "yes", 18);
	// console.log(result.total);
	// console.log(result.success); if true that's the skill check result
	
	// advType = "normal" → roll 1d20
	// advType = "advantage" → roll 2d20, take highest
	// advType = "disadvantage" → roll 2d20, take lowest

function rollSkillCheck(adv, ability, prof, dc, advType = "normal") {
    // Hydrate the adventurer
    const patron = getHydratedAdventurer(adv);
    if (!patron) {
        console.error("Adventurer not found:", adv);
        return { success: false, error: "Adventurer not found" };
    }

    // Ability modifier (e.g., patron.charisma_mod)
    const abilityMod = patron[ability] || 0;

    // Proficiency bonus
    const profBonus = (prof === "yes" || prof === true)
        ? getProficiencyBonus(patron)
        : 0;

    // Roll logic
    let roll1 = Math.ceil(Math.random() * 20);
    let roll2 = null;
    let finalRoll = roll1;

    if (advType === "advantage") {
        roll2 = Math.ceil(Math.random() * 20);
        finalRoll = Math.max(roll1, roll2);
    }

    if (advType === "disadvantage") {
        roll2 = Math.ceil(Math.random() * 20);
        finalRoll = Math.min(roll1, roll2);
    }

    // Total result
    const total = finalRoll + abilityMod + profBonus;

    // Success check
    const success = total >= dc;

    return {
        patron,
        roll1,
        roll2,
        finalRoll,
        abilityMod,
        profBonus,
        total,
        dc,
        success,
        advType
    };
}

const missionNodes = {
	
	// path : 1
	// shrine : 2,3
	// swamp : 4
	// fort :5 
	green_1: {   missionId: "green_1",	},
	green_2: {   missionId: "green_2",	},
	green_2_shrine: {   missionId: "greenshrine_1",	},
	greenshrine_2: { missionId: "greenshrine_2",	},
	green_3: {   missionId: "green_3",	},
    dwood_fort2: {
        title: "Darkwood Fort",
        desc: "The back sewers entrance to the fortified outpost deep in the Dark Woods.",
        missionId: "dwood_fort2",
        requires:  {	dwood_1: 5,
						dwood_fort1: 2
						}
    },
	
    dwood_fort: {
        title: "Darkwood Fort",
        desc: "A fortified outpost deep in the Dark Woods.",
        missionId: "dwood_fort1",
        requires:  {	dwood_1: 4	}
    },
    dwood_fort3: {
        title: "Darkwood Fort",
        desc: "A fortified outpost deep in the Dark Woods.",
        missionId: "dwood_fort3",
        requires:  {	dwood_fort2: 2	}
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
        title: "Awetruce lookout spot.",
		missionId: "dwoodplat_1",
		requires: { dwood_1: 0 }
				},
	
	dwood_glade: {
		missionId: "dwood_glade_1",
		requires: { dwood_1: 2 }
				}
};

function missionController(nodeId) {
    const current = player.missions.current_mission;
    const missionId = current.id;

    console.log("Mission Controller:", missionId, "Node:", nodeId);
	if (nodeId === "green_2_shrine") {
		const shrineKey = player.missions.green_2keys?.shrine || 0;

		if (shrineKey === 1) return openMissionNode("greenshrine_1");
		if (shrineKey === 2) return openMissionNode("greenshrine_2");
}

    // 1. Dark Woods / node-based missions
    if (missionNodes[nodeId]) {
		
		const node = missionNodes[nodeId];
		if (node && node.requires) {
			for (const reqMission in node.requires) {
				const requiredStage = node.requires[reqMission];
				const playerStage = player.missions[reqMission] || 0;


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

const encounterDB = {
    green_2: [
        {
            id: "g2_path",
            cr: "*",
            type: "status",
            weight: 100,
            desc: "The sun is shining, the path is clear, you stride on without interruptions.",
            tags: ["forest"]
        },
        {
            id: "g2_bandits",
            cr: 0.75,
            type: "combat",
            weight: 30,
            desc: "A small group of bandits ambush you.",
            // combat uses launchBattle(id) - not - missionId: "mission_banditAmbush",
            tags: ["hostile", "forest", "humanoid"]
        },
        {
            id: "g2_bandits2",
            cr: 2,
            type: "combat",
            weight: 30,
            desc: "A small group of bandits set a toll booth.",
            missionId: "green_2_g2_bandits2",
            tags: ["hostile", "forest", "humanoid", "dialog"]
        },
        {
            id: "g2_rustmon",
            cr: 1,
            type: "combat",
            weight: 30,
            desc: "A curious and ravenous large centipede-like creature rushes you.",
            tags: ["hostile", "forest"]
        },
        {
            id: "g2_rustmon2",
            cr: 2,
            type: "combat",
            weight: 30,
            desc: "A curious and ravenous large centipede-like creature rushes you.",
            tags: ["hostile", "forest"]
        },
        {
            id: "g2_kobolodogs1",
            cr: "*",
            type: "combat",
            weight: 50,
            desc: "A small group of bandits set a toll booth.",
            missionId: "green_2_g2_bandits2",
            tags: ["hostile", "forest", "humanoid", "dialog"]
        },
        {
            id: "green2_*2",
            cr: "4",
            type: "dialog",
            weight: 5,
            desc: "a Red Deer grazing nearby.",
            missionId: "green2_*2",
            tags: ["forest", "dialog", "combat", "neutral"]
        },
        {
            id: "green2_*21",
            cr: "4",
            type: "dialog",
            weight: 5,
            desc: "a travelling dwarven migrant.",
            missionId: "green2_*2",
            tags: ["forest", "dialog", "object", "currency", "neutral", "humanoid"]
        },
        {
            id: "green2_*1",
            cr: "*",
            type: "dialog",
            weight: 0.5,
            desc: "lucky adventure finding silver coins.",
            missionId: "green2_*1",
            tags: ["forest", "dialog", "object", "currency"]
        }
    ]
};

/* Unused encounterDB entries

,
        {
            id: "g2_hermit",
            cr: 1,
            type: "dialog",
            weight: 20,
            desc: "A wandering hermit offers cryptic advice.",
            missionId: "mission_hermitDialog",
            tags: ["npc", "story"]
        },
        {
            id: "g2_lostItem",
            cr: 0,
            type: "discovery",
            weight: 15,
            desc: "You discover a strange artifact half-buried in moss.",
            missionId: "mission_itemDiscovery",
            tags: ["loot", "artifact"]
        },
        {
            id: "g2_detour",
            cr: 1,
            type: "detour",
            weight: 15,
            desc: "A collapsed tree forces you to take a longer path.",
            missionId: "mission_detour",
            tags: ["environment", "movement"]
        },
        {
            id: "g2_spirit",
            cr: 3,
            type: "dialog",
            weight: 10,
            desc: "A forest spirit challenges your resolve.",
            missionId: "mission_spiritTrial",
            tags: ["mystical", "rare"]
        }
		
		
*/

function calculatePartyCR() {
    const mission = player.missions.current_mission;

    if (!mission || !mission.current_party) {
        console.warn("No active mission or party.");
        return 0;
    }

    // Your structure: current_party = "party_A"
    const partyKey = mission.current_party;

    if (partyKey !== "party_A") {
        console.warn("Party_A is not active.");
        return 0;
    }

    // Find all patrons in location 3 (party_A)
    const partyMembers = Object.values(player.patrons).filter(p => p.location === 3);

    if (partyMembers.length === 0) {
        console.warn("Party_A has no members.");
        return 0;
    }

    const classCount = {};
    let partyCR = 0;

    for (const member of partyMembers) {
        const classKey = member.expClassKey;

        if (!classCount[classKey]) classCount[classKey] = 0;
        classCount[classKey]++;

        const occurrence = classCount[classKey];

        const baseClassScore = Math.max(100 - (occurrence - 1) * 10, 10);
        const levelScore = baseClassScore * member.Level;
        const hpPercent = member.currentHP / member.MaxHP;
        const finalScore = levelScore * hpPercent;

        // console.log(             `Member ${member.name || member.id}: class=${classKey}, occ=${occurrence}, `             + `base=${baseClassScore}, levelScore=${levelScore}, hp%=${hpPercent}, final=${finalScore}`         );

        partyCR += finalScore;
    }

	partyCR /= 400; //adjusting to 5e CR of a balanced 4-men party.
    return partyCR;
}


const encounterSettings = {	// default for function pickEncounter
    useCRFilter: true,      // turn CR filtering on/off
    crTolerance: 0.25       // ±20% range (0.20 = 20%)
};

/*
const encounterSettings = {
    green_2: { useCRFilter: true, crTolerance: 0.20 },
    forest_1: { useCRFilter: false },
    desert_3: { useCRFilter: true, crTolerance: 0.40 }
};

*/
function pickEncounter(poiId, options = {}) {
    const table = encounterDB[poiId];
    if (!table) return null;

    // Merge defaults with user options
    const useCRFilter = options.useCRFilter ?? encounterSettings.useCRFilter;
    const crTolerance = options.crTolerance ?? encounterSettings.crTolerance;

    let finalTable = table;

    if (useCRFilter) {
        const partyCR = calculatePartyCR();

        const minCR = partyCR * (1 - crTolerance);
        const maxCR = partyCR * (1 + crTolerance);

	const filtered = table.filter(enc => {
		if (enc.cr === "*") return true; // wildcard = always allowed
		return enc.cr >= minCR && enc.cr <= maxCR;
	});

        if (filtered.length > 0) {
            finalTable = filtered;
        }
    }

    // Weighted RNG
    const totalWeight = finalTable.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const enc of finalTable) {
        if (roll < enc.weight) return enc;
        roll -= enc.weight;
    }

    return finalTable[finalTable.length - 1];
}

/* clicking a Node/POI on map >

missions_rules.js	function openMissionNode(nodeId)
ui.js			function runMission(node.missionId);
missions.js		startMissionSystem(startSceneId);


1. to make green_2 encounters, we have to start at openMissionNode(nodeId)
2. identify green_2
3. run a randomizers, start small with 2-3 events, and few passive events
4. log events in player.missions.green_2_events[]
5. make rules to progress green_2 in openMissionNode depending on events.
*/

async function openMissionNode(nodeId) {
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
    // Only green_2 uses the encounter database for now
	if (   nodeId === "green_2" && [2, 3, 5, 6, 7 ,8].includes(player.missions.green_2)
		) {
	const encounter = pickEncounter("green_2");
	
	player.missions[nodeId] += 1
	pushStatus(`Encounter: ${encounter.desc} (CR${encounter.cr}, ${encounter.type})`);
	// ⭐ NEW: Status encounters
	if (encounter.type === "status") {
		pushStatus(encounter.desc);
		return; // stop here, no combat or mission
	}

        // Combat encounters use your battle system
	if (encounter.type === "combat") {

		console.log(`⚔️ launchBattle() triggered for encounter.id="${encounter.id}"`);
		console.log(`Encounter object (full):`, encounter);
		console.log(`Executing command: launchBattle("${encounter.id}")`);

		try {
			console.log(`Calling launchBattle("${encounter.id}")...`);
			await launchBattle(encounter.id);
			console.log(`✔ launchBattle("${encounter.id}") completed successfully`);
		} catch (err) {
			console.error(`❌ launchBattle("${encounter.id}") FAILED`, err);
		}

	} else {

		console.log(`📜 runMission() triggered for encounter.missionId="${encounter.missionId}"`);
		console.log(`Encounter object (full):`, encounter);
		console.log(`Executing command: runMission("${encounter.missionId}")`);

		try {
			console.log(`Calling runMission("${encounter.missionId}")...`);
			runMission(encounter.missionId);
			console.log(`✔ runMission("${encounter.missionId}") completed successfully`);
		} catch (err) {
			console.error(`❌ runMission("${encounter.missionId}") FAILED`, err);
		}
	}

        return;
    }
	runMission(node.missionId);
}


