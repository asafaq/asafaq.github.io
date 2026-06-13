
function renderIdleUI(hydrated, player) {
  const idleDescription = getIdleDescription(hydrated, player);
  const traitReferral = getTraitReferral(hydrated);
  console.log(hydrated);
  return `
    <div class="patron-stats">
      <p><strong>Status:</strong> idle</p>
      <p>${idleDescription}</p>
      ${traitReferral ? `<p>${traitReferral}</p>` : ""}

      <button id="view-charsheet" class="charsheet-btn">
        View Character Sheet
      </button>
	  
	  ${hydrated?.dialog > 0 ? `
        <button id="dialog-btn" class="dialog-btn">
          Dialog
        </button>
      ` : ""}
    </div>
  `;
}

function renderApplicantUI(hydrated, player) {
  const hiringText = getHiringReferral(hydrated);
  const traitReferral = getTraitReferral(hydrated);
  const cost = hydrated.contractPrice;
  const silver = player.treasury.silver;

  return `
    <div class="hire-section">
      
      <div class="hiring-referral">
        <p><strong>Applicant:</strong> ${hiringText ? `${hiringText}</p>` : ""}
        ${traitReferral ? `<p>${traitReferral}</p>` : ""}
	  <button id="view-charsheet" class="charsheet-btn">
        View Character Sheet
      </button>
	    ${hydrated.dialog > 0 ? `
          <button id="dialog-btn" class="dialog-btn">
            Dialog
          </button>
        ` : ""}
      </div>

      <div class="hire-cost">
	    <p> Would you like to hire this adventurer?</p>
        <p><strong>Contract Price:</strong> ${cost} silver</p>
        <p><strong>Your Silver:</strong> ${silver} silver</p>
      </div>



      <button id="hire-yes">Hire</button>
      <button id="hire-no">Decline</button>
    </div>
  `;
}

function idleController(hydrated, container) {
  const sheetBtn = container.querySelector("#view-charsheet");
  const dialogBtn = container.querySelector("#dialog-btn");

  // --- Character Sheet Button ---
  if (sheetBtn) {
    sheetBtn.addEventListener("click", () => {
      container.style.display = "none";

      loadPage("contracts");

      setTimeout(() => {
        const fresh = getHydratedAdventurer(hydrated.id);
        renderCharSheet(fresh);
      }, 50);
    });
  }

  // --- Dialog Button ---
  if (dialogBtn && hydrated.dialog > 0) {
    dialogBtn.addEventListener("click", () => {
	  container.style.display = "none";   // <-- close the window
      const missionId = hydrated.name + hydrated.dialog;
      console.log("Dialog clicked:", missionId);
      startMissionSystem(missionId);
    });
  }
}


async function applicantController(hydrated, container) {
  const noBtn = container.querySelector("#hire-no");
  const yesBtn = container.querySelector("#hire-yes");
  const sheetBtn = container.querySelector("#view-charsheet");
  // --- Dialog Button ---
  const dialogBtn = container.querySelector("#dialog-btn");

  if (dialogBtn && hydrated.dialog > 0) {
	  dialogBtn.addEventListener("click", () => {
		container.style.display = "none";   // <-- close the window
		const missionId = hydrated.name + hydrated.dialog;
		console.log("Dialog clicked:", missionId);
		startMissionSystem(missionId);
	  });
	}
  // --- Character Sheet Button ---
  if (sheetBtn) {
    sheetBtn.addEventListener("click", () => {
      container.style.display = "none";
      loadPage("contracts");

      setTimeout(() => {
        const fresh = getHydratedAdventurer(hydrated.id);
        renderCharSheet(fresh);
      }, 50);
    });
  }

  // --- Hire Yes ---
  yesBtn.onclick = async () => {
    const cost = hydrated.contractPrice;

    if (player.treasury.silver >= cost) {
      player.treasury.silver -= cost;
      patron.status = "idle";

      await storage.savePlayer(player);

      renderTavernPage();
    } else {
      pushStatus("Not enough silver.");
    }

    container.style.display = "none";
  };

  // --- Hire No ---
  noBtn.addEventListener("click", () => {
    console.log(`${hydrated.name} declined.`);
    container.style.display = "none";
  });
}

async function openPatronWindow(adv, portrait) {
  const container = document.getElementById("global-popup-container");
  const hydrated = getHydratedAdventurer(adv.id);

  const status = hydrated.status;
  const renderer = patronStatusRenderers[status];
  const controller = patronStatusControllers[status];

  const statusHTML = renderer
    ? renderer(hydrated, player)
    : `<p><strong>Status:</strong> ${status}</p>`;

  container.innerHTML = `
    <div class="infoPopupPatron status-${status}">
      <div class="window-header">
        <span>${hydrated.name}, the ${hydrated.role} level: ${hydrated.level}</span>
        <button class="close-window">X</button>
      </div>

      <div class="window-body patron-window">
        <img class="patron-portrait" src="${portrait}">
        ${statusHTML}
      </div>
    </div>
  `;

  container.style.display = "flex";

  // Close window
  container.querySelector(".close-window").addEventListener("click", () => {
    container.style.display = "none";
  });

  // Click outside to close
  container.addEventListener("mousedown", (e) => {
    if (e.target === container) {
      container.style.display = "none";
    }
  });

  // Run status-specific controller
  if (controller) controller(hydrated, container);
}

function getHiringReferral(hydrated) {
  const name = hydrated.name;
  const hireDB = loreData.passive.hiringReferrals;

  if (hireDB[name]) {
    return hireDB[name];
  }

  return hireDB.default || "";
}


