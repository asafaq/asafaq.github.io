async function startGame() {
    await Database.init();

	// const storage = new databaseStorage();
	// const username = storage.getPlayer(username);
    const save = await Database.get("playerData");

    if (save) {
        console.log("Loaded save:", save);
    } else {
        console.log("No save found, starting new game");
    }
}


function loadPage(page) {
  const main = document.getElementById("mainWindow");

// 1. Define your patron data in an array. 
// You can easily add up to 12 objects here.
// 1. Single source of truth with the 'location' key
const patronList = [
  { 
    name: "Patron One", 
    location: 1, // 1 = In the guild, 0 = Out
    top: "300px", 
    left: "380px", 
    icon: "assets/patrons/hogperson_s.png", 
    large: "assets/patrons/p1_full.png" 
  },
  { 
    name: "Patron Two", 
    location: 1, // If set to 0 = This patron is currently "Out" and won't be rendered
    top: "220px", 
    left: "380px", 
    icon: "assets/patrons/dwarven_miner_s.png", 
    large: "assets/patrons/p2_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 1, 
    top: "400px", 
    left: "120px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  { 
    name: "Future Patron", 
    location: 0, 
    top: "550px", 
    left: "100px", 
    icon: "assets/patrons/amyssa_s.png", 
    large: "assets/patrons/p3_full.png" 
  },
  // You can fill out all 12 here with location: 0
];


  const pages = {
    guild: `
      <div id="guild-container">
        <img id="guild-image" src="assets/guild/guild.png" />

        <div class="guild_License" style="top: 160px; left: 240px;">
          <img src="assets/guild/License_icon.png" class="item-icon">

          <div class="hover-zone"
               data-label="Guild License"
               data-large="assets/guild/adventurers_License_50.png">
          </div>

          <div class="tooltip"></div>
        </div>
		
		<div class="guild_stash" style="top: 200px; left: 80px;">
          <img src="assets/guild/chest60.png" class="item-icon">
          <div class="hover-zone"
               data-label="Guild Stash"
               data-large="assets/guild/inventory.png">
          </div>
          <div class="tooltip"></div>
        </div>
		${patronList
				.filter(patron => patron.location === 1) 
				.map(patron => `
				  <div class="patron-wrapper" style="position: absolute; top: ${patron.top}; left: ${patron.left};">
					<img src="${patron.icon}" class="item-icon">
					<div class="hover-zone"
						 data-label="${patron.name}"
						 data-large="${patron.large}">
					</div>
					<div class="tooltip"></div>
				  </div>
				`).join('')}
			</div>
		  `,
		// this patrons will open 2 default patrons, but in the future needs to be able to read from DB which partons are inhouse to display.
    contracts: `
      <div id="contracts-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<p style="margin: 40px; color: black;">Welcome to the guild contracts.<br>
		this is W.I.P<br>
		please return after completing the<br>
		tutorial.</p>
		</div>
		`,
    missions: `
      <div id="missions-container">
        <img id="contract_parchment" src="assets/missions/guild_party_party_window.png" />
		<p>Guild<br>
		Party A<br>
		Patry B</p>
		</div>
		`
    // other pages...
  };

  main.innerHTML = pages[page] || "<p>Unknown page</p>";

  if (page === "guild") {
    loadPhaserScripts();
    initGuildTooltips();   // <-- important
  }
}

function initGuildTooltips() {
  document.querySelectorAll('.guild_License').forEach(unit => {
    const zone = unit.querySelector('.hover-zone');
    const tooltip = unit.querySelector('.tooltip');

	let clickActive = false;
	
	zone.addEventListener('mousedown', (e) => {
		e.preventDefault(); // stops right-click menu
		clickActive = true;

		const label = zone.dataset.label;
		openWindow(label, largeSrc);

		if (tooltip.style.display === "block") {
			tooltip.style.display = "none";
		} else {
			tooltip.innerHTML = `<img src="${largeSrc}">`;
			tooltip.style.display = "block";
		}
	});
    zone.addEventListener('mouseenter', () => {
		if (!clickActive) {
		  const largeSrc = zone.dataset.large;
		  tooltip.innerHTML = `<img src="${largeSrc}">`;
		  tooltip.style.display = "block";
		}
	});
    zone.addEventListener('mouseleave', () => {
		if (!clickActive) {
		  tooltip.style.display = "none";
		}
	});
	document.addEventListener('mousedown', (e) => {		//this makes sure the window closes when user clicks elsewhere.
	  if (!unit.contains(e.target)) {
		tooltip.style.display = "none";
	  }
	});		
    // zone.addEventListener('touchstart', (e) => {
	  // if (clickActive) return;
      // e.preventDefault();
      // const largeSrc = zone.dataset.large;

      // if (tooltip.style.display === "block") {
        // tooltip.style.display = "none";
      // } else {
        // tooltip.innerHTML = `<img src="${largeSrc}">`;
        // tooltip.style.display = "block";
      // }
    // });

    // document.addEventListener('touchstart', (e) => {
      // if (!unit.contains(e.target)) {
        // tooltip.style.display = "none";
      // }
    // });
  });
}

// data-label="Guild licence"
// data-large="assets/guild/adventurers_licence_50.png"
function openWindow(label, imageSrc) {
  const container = document.getElementById("window-container");

  container.innerHTML = `
    <div class="window">
      <div class="window-header">
        <span>${label}</span>
        <button class="close-window">X</button>
      </div>
      <div class="window-body">
        <img src="${imageSrc}">
      </div>
    </div>
  `;

  container.style.display = "block";

  container.querySelector(".close-window").addEventListener("click", () => {
    container.style.display = "none";
  });
  container.addEventListener("mousedown", (e) => {
    if (e.target === container) {
  container.style.display = "none";
  }
  });

}

function loadPhaserScripts() {
  const scripts = [
    "node_modules/phaser/dist/phaser.js",
  ];

  scripts.forEach(src => {
    const s = document.createElement("script");
    s.src = src;
    document.body.appendChild(s);
  });
}