{
  "encounter_type": "champion_knight",
  "alignment": [
    "Good",
    "Neutral",
    "Evil"
  ],
  "race": [
    "Human",
    "Elf",
    "Dwarf",
    "Orc",
    "Tiefling",
    "Dragonborn",
    "Halfling",
    "Gnome",
    "Half‑Elf",
    "Undead (Cursed Knight)",
    "Construct (Clockwork Knight)"
  ],
  "title": [
    "Knight-Errant",
    "Champion of the Realm",
    "Wandering Blade",
    "Oathbound Defender",
    "Blackguard",
    "Holy Crusader",
    "Shadow Knight",
    "Storm Herald",
    "Iron Vanguard"
  ],
  "mission": [
    "Recover a stolen relic of immense power",
    "Hunt down a fugitive sorcerer",
    "Escort a sacred caravan through dangerous lands",
    "Investigate rumors of a rising cult",
    "Challenge any worthy opponent to test their skill",
    "Seek redemption for past sins",
    "Deliver a message of grave importance",
    "Slay a monstrous creature terrorizing villages",
    "Protect a young noble traveling incognito",
    "Retrieve a lost companion taken by dark forces"
  ],
  "personality": [
    "Stoic and disciplined",
    "Warm-hearted and honorable",
    "Cold and calculating",
    "Arrogant but skilled",
    "Quiet and mysterious",
    "Driven by vengeance",
    "Cheerful and overly confident",
    "Reluctant hero with a troubled past"
  ],
  "background": [
    "Raised in a remote monastery",
    "Former soldier who deserted after witnessing corruption",
    "Noble-born but cast out for refusing a political marriage",
    "Orphan adopted by a legendary knight",
    "Once a bandit, now sworn to a righteous path",
    "Cursed by ancient magic, seeking a cure",
    "Trained by dragons in forgotten mountains",
    "Survivor of a kingdom destroyed by war",
    "Exiled from their homeland for forbidden magic"
  ],
  "equipment": {
    "weapon": [
      "Runeblade forged in celestial fire",
      "Massive greatsword etched with ancient sigils",
      "Twin sabers blessed by forest spirits",
      "Black iron mace humming with dark energy",
      "Spear carved from the bone of a giant",
      "Enchanted longsword that whispers guidance",
      "Warhammer that crackles with lightning"
    ],
    "armor": [
      "Gleaming silver plate armor",
      "Dark obsidian armor that absorbs light",
      "Weathered chainmail patched many times",
      "Ceremonial armor decorated with holy symbols",
      "Heavy dwarven-forged battleplate",
      "Lightweight elven armor woven from moonsteel"
    ],
    "trinket": [
      "A locket containing a portrait of a lost loved one",
      "A broken ring that once held magical power",
      "A map with cryptic markings",
      "A coin that always lands on its edge",
      "A small dragon scale gifted by a mentor",
      "A charm that glows when danger approaches"
    ]
  },
  "special_trait": [
    "Can sense lies within a short distance",
    "Has prophetic dreams that guide their path",
    "Cannot be magically compelled or charmed",
    "Carries a curse that slowly drains their life",
    "Can speak with spirits of fallen warriors",
    "Has unnatural resilience to pain",
    "Can temporarily summon spectral armor",
    "Is secretly being hunted by celestial beings"
  ],
  "encounter_hooks": [
    "The knight mistakes the party for enemies or rivals",
    "The knight urgently requests aid for their mission",
    "The knight challenges the strongest party member",
    "The knight collapses from exhaustion or wounds",
    "The knight carries information the party desperately needs",
    "The knight is being tracked by assassins",
    "The knight’s mission directly opposes the party’s goals",
    "The knight offers a dangerous alliance"
  ]
}

