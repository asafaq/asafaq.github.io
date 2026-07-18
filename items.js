function rollCheeseDice(diceNotation = "1dcheese") {
  const cheeses = [
    "American", "Asadero", "Asiago", "Blue Cheese", "Boursin", "Brie", 
    "Burrata", "Camembert", "Casu Marzu", "Cheddar", "Cheese Curds", "Chevre", 
    "Colby", "Colby-Jack", "Cotija", "Cottage Cheese", "Cream Cheese", 
    "Danish Blue", "Edam", "Emmental", "Feta", "Fontina", "Gorgonzola", 
    "Gouda", "Gruyere", "Halumi", "Havarti", "Jarlsberg", "Labneh", 
    "Limburger", "Manchego", "Mascarpone", "Monterey Jack", "Mozzarella", 
    "Muenster", "Nacho Cheese", "Paneer", "Parmigiano", "Pepper Jack", 
    "Provolone", "Quark", "Queso Blanco", "Queso Crema", "Queso Fresco", 
    "Raclette", "Ricotta", "Romano", "Roquefort", "Stilton", "String Cheese", 
    "Swiss", "Taleggio", "Wensleydale"
  ];

  // Extract the number from notations like "2dcheese", "1dcheese", or just a number
  const match = String(diceNotation).toLowerCase().match(/^(\d+)\s*d?\s*cheese$/);
  const count = match ? parseInt(match[1], 10) : parseInt(diceNotation, 10);

  // Validate the count input
  if (isNaN(count) || count < 1) {
    throw new Error("Invalid format. Use examples like '1dcheese', '3dcheese', or a valid number.");
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * cheeses.length);
    results.push(cheeses[randomIndex]);
  }

  return results;
}

// Examples of how to use it:
// console.log(rollCheeseDice("1dcheese")); // Returns: ['Gouda']
// console.log(rollCheeseDice("3dcheese")); // Returns: ['Brie', 'Swiss', 'Feta']
// console.log(rollCheeseDice(2));          // Returns: ['Cheddar', 'Provolone']

function generateGem(count = 1, rarity = null, color = null, cutShape = "raw") {
  let pool = GEMSTONES;

  // Filter by rarity
  if (rarity) {
    pool = pool.filter(g => g.rarity.toLowerCase() === rarity.toLowerCase());
  }

  // Filter by color
  if (color) {
    pool = pool.filter(g => g.color.toLowerCase() === color.toLowerCase());
  }

  if (pool.length === 0) return [];

  // Cut multipliers table
  const cutMultipliers = [
    { chance: 0.50, multiplier: 2 },
    { chance: 0.24, multiplier: 3 },
    { chance: 0.20, multiplier: 5 },
    { chance: 0.05, multiplier: 10 },
    { chance: 0.01, multiplier: 25 }
  ];

  function getCutMultiplier(shape) {
    if (shape === "raw") return 1;

    const roll = Math.random();
    let cumulative = 0;

    for (const entry of cutMultipliers) {
      cumulative += entry.chance;
      if (roll <= cumulative) {
        return entry.multiplier;
      }
    }

    return 1; // fallback (should never hit)
  }

  const results = [];

  for (let i = 0; i < count; i++) {
    const gem = pool[Math.floor(Math.random() * pool.length)];

    const finalCut = cutShape === "raw"
      ? "raw"
      : cutShape || CUT_SHAPES[Math.floor(Math.random() * CUT_SHAPES.length)];

    const multiplier = getCutMultiplier(finalCut);

    results.push({
      name: gem.name,
      rarity: gem.rarity,
      color: gem.color,
      cut: finalCut,
      baseValue: gem.value,
      finalValue: gem.value * multiplier
    });
  }

  return results;
}

// Example result:
// {
  // name: "amethyst",
  // rarity: "Semi-Precious",
  // value: 20,
  // color: "amethyst",
  // cut: "princess"
// }


