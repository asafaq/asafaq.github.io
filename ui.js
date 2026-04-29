

function loadPage(page) {
  const main = document.getElementById("mainWindow");

// 1. Define your patron data in an array. 
// You can easily add up to 12 objects here.
// 1. Single source of truth with the 'location' key
//	0 is Hidden
//	1	guild
//	2	tavern
//	3	mission
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
    location: 2, 
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
    icon: "assets/patrons/Claudio_s.png", 
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
	<button id="tutorial-button" class="tutorial-button">Start Tutorial</button>

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
		<p class="line1">Guild</p>
		<p class="line2">Party A</p>
		<p class="line3">Party B</p>
		</div>
		`,
	journal: `
      <div id="journal-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<p style="margin: 40px; color: black;">Welcome to the Journal.<br>
		this is where your adventures are recorded.<br>
		please return after completing the tutorial.</p>
		</div>
		`,
	mail: `
      <div id="mail-container">
        <img id="contract_parchment" src="assets/guild/contract_parchment.png" />
		<p style="margin: 40px; color: black;">Welcome to the guild contracts.<br>
		this is W.I.P<br>
		please return after completing the<br>
		tutorial.</p>
		</div>
		`,
	tavern: `
      <div id="tavern-container">
        <img id="contract_parchment" src="assets/guild/tavern.png" />
		<p style="margin: 40px; color: black;">Welcome to the Tavern! W.I.P<br>
		this is the room to find new adventurers looking for a contract, and where your past adventurers will wait and tell all their tales and exploits while soaking their sorrows and trauma in ales.<br>
		please return after completing the tutorial.</p>
		</div>
		${patronList
		.filter(patron => patron.location === 2) 
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

    // other pages...
  };

  main.innerHTML = pages[page] || "<p>Unknown page</p>";

  if (page === "guild") {
    //loadPhaserScripts();
    initGuildTooltips();   // <-- important
	showTutorialButton();
  }
}

function showTutorialButton() {
	if (player.data.tutor === 0) {
		const btn = document.getElementById("tutorial-button");
		if (btn) {
			btn.style.display = "block";
			console.log("tutorial-button:", player.data.tutor,);
			btn.onclick = function () {
                console.log("Tutorial button clicked");
                startTutorial();   // whatever you want to happen
				}
		} else {
			console.warn("tutorial-button element not found");
            };

	}
}

function startTutorial() {
	if (player.data.tutor === 0) {
		const win = document.querySelector(".tutorial-window");
		if (win) {
			const btn = document.getElementById("tutorial-button");
			if (btn) {
				btn.style.display = "none";}
			console.log("tutorial-window:", win);

			win.style.visibility = "visible";
			win.style.display = "block";
			win.classList.add("active");

			
    setTutorialChoices([
        {
            label: "start the Tutorial",
            action: () => {
                setTutorialText("Are you ready to start the Tutorial? This is going to take about 5-6 minutes of dialog.");
                setTutorialChoices([{ label: "OK", action: () => nextTutorialStep(1) }]);
            }
        },
        {
            label: "Go back",
            action: () => {
                setTutorialText("No, let me back.");
                setTutorialChoices([{ label: "Got it", action: () => closeTutorial() }]);
            }
        }
    ]);
			
            }

		}
	}

function closeTutorial() {
	console.log("closeTutorial() fired");

    const win = document.querySelector(".tutorial-window");
    if (win) {
		win.style.display = "none";
        win.classList.remove("active");
	}

	if (player.data.tutor === 0) {
		const btn = document.getElementById("tutorial-button");
		if (btn) {
			btn.style.display = "block";}
	}
}