{
  "systems": {
    "champion_knight_encounter": {
      "meta": {
        "id": "champion_knight",
        "category": "npc_encounter",
        "tags": ["knight", "champion", "mission", "procedural"]
      },
      "rules": {
        "alignment_weights": {
          "Good": 0.4,
          "Neutral": 0.35,
          "Evil": 0.25
        },
        "race_by_alignment": {
          "Good": ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn"],
          "Neutral": ["Human", "Elf", "Gnome", "Half-Elf", "Construct (Clockwork Knight)"],
          "Evil": ["Orc", "Tiefling", "Undead (Cursed Knight)", "Dragonborn", "Blackguard Variant"]
        },
        "title_by_alignment": {
          "Good": ["Champion of the Realm", "Holy Crusader", "Oathbound Defender", "Knight-Errant"],
          "Neutral": ["Wandering Blade", "Storm Herald", "Iron Vanguard"],
          "Evil": ["Blackguard", "Shadow Knight", "Bloodbound Enforcer"]
        },
        "mission_alignment_bias": {
          "Good": ["Protect", "Rescue", "Redeem"],
          "Neutral": ["Investigate", "Test", "Deliver"],
          "Evil": ["Hunt", "Dominate", "Sabotage"]
        },
        "difficulty_scale": {
          "low": { "hp_multiplier": 0.8, "damage_multiplier": 0.7 },
          "medium": { "hp_multiplier": 1.0, "damage_multiplier": 1.0 },
          "high": { "hp_multiplier": 1.3, "damage_multiplier": 1.2 },
          "boss": { "hp_multiplier": 1.7, "damage_multiplier": 1.5 }
        }
      },
      "pools": {
        "alignment": ["Good", "Neutral", "Evil"],
        "race": [
          "Human", "Elf", "Dwarf", "Orc", "Tiefling", "Dragonborn",
          "Halfling", "Gnome", "Half-Elf", "Undead (Cursed Knight)",
          "Construct (Clockwork Knight)"
        ],
        "title": [
          "Knight-Errant", "Champion of the Realm", "Wandering Blade",
          "Oathbound Defender", "Blackguard", "Holy Crusader",
          "Shadow Knight", "Storm Herald", "Iron Vanguard"
        ],
        "mission": [
          "Recover a stolen relic of immense power",
          "Hunt down a fugitive sorcerer",
          "Escort a sacred caravan through dangerous lands",
          "Investigate rumors of a rising cult",
          "Challenge any worthy opponent to test their skill",
          "Seek redemption for past sins",
          "Deliver a message of grave importance",
          "Slay a monstrous creature terrorizing villages",
          "Protect a young noble traveling incognito",
          "Retrieve a lost companion taken by dark forces"
        ],
        "personality": [
          "Stoic and disciplined",
          "Warm-hearted and honorable",
          "Cold and calculating",
          "Arrogant but skilled",
          "Quiet and mysterious",
          "Driven by vengeance",
          "Cheerful and overly confident",
          "Reluctant hero with a troubled past"
        ],
        "background": [
          "Raised in a remote monastery",
          "Former soldier who deserted after witnessing corruption",
          "Noble-born but cast out for refusing a political marriage",
          "Orphan adopted by a legendary knight",
          "Once a bandit, now sworn to a righteous path",
          "Cursed by ancient magic, seeking a cure",
          "Trained by dragons in forgotten mountains",
          "Survivor of a kingdom destroyed by war",
          "Exiled from their homeland for forbidden magic"
        ],
        "equipment": {
          "weapon": [
            "Runeblade forged in celestial fire",
            "Massive greatsword etched with ancient sigils",
            "Twin sabers blessed by forest spirits",
            "Black iron mace humming with dark energy",
            "Spear carved from the bone of a giant",
            "Enchanted longsword that whispers guidance",
            "Warhammer that crackles with lightning"
          ],
          "armor": [
            "Gleaming silver plate armor",
            "Dark obsidian armor that absorbs light",
            "Weathered chainmail patched many times",
            "Ceremonial armor decorated with holy symbols",
            "Heavy dwarven-forged battleplate",
            "Lightweight elven armor woven from moonsteel"
          ],
          "trinket": [
            "A locket containing a portrait of a lost loved one",
            "A broken ring that once held magical power",
            "A map with cryptic markings",
            "A coin that always lands on its edge",
            "A small dragon scale gifted by a mentor",
            "A charm that glows when danger approaches"
          ]
        },
        "special_trait": [
          "Can sense lies within a short distance",
          "Has prophetic dreams that guide their path",
          "Cannot be magically compelled or charmed",
          "Carries a curse that slowly drains their life",
          "Can speak with spirits of fallen warriors",
          "Has unnatural resilience to pain",
          "Can temporarily summon spectral armor",
          "Is secretly being hunted by celestial beings"
        ],
        "encounter_hooks": [
          "The knight mistakes the party for enemies or rivals",
          "The knight urgently requests aid for their mission",
          "The knight challenges the strongest party member",
          "The knight collapses from exhaustion or wounds",
          "The knight carries information the party desperately needs",
          "The knight is being tracked by assassins",
          "The knight’s mission directly opposes the party’s goals",
          "The knight offers a dangerous alliance"
        ],
        "mount": [
          "Warhorse with battle scars",
          "Spectral steed wreathed in pale flame",
          "Armored dire wolf",
          "Clockwork charger powered by arcane gears",
          "Winged griffon",
          "Humble mule that’s tougher than it looks"
        ],
        "companion": [
          "Young squire eager to prove themselves",
          "Silent robed figure who never removes their hood",
          "Cursed raven that speaks in riddles",
          "Spirit of a fallen comrade bound to their armor",
          "Old mentor traveling with them one last time",
          "Mysterious child who seems out of place"
        ],
        "combat_style": [
          "Defensive bulwark",
          "Relentless berserker",
          "Precise duelist",
          "Spellblade mixing steel and sorcery",
          "Tactician who controls the battlefield",
          "Executioner who ends fights quickly"
        ],
        "speech_style": [
          "Formal and archaic",
          "Blunt and direct",
          "Poetic and metaphorical",
          "Gruff but kind",
          "Cryptic and evasive",
          "Calm and soothing"
        ],
        "order_faction": [
          "Sunward Paladins",
          "Obsidian Legion",
          "Verdant Circle",
          "Order of the Shattered Star",
          "Crimson Oath",
          "Silent Banner Company"
        ],
        "flags": [
          "is_wounded",
          "is_hunted",
          "is_undercover",
          "is_cursed",
          "is_celebrated_hero",
          "is_disgraced"
        ]
      },
      "templates": {
        "short_description": [
          "{alignment} {race} {title} approaches, clad in {armor} and wielding {weapon}.",
          "You encounter a {race} {title}, known for being {personality}, on a mission to {mission}.",
          "A {alignment} knight of the {order_faction} rides a {mount}, their {weapon} resting across their lap."
        ],
        "full_description": [
          "A {alignment} {race} {title} approaches, clad in {armor} and wielding {weapon}. {pronoun_cap} is {personality}, "
          + "with a past of being {background}. {pronoun_cap} now travels on a mission to {mission}, accompanied by {companion} "
          + "and riding a {mount}. {pronoun_cap} bears a {trinket} and is known to {special_trait}. "
          + "This encounter begins as {encounter_hook}.",
          
          "From the ranks of the {order_faction} comes a {alignment} {race} knight, a {title} whose combat style is {combat_style}. "
          + "Once {background}, {pronoun} now walks the land to {mission}. Speaking in a {speech_style} manner, "
          + "{pronoun} carries {trinket} and rides a {mount}. Rumor says {pronoun} can {special_trait}. "
          + "You cross paths when {encounter_hook}."
        ]
      }
    }
  }
}