function initPatronClicks() {
  document.querySelectorAll('.patron-wrapper').forEach(wrapper => {
    const zone = wrapper.querySelector('.hover-zone');
    if (!zone) return;

    zone.addEventListener('mousedown', () => {
	  const id = zone.dataset.id;
	  const adv = getHydratedAdventurer(id); // refresh data
      const large = zone.dataset.large || adv.icon || "/assets/patrons/default.png";

      openPatronWindow(adv, large);
    });
  });
}

function getIdleDescription(adv) {
  const hydrated = getHydratedAdventurer(adv.id);
  const name = hydrated.name;
  const idleDB = loreData.passive.idleDesc;

  // If the name exists in the DB → return it
  if (idleDB[name]) {
    return idleDB[name];
  }

  // Fallback
  return idleDB.default || "They seem to be waiting for something.";
}

function getTraitReferral(hydrated) {
  const traitDB = loreData.passive.traitReferrals;

  const matches = [];

  for (const t of hydrated.traits) {
    if (traitDB[t]) {
      matches.push(traitDB[t]);
    }
  }

  if (matches.length === 0) {
    return "";
  }

  return matches.join("<br>");
}

const patronStatusRenderers = {
  applicant: renderApplicantUI,
  idle: renderIdleUI,
  //passive: renderPassiveUI,   // you can define later
  //rival: renderRivalUI,       // optional
};

const patronStatusControllers = {
  applicant: applicantController,
  idle: idleController,
  //rival: rivalController,
};


// code for sorting patron locations in idle zones.

// ---------------------------------------------
// TAVERN SEATING SYSTEM (Option A: tavernSlots)
// ---------------------------------------------

const guildSlots = [
  { id: "table1a", x: 380, y: 220, priority: 3, type: "table1", occupied: false },
  { id: "table1b", x: 380, y: 300, priority: 3, type: "table1", occupied: false },
  { id: "table1c", x: 300, y: 300, priority: 3, type: "table1", occupied: false },
  { id: "table1d", x: 300, y: 220, priority: 3, type: "table1", occupied: false },
  { id: "table2a", x: 140, y: 390, priority: 2, type: "table2", occupied: false },
  { id: "table2b", x: 200, y: 390, priority: 2, type: "table2", occupied: false },
  { id: "table2c", x: 140, y: 320, priority: 2, type: "table2", occupied: false },
  { id: "table2d", x: 200, y: 320, priority: 2, type: "table2", occupied: false },
  { id: "floor1", x: 180, y: 260, priority: 1, type: "floor", occupied: false }
];


// These are the ONLY seating positions in the tavern.
const tavernSlots = [
  { id: "bar1", x: 120, y: 240, priority: 3, type: "bar", occupied: false },
  { id: "bar2", x: 180, y: 240, priority: 3, type: "bar", occupied: false },
  { id: "bar3", x: 240, y: 240, priority: 3, type: "bar", occupied: false },
  { id: "bar4", x: 300, y: 240, priority: 3, type: "bar", occupied: false },
  { id: "center", x: 310, y: 350, priority: 2, type: "center", occupied: false },
  { id: "counter1", x: 180, y: 170, priority: 1, type: "counter", occupied: false },
  { id: "counter2", x: 240, y: 170, priority: 1, type: "counter", occupied: false },
  { id: "counter3", x: 300, y: 170, priority: 1, type: "counter", occupied: false },
  { id: "table1a", x: 160, y: 380, priority: 4, type: "table", occupied: false },
  { id: "table1b", x: 20, y: 380, priority: 4, type: "table", occupied: false },
  { id: "table1c", x: 50, y: 330, priority: 4, type: "table", occupied: false },
  { id: "table1d", x: 150, y: 330, priority: 4, type: "table", occupied: false },
  { id: "table1e", x: 90, y: 420, priority: 4, type: "table", occupied: false },
  { id: "door", x: 240, y: 380, priority: 2, type: "door", occupied: false },
  { id: "corner1", x: 400, y: 170, priority: 1, type: "quiet", occupied: false },
  { id: "corner2", x: 400, y: 370, priority: 1, type: "quiet", occupied: false },
];

// ---------------------------------------------
// SCORING LOGIC
// ---------------------------------------------
function scoreSlotForPatron(slot, patron) {

  const lounge = patron.lounge || {
    preferredType: "any",
    preferredSeat: null,
    avoidTypes: [],
    weight: 3
  };

  const prefType = lounge.preferredType;
  const prefSeat = lounge.preferredSeat;
  const avoid = lounge.avoidTypes;
  const weight = lounge.weight;

  let score = slot.priority;

  if (prefSeat && slot.id === prefSeat) {
    score += 10;
  }

  if (prefType !== "any" && slot.type === prefType) {
    score += weight;
  }

  if (avoid.includes(slot.type)) {
    score -= 5;
  }

  score += Math.random();

  return score;
}

// ---------------------------------------------
// SLOT SELECTION
// ---------------------------------------------

function findBestGuildSlot(patron) {
  let best = null;
  let bestScore = -Infinity;

  for (const slot of guildSlots) {
    if (slot.occupied) continue;

    const score = scoreSlotForPatron(slot, patron);
    if (score > bestScore) {
      bestScore = score;
      best = slot;
    }
  }

  if (best) {
    best.occupied = true;
    return best;
  }

  return { x: patron.left, y: patron.top };
}


function findBestSlot(patron) {
  let best = null;
  let bestScore = -Infinity;

  for (const slot of tavernSlots) {
    if (slot.occupied) continue;

    const score = scoreSlotForPatron(slot, patron);
    if (score > bestScore) {
      bestScore = score;
      best = slot;
    }
  }

  if (best) {
    best.occupied = true;
    return best;
  }

  // fallback if all seats are taken
  return { x: 0, y: 0 };
}
