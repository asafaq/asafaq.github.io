
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

function renderApplicantUI(hydrated) {
  const hiringText = getHiringReferral(hydrated);
  const traitReferral = getTraitReferral(hydrated);
  const cost = hydrated.contractPrice;
  const silver = player.treasury.silver;

  return `
    <div class="hire-section">
      <p><strong>Applicant:</strong> Would you like to hire this adventurer?</p>

      <div class="hiring-referral">
        ${hiringText ? `<p>${hiringText}</p>` : ""}
        ${traitReferral ? `<p>${traitReferral}</p>` : ""}
      </div>

      <div class="hire-cost">
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

  document.getElementById("hire-yes").onclick = async () => {
  const cost = hydrated.contractPrice;

  if (player.treasury.silver >= cost) {

    // Deduct silver
    player.treasury.silver -= cost;

    // Update patron status
    patron.status = "idle";

    // Save your database if needed
    
	await storage.savePlayer(player);   // or whatever your save function is



    // Refresh UI
    renderTavernPage();

  } else {
    pushStatus("Not enough silver.");
  }
    // Close popup
  container.style.display = "none";
};


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
        <span>${hydrated.name}</span>
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