function nextTutorialStep(step) {
    switch (step) {
        case 1:
            setTutorialText("Great! Let's begin. You are the Master of a guild of 'Adventurers', you hire them, send them off to do 'adventuring', and they come back with spoils for you. Simple enough right? Well... there haven't been any spoils for a while now...");
            setTutorialChoices([
                { label: "Continue", action: () => nextTutorialStep(2) }
            ]);
            break;

        case 2:
            setTutorialText("NOT THIS AGAIN  ...<BR>WHEN ARE YOU TWO FAT DRUNK BLOBS<BR>ARE EVER GOING TO MAKE ME A PROFIT ???.");
            setTutorialChoices([
                { label: "Got it", action: () => nextTutorialStep(3) }
            ]);
            break;

        case 3:
            setTutorialText("WHAT AM I FEEDING AND HOUSING YOU LOT FOR ???<BR>GO AND GET AT IT ALREADY MAKE ME SOME COIN !!!.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(4) }
            ]);
            break

        case 4:
            setTutorialText("AND TRY FIND THAT WORTHLESS BARD,<BR>CLAUDIO WAS SUPPOSED TO BE BACK HERE BY NOW !!!");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(5) }
            ]);
            break;

        case 5:
            setTutorialText("BUT DON'T GO OFF GETTING YOURSELF KILLED !!!<BR>YOU'RE NOT EVEN INSURED YET ...");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(6) }
            ]);
            break;

        case 6:
            setTutorialText("Now the player will go to the missions window, select Brag+Hog and a mission to 'Make Coin', and head off.<BR>*door slams* ");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(7) }
            ]);
            break;

        case 7:
            setTutorialText("Scenery changed, now the patrons are on their way.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(8) }
            ]);
            break;

        case 8:
            setTutorialText("Hog:	'Well we've done it now eh 'raggo<BR><BR>Brag:	'Ehhh, that won't be much of a fuss,<BR>I reckon we can go dig up that pot we've saved for later.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(9) }
            ]);
            break;

        case 9:
            setTutorialText("Hog:	WHAT POT?!<BR><BR>		Brag, have you been holding up on me again?");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(10) }
            ]);
            break;

        case 10:
            setTutorialText("Brag	Noooo I would never! <BR>		Don't you remember we've talked about this.");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(11) }
            ]);
            break;

        case 11:
            setTutorialText("Hog:		'Talked???'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(12) }
            ]);
            break;

        case 12:
            setTutorialText("Brag:	'Yeah we've said we can't just let the boss have it all or he'll dump us to the curve again.'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(13) }
            ]);
            break;

        case 13:
            setTutorialText("Hog -	'...........<BR>		?!<BR>		When have WE ever FOUND anything?!'");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(14) }
            ]);
            break;

        case 14:
            setTutorialText("Brag:	'Well, just leave it to me then,<BR>		let's go find our pot o' gold, bring it to the chief,<BR>		And we'll be Ok for a while ... ");
            setTutorialChoices([
                { label: "Next", action: () => nextTutorialStep(888) }
            ]);
            break;

        case 888:
            setTutorialText("Tutorial complete!");
            setTutorialChoices([
                { label: "Finish", action: () => closeTutorial() }
            ]);
            break;
    }
}

	
function setTutorialText(text) {
    const box = document.getElementById("tutorial-text");
    if (box) box.innerHTML  = text;
}

function setTutorialChoices(choices) {
    const container = document.getElementById("tutorial-choices");
    if (!container) return;

    container.innerHTML = ""; // clear old buttons

    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.innerHTML  = choice.label;
        btn.onclick = choice.action;
        container.appendChild(btn);
    });
}


function scaleApp() {
  const frame = document.querySelector('.app-frame');
  const targetWidth = 540;
  const targetHeight = 960;

  const scaleX = window.innerWidth / targetWidth;
  const scaleY = window.innerHeight / targetHeight;

  const scale = Math.min(scaleX, scaleY); // keep proportions

  frame.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleApp);
window.addEventListener('load', scaleApp);


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

// function loadPhaserScripts() {
  // const scripts = [
    // "node_modules/phaser/dist/phaser.js",
  // ];

  // scripts.forEach(src => {
    // const s = document.createElement("script");
    // s.src = src;
    // document.body.appendChild(s);
  // });
// }