const GEMSTONES = [
  // --- ORNAMENTAL ---
  { rarity: "Ornamental", name: "amber opal", value: 10, color: "amber" },
  { rarity: "Ornamental", name: "aventurine", value: 3, color: "mint green" },
  { rarity: "Ornamental", name: "banded agate", value: 2, color: "maroon" },
  { rarity: "Ornamental", name: "bloodstone", value: 2, color: "sea green" },
  { rarity: "Ornamental", name: "blue jade", value: 2, color: "blue" },
  { rarity: "Ornamental", name: "bone opal", value: 10, color: "beige" },
  { rarity: "Ornamental", name: "brown jasper", value: 2, color: "brown" },
  { rarity: "Ornamental", name: "carnelian", value: 2, color: "rust" },
  { rarity: "Ornamental", name: "cherry opal", value: 10, color: "chestnut" },
  { rarity: "Ornamental", name: "chrysocolla", value: 2, color: "turquoise" },
  { rarity: "Ornamental", name: "chrysoprase", value: 2, color: "jade" },
  { rarity: "Ornamental", name: "citrine", value: 2, color: "cream" },
  { rarity: "Ornamental", name: "clear tourmaline", value: 10, color: "clear" },
  { rarity: "Ornamental", name: "dendritic agate", value: 2, color: "ivory" },
  { rarity: "Ornamental", name: "fire agate", value: 2, color: "lemon" },
  { rarity: "Ornamental", name: "fortification agate", value: 2, color: "cardinal" },
  { rarity: "Ornamental", name: "gold opal", value: 10, color: "golden yellow" },
  { rarity: "Ornamental", name: "gray chalcedony", value: 2, color: "gray" },
  { rarity: "Ornamental", name: "jasper opal", value: 10, color: "maroon" },
  { rarity: "Ornamental", name: "lace agate", value: 2, color: "light blue" },
  { rarity: "Ornamental", name: "lapis lazuli", value: 2, color: "azure" },
  { rarity: "Ornamental", name: "lavender jade", value: 2, color: "heliotrope" },
  { rarity: "Ornamental", name: "milk opal", value: 10, color: "cream" },
  { rarity: "Ornamental", name: "milk quartz", value: 2, color: "cream" },
  { rarity: "Ornamental", name: "moonstone", value: 2, color: "ivory" },
  { rarity: "Ornamental", name: "morion", value: 2, color: "black" },
  { rarity: "Ornamental", name: "moss agate", value: 2, color: "white" },
  { rarity: "Ornamental", name: "moss opal", value: 10, color: "moss green" },
  { rarity: "Ornamental", name: "onyx opal", value: 10, color: "ivory" },
  { rarity: "Ornamental", name: "onyx", value: 2, color: "black" },
  { rarity: "Ornamental", name: "picture jasper", value: 3, color: "golden yellow" },
  { rarity: "Ornamental", name: "pineapple opal", value: 10, color: "beige" },
  { rarity: "Ornamental", name: "pink jade", value: 2, color: "pink" },
  { rarity: "Ornamental", name: "pipe opal", value: 10, color: "ivory" },
  { rarity: "Ornamental", name: "plume agate", value: 2, color: "cream" },
  { rarity: "Ornamental", name: "prase opal", value: 10, color: "mint green" },
  { rarity: "Ornamental", name: "prase", value: 2, color: "spring green" },
  { rarity: "Ornamental", name: "pyrite", value: 2, color: "silver" },
  { rarity: "Ornamental", name: "resin opal", value: 10, color: "yellow" },
  { rarity: "Ornamental", name: "rock crystal", value: 2, color: "clear" },
  { rarity: "Ornamental", name: "rose quartz", value: 3, color: "pink" },
  { rarity: "Ornamental", name: "sardonyx", value: 2, color: "scarlet" },
  { rarity: "Ornamental", name: "sard", value: 2, color: "mahogany" },
  { rarity: "Ornamental", name: "schorl", value: 2, color: "taupe dark" },
  { rarity: "Ornamental", name: "shell opal", value: 10, color: "ivory" },
  { rarity: "Ornamental", name: "smoky quartz", value: 2, color: "olive" },
  { rarity: "Ornamental", name: "sunstone", value: 2, color: "pumpkin" },
  { rarity: "Ornamental", name: "tiger iron", value: 2, color: "golden yellow" },
  { rarity: "Ornamental", name: "tigereye", value: 2, color: "lemon" },
  { rarity: "Ornamental", name: "tube agate", value: 2, color: "amber" },
  { rarity: "Ornamental", name: "turquoise", value: 2, color: "turquoise" },
  { rarity: "Ornamental", name: "variscite", value: 2, color: "jade" },
  { rarity: "Ornamental", name: "wax opal", value: 10, color: "flax" },
  { rarity: "Ornamental", name: "white chalcedony", value: 2, color: "white" },
  { rarity: "Ornamental", name: "white jade", value: 2, color: "white" },
  { rarity: "Ornamental", name: "wood opal", value: 10, color: "dark brown" },
  { rarity: "Ornamental", name: "yellow jasper", value: 2, color: "yellow" },

  // --- PRECIOUS ---
  { rarity: "Precious", name: "emerald", value: 40, color: "emerald" },
  { rarity: "Precious", name: "faint yellow diamond", value: 40, color: "beige" },
  { rarity: "Precious", name: "ruby", value: 40, color: "scarlet" },
  { rarity: "Precious", name: "sapphire", value: 40, color: "azure" },

  // --- RARE ---
  { rarity: "Rare", name: "black diamond", value: 60, color: "black" },
  { rarity: "Rare", name: "blue diamond", value: 60, color: "blue" },
  { rarity: "Rare", name: "clear diamond", value: 60, color: "clear" },
  { rarity: "Rare", name: "green diamond", value: 60, color: "green" },
  { rarity: "Rare", name: "red diamond", value: 60, color: "scarlet" },
  { rarity: "Rare", name: "star ruby", value: 60, color: "red" },
  { rarity: "Rare", name: "star sapphire", value: 60, color: "light blue" },
  { rarity: "Rare", name: "yellow diamond", value: 60, color: "yellow" },

  // --- SEMI-PRECIOUS ---
  { rarity: "Semi-Precious", name: "alexandrite", value: 20, color: "violet" },
  { rarity: "Semi-Precious", name: "almandine", value: 20, color: "maroon" },
  { rarity: "Semi-Precious", name: "amethyst", value: 20, color: "amethyst" },
  { rarity: "Semi-Precious", name: "aquamarine", value: 20, color: "aquamarine" },
  { rarity: "Semi-Precious", name: "bandfire opal", value: 20, color: "pearl" },
  { rarity: "Semi-Precious", name: "black opal", value: 30, color: "black" },
  { rarity: "Semi-Precious", name: "black pyrope", value: 20, color: "black" },
  { rarity: "Semi-Precious", name: "black zircon", value: 20, color: "black" },
  { rarity: "Semi-Precious", name: "blue garnet", value: 30, color: "blue" },
  { rarity: "Semi-Precious", name: "brown zircon", value: 20, color: "light brown" },
  { rarity: "Semi-Precious", name: "cat's eye", value: 20, color: "cream" },
  { rarity: "Semi-Precious", name: "chrysoberyl", value: 20, color: "chartreuse" },
  { rarity: "Semi-Precious", name: "cinnamon grossular", value: 20, color: "cinnamon" },
  { rarity: "Semi-Precious", name: "claro opal", value: 20, color: "light blue" },
  { rarity: "Semi-Precious", name: "clear garnet", value: 20, color: "clear" },
  { rarity: "Semi-Precious", name: "clear zircon", value: 25, color: "clear" },
  { rarity: "Semi-Precious", name: "crystal opal", value: 20, color: "clear" },
  { rarity: "Semi-Precious", name: "demantoid", value: 30, color: "green-yellow" },
  { rarity: "Semi-Precious", name: "fire opal", value: 15, color: "scarlet" },
  { rarity: "Semi-Precious", name: "golden beryl", value: 20, color: "golden yellow" },
  { rarity: "Semi-Precious", name: "goshenite", value: 20, color: "clear" },
  { rarity: "Semi-Precious", name: "green jade", value: 20, color: "jade" },
  { rarity: "Semi-Precious", name: "green tourmaline", value: 20, color: "green" },
  { rarity: "Semi-Precious", name: "green zircon", value: 20, color: "green" },
  { rarity: "Semi-Precious", name: "harlequin opal", value: 20, color: "ivory" },
  { rarity: "Semi-Precious", name: "heliodor", value: 20, color: "green-yellow" },
  { rarity: "Semi-Precious", name: "honey yellow beryl", value: 20, color: "saffron" },
  { rarity: "Semi-Precious", name: "indigo tourmaline", value: 25, color: "indigo" },
  { rarity: "Semi-Precious", name: "jelly opal", value: 15, color: "clear" },
  { rarity: "Semi-Precious", name: "kunzite", value: 20, color: "fuchsia" },
  { rarity: "Semi-Precious", name: "levin opal", value: 20, color: "flax" },
  { rarity: "Semi-Precious", name: "light yellow diamond", value: 30, color: "cream" },
  { rarity: "Semi-Precious", name: "melanite", value: 15, color: "black" },
  { rarity: "Semi-Precious", name: "morganite", value: 20, color: "lilac" },
  { rarity: "Semi-Precious", name: "peridot", value: 20, color: "green-yellow" },
  { rarity: "Semi-Precious", name: "pinfire opal", value: 20, color: "flax" },
  { rarity: "Semi-Precious", name: "pink garnet", value: 20, color: "pink" },
  { rarity: "Semi-Precious", name: "pink tourmaline", value: 15, color: "pink" },
  { rarity: "Semi-Precious", name: "precious fire opal", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "purple spinel", value: 20, color: "purple" },
  { rarity: "Semi-Precious", name: "red beryl", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "red flash opal", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "red grossular", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "red pyrope", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "red spinel", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "red tourmaline", value: 15, color: "chestnut" },
  { rarity: "Semi-Precious", name: "red zircon", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "rhodolite", value: 20, color: "puce" },
  { rarity: "Semi-Precious", name: "rubicelle", value: 20, color: "red" },
  { rarity: "Semi-Precious", name: "tanzanite", value: 20, color: "azure" },
  { rarity: "Semi-Precious", name: "topazolite", value: 20, color: "saffron" },
  { rarity: "Semi-Precious", name: "topaz", value: 20, color: "goldenrod" },
  { rarity: "Semi-Precious", name: "tsavorite", value: 30, color: "green" },
  { rarity: "Semi-Precious", name: "violet spessartine", value: 20, color: "violet" },
  { rarity: "Semi-Precious", name: "white opal", value: 20, color: "white" },
  { rarity: "Semi-Precious", name: "yellow grossular", value: 20, color: "yellow" },
  { rarity: "Semi-Precious", name: "yellow spessartine", value: 20, color: "yellow" },
  { rarity: "Semi-Precious", name: "yellow zircon", value: 20, color: "yellow" },

  // --- SYNTHETIC ---
  { rarity: "Synthetic", name: "green glass", value: 2, color: "dark green" },
  { rarity: "Synthetic", name: "clear glass", value: 5, color: "clear" },
  { rarity: "Synthetic", name: "crystal glass", value: 10, color: "clear" }
];

const CUT_SHAPES = [
  // --- CLASSIC FACETED CUTS ---
  "round brilliant",
  "old mine",
  "single cut",
  "rose cut",
  "table",

  // --- FANCY DIAMOND CUTS ---
  "princess",
  "emerald",
  "asscher",
  "radiant",
  "cushion",
  "marquise",
  "oval",
  "pear",
  "heart",
  "trillion",
  "tapered baguette",
  "straight baguette",
  "baguette",
  "point",

  // --- COLORED GEMSTONE CUTS ---
  "step cut",
  "mixed cut",
  "brilliant cut",
  "checkerboard",
  "concave cut",
  "octagon",
  "square brilliant",
  "square",

  // --- CABOCHON & SMOOTH CUTS ---
  "cabochon",
  "double cabochon",
  "sugarloaf",
  "buff top",
  "cushion cabochon",
  "oval cabochon",
  "rectangular cabochon",
  "round cabochon",

  // --- SPECIALTY & ARTISTIC CUTS ---
  "fantasy cut",
  "barion cut",
  "hearts and arrows",
  "star cut",
  "flower cut",
  "spiral cut",
  "hexagon",
  "kite",
  "shield",
  "lozenge",
  "briolette",
  "bullet",
  "trapezoid",
];


