
function renderIdleUI(hydrated, player) {
  const idleDescription = getIdleDescription(hydrated, player);
  const traitReferral = getTraitReferral(hydrated);

  return `
    <div class="patron-stats">
      <p><strong>Status:</strong> idle</p>
      <p>${idleDescription}</p>
      ${traitReferral ? `<p>${traitReferral}</p>` : ""}

      <button id="view-charsheet" class="charsheet-btn">
        View Character Sheet
      </button>
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
  const btn = container.querySelector("#view-charsheet");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Switch to the contracts page
	container.style.display = "none";

    loadPage("contracts");

    // After the page loads, render the correct character
    setTimeout(() => {
      const fresh = getHydratedAdventurer(hydrated.id);
      renderCharSheet(fresh);
    }, 50);
  });
}

async function applicantController(hydrated, container) {
  const noBtn = container.querySelector("#hire-no");
  const yesBtn = container.querySelector("#hire-yes");
  const sheetBtn = container.querySelector("#view-charsheet");

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
const MAP_WIDTH = 500;
const MAP_HEIGHT = 600;
const CELL_SIZE = 60; // patrons spaced ~80px apart

const grid = [];
for (let x = 0; x < MAP_WIDTH; x += CELL_SIZE) {
  for (let y = 0; y < MAP_HEIGHT; y += CELL_SIZE) {
    grid.push({
      x,
      y,
      occupied: false,
      priority: 1, // default
      type: "any"
    });
  }
}

function applyZonePriorities() {
  grid.forEach(cell => {

    // Bar zone (top-left area)
    if (cell.x < 250 && cell.y < 200) {
      cell.priority = 3;
      cell.type = "bar";
    }

    // Quiet zone (bottom-right area)
    if (cell.x > 300 && cell.y > 350) {
      cell.priority = 2;
      cell.type = "quiet";
    }

    // Everything else stays priority 1
  });
}
// patron.preference = "bar" | "quiet" | "any"

const tavernSlots = [
  { id: "bar1", x: 120, y: 80, priority: 3, type: "bar", occupied: false },
  { id: "bar2", x: 180, y: 80, priority: 3, type: "bar", occupied: false },
  { id: "table1a", x: 400, y: 300, priority: 2, type: "table", occupied: false },
  { id: "table1b", x: 450, y: 300, priority: 2, type: "table", occupied: false },
  { id: "corner1", x: 700, y: 500, priority: 1, type: "quiet", occupied: false },
];

function scoreSlotForPatron(slot, patron) {
  const lounge = patron.lore?.lounge || {};
  const prefType = lounge.preferredType || "any";
  const prefSeat = lounge.preferredSeat || null;
  const avoid = lounge.avoidTypes || [];
  const weight = lounge.weight || 3;

  let score = slot.priority;

  // Strong preference for a specific seat
  if (prefSeat && slot.id === prefSeat) {
    score += 10;
  }

  // Preference for a seat type
  if (prefType !== "any" && slot.type === prefType) {
    score += weight;
  }

  // Avoid certain types
  if (avoid.includes(slot.type)) {
    score -= 5;
  }

  // Slight randomness to avoid ties
  score += Math.random();

  return score;
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

  // fallback
  return { x: 0, y: 0 };
}

if (page === "tavern") {
  patronList = getVisiblePatrons();
  const container = document.getElementById("patron-container");

  applyZonePriorities();

  container.innerHTML = patronList
    .filter(p => p.location === 2)
    .map(patron => {
      const cell = findBestCell(patron);

      return `
        <div class="patron-wrapper"
             style="position:absolute; top:${cell.y}px; left:${cell.x}px;">
          <img src="${patron.icon}" class="item-icon">
          <div class="hover-zone"
               data-id="${patron.id}"
               data-large="${patron.large || patron.icon}">
          </div>
          <div class="tooltip"></div>
        </div>
      `;
    })
    .join('');

  initPatronClicks();
  displayRightMenu();
}