const ChampionKnightSystem = {
  meta: {
    id: "champion_knight",
    category: "npc_encounter",
    tags: ["knight", "champion", "mission", "procedural"]
  },

  rules: {
    alignment_weights: {
      Good: 0.4,
      Neutral: 0.35,
      Evil: 0.25
    },

    race_by_alignment: {
      Good: ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn"],
      Neutral: ["Human", "Elf", "Gnome", "Half-Elf", "Construct (Clockwork Knight)"],
      Evil: ["Orc", "Tiefling", "Undead (Cursed Knight)", "Dragonborn", "Blackguard Variant"]
    },

    title_by_alignment: {
      Good: ["Champion of the Realm", "Holy Crusader", "Oathbound Defender", "Knight-Errant"],
      Neutral: ["Wandering Blade", "Storm Herald", "Iron Vanguard"],
      Evil: ["Blackguard", "Shadow Knight", "Bloodbound Enforcer"]
    },

    difficulty_scale: {
      low: { hp_multiplier: 0.8, damage_multiplier: 0.7 },
      medium: { hp_multiplier: 1.0, damage_multiplier: 1.0 },
      high: { hp_multiplier: 1.3, damage_multiplier: 1.2 },
      boss: { hp_multiplier: 1.7, damage_multiplier: 1.5 }
    }
  },

  pools: {
    alignment: ["Good", "Neutral", "Evil"],
    race: [
      "Human", "Elf", "Dwarf", "Orc", "Tiefling", "Dragonborn",
      "Halfling", "Gnome", "Half-Elf", "Undead (Cursed Knight)",
      "Construct (Clockwork Knight)"
    ],
    title: [
      "Knight-Errant", "Champion of the Realm", "Wandering Blade",
      "Oathbound Defender", "Blackguard", "Holy Crusader",
      "Shadow Knight", "Storm Herald", "Iron Vanguard"
    ],
    mission: [
      "Recover a stolen relic of immense power",
      "Hunt down a fugitive sorcerer",
      "Escort a sacred caravan through dangerous lands",
      "Investigate rumors of a rising cult",
      "Challenge any worthy opponent to test their skill",
      "Seek redemption for past sins",
      "Deliver a message of grave importance",
      "Slay a monstrous creature terrorizing villages",
      "Protect a young noble traveling incognito",
      "Retrieve a lost companion taken by dark forces"
    ],
    personality: [
      "Stoic and disciplined",
      "Warm-hearted and honorable",
      "Cold and calculating",
      "Arrogant but skilled",
      "Quiet and mysterious",
      "Driven by vengeance",
      "Cheerful and overly confident",
      "Reluctant hero with a troubled past"
    ],
    background: [
      "Raised in a remote monastery",
      "Former soldier who deserted after witnessing corruption",
      "Noble-born but cast out for refusing a political marriage",
      "Orphan adopted by a legendary knight",
      "Once a bandit, now sworn to a righteous path",
      "Cursed by ancient magic, seeking a cure",
      "Trained by dragons in forgotten mountains",
      "Survivor of a kingdom destroyed by war",
      "Exiled from their homeland for forbidden magic"
    ],
    equipment: {
      weapon: [
        "Runeblade forged in celestial fire",
        "Massive greatsword etched with ancient sigils",
        "Twin sabers blessed by forest spirits",
        "Black iron mace humming with dark energy",
        "Spear carved from the bone of a giant",
        "Enchanted longsword that whispers guidance",
        "Warhammer that crackles with lightning"
      ],
      armor: [
        "Gleaming silver plate armor",
        "Dark obsidian armor that absorbs light",
        "Weathered chainmail patched many times",
        "Ceremonial armor decorated with holy symbols",
        "Heavy dwarven-forged battleplate",
        "Lightweight elven armor woven from moonsteel"
      ],
      trinket: [
        "A locket containing a portrait of a lost loved one",
        "A broken ring that once held magical power",
        "A map with cryptic markings",
        "A coin that always lands on its edge",
        "A small dragon scale gifted by a mentor",
        "A charm that glows when danger approaches"
      ]
    },
    special_trait: [
      "Can sense lies within a short distance",
      "Has prophetic dreams that guide their path",
      "Cannot be magically compelled or charmed",
      "Carries a curse that slowly drains their life",
      "Can speak with spirits of fallen warriors",
      "Has unnatural resilience to pain",
      "Can temporarily summon spectral armor",
      "Is secretly being hunted by celestial beings"
    ],
    encounter_hooks: [
      "The knight mistakes the party for enemies or rivals",
      "The knight urgently requests aid for their mission",
      "The knight challenges the strongest party member",
      "The knight collapses from exhaustion or wounds",
      "The knight carries information the party desperately needs",
      "The knight is being tracked by assassins",
      "The knight’s mission directly opposes the party’s goals",
      "The knight offers a dangerous alliance"
    ],
    mount: [
      "Warhorse with battle scars",
      "Spectral steed wreathed in pale flame",
      "Armored dire wolf",
      "Clockwork charger powered by arcane gears",
      "Winged griffon",
      "Humble mule that’s tougher than it looks"
    ],
    companion: [
      "Young squire eager to prove themselves",
      "Silent robed figure who never removes their hood",
      "Cursed raven that speaks in riddles",
      "Spirit of a fallen comrade bound to their armor",
      "Old mentor traveling with them one last time",
      "Mysterious child who seems out of place"
    ],
    combat_style: [
      "Defensive bulwark",
      "Relentless berserker",
      "Precise duelist",
      "Spellblade mixing steel and sorcery",
      "Tactician who controls the battlefield",
      "Executioner who ends fights quickly"
    ],
    speech_style: [
      "Formal and archaic",
      "Blunt and direct",
      "Poetic and metaphorical",
      "Gruff but kind",
      "Cryptic and evasive",
      "Calm and soothing"
    ],
    order_faction: [
      "Sunward Paladins",
      "Obsidian Legion",
      "Verdant Circle",
      "Order of the Shattered Star",
      "Crimson Oath",
      "Silent Banner Company"
    ],
    flags: [
      "is_wounded",
      "is_hunted",
      "is_undercover",
      "is_cursed",
      "is_celebrated_hero",
      "is_disgraced"
    ]
  },

  templates: {
    full_description: [
      "A {alignment} {race} {title} approaches, clad in {armor} and wielding {weapon}. {pronoun_cap} is {personality}, with a past of being {background}. {pronoun_cap} now travels on a mission to {mission}, accompanied by {companion} and riding a {mount}. {pronoun_cap} bears a {trinket} and is known to {special_trait}. This encounter begins as {encounter_hook}.",

      "From the ranks of the {order_faction} comes a {alignment} {race} knight, a {title} whose combat style is {combat_style}. Once {background}, {pronoun} now walks the land to {mission}. Speaking in a {speech_style} manner, {pronoun} carries {trinket} and rides a {mount}. Rumor says {pronoun} can {special_trait}. You cross paths when {encounter_hook}."
    ]
  }
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomWeightedChoice(weightMap) {
  const entries = Object.entries(weightMap);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;

  for (const [key, weight] of entries) {
    if (r < weight) return key;
    r -= weight;
  }
}

function generateChampionKnightEncounter(system, difficulty = "medium") {
  const pools = system.pools;
  const rules = system.rules;

  const alignment = randomWeightedChoice(rules.alignment_weights);
  const race = randomChoice(rules.race_by_alignment[alignment]);
  const title = randomChoice(rules.title_by_alignment[alignment]);

  const mission = randomChoice(pools.mission);
  const personality = randomChoice(pools.personality);
  const background = randomChoice(pools.background);
  const weapon = randomChoice(pools.equipment.weapon);
  const armor = randomChoice(pools.equipment.armor);
  const trinket = randomChoice(pools.equipment.trinket);
  const special_trait = randomChoice(pools.special_trait);
  const encounter_hook = randomChoice(pools.encounter_hooks);
  const mount = randomChoice(pools.mount);
  const companion = randomChoice(pools.companion);
  const combat_style = randomChoice(pools.combat_style);
  const speech_style = randomChoice(pools.speech_style);
  const order_faction = randomChoice(pools.order_faction);

  const flags = [];
  if (Math.random() < 0.3) flags.push(randomChoice(pools.flags));
  if (Math.random() < 0.15) flags.push(randomChoice(pools.flags));

  const diff = rules.difficulty_scale[difficulty];

  const pronoun = "they";
  const pronoun_cap = "They";

  const template = randomChoice(system.templates.full_description);

  const description = template
    .replaceAll("{alignment}", alignment)
    .replaceAll("{race}", race)
    .replaceAll("{title}", title)
    .replaceAll("{armor}", armor)
    .replaceAll("{weapon}", weapon)
    .replaceAll("{mission}", mission)
    .replaceAll("{personality}", personality)
    .replaceAll("{background}", background)
    .replaceAll("{trinket}", trinket)
    .replaceAll("{special_trait}", special_trait)
    .replaceAll("{encounter_hook}", encounter_hook)
    .replaceAll("{mount}", mount)
    .replaceAll("{companion}", companion)
    .replaceAll("{combat_style}", combat_style)
    .replaceAll("{speech_style}", speech_style)
    .replaceAll("{order_faction}", order_faction)
    .replaceAll("{pronoun}", pronoun)
    .replaceAll("{pronoun_cap}", pronoun_cap);

  return {
    alignment,
    race,
    title,
    mission,
    personality,
    background,
    equipment: { weapon, armor, trinket },
    special_trait,
    encounter_hook,
    mount,
    companion,
    combat_style,
    speech_style,
    order_faction,
    flags,
    difficulty,
    difficulty_modifiers: diff,
    description
  };
}

const encounter = generateChampionKnightEncounter(ChampionKnightSystem, "medium");
console.log(encounter.description);
console.log(encounter);


