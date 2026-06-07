
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

  return `
    <div class="hire-section">
      <p><strong>Applicant:</strong> Would you like to hire this adventurer?</p>

      <div class="hiring-referral">
        <p>${hiringText}</p>
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

function applicantController(hydrated, container) {
  const yesBtn = container.querySelector("#hire-yes");
  const noBtn = container.querySelector("#hire-no");

  yesBtn.addEventListener("click", () => {
    pushStatus("You can't afford Amyssa yet, there isn't any money in the stash!");
    container.style.display = "none";
  });

  noBtn.addEventListener("click", () => {
    console.log(`${hydrated.name} declined.`);
    container.style.display = "none";
  });
}

async function openPatronWindow(adv, portrait) {
  const container = document.getElementById("window-container");
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

function getTraitReferral(adv) {
  const hydrated = getHydratedAdventurer(adv.id);
  const traits = loreData.passive.traitReferrals;

  // Only show trait referral when idle
  if (hydrated.status !== "idle") {
    return "";
  }

  // hydrated.trait is an array → loop through it
  for (const t of hydrated.traits) {
    if (traits[t]) {
      return traits[t];
    }
  }

  // If none of the traits match → fallback
  return traits.default;
}

function getHiringReferral(hydrated) {
  const referrals = loreData.passive.hiringReferrals;

  // Loop through the adventurer's traits
  for (const t of hydrated.traits) {
    if (referrals[t]) {
      return referrals[t];
    }
  }

  // Fallback
  return referrals.default || "";
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

function getIdleDescription(adv, player) {
  const hydrated = getHydratedAdventurer(adv.id);
  const globalIdle = loreData.passive.idleDescriptions;
  const traitReferrals = loreData.passive.traitReferrals;

  // 1. If idle → override with trait referral
  if (hydrated.status === "idle") {
    return traitReferrals[hydrated.traits] || traitReferrals.default;
  }

  // 2. Otherwise → use normal idle descriptions
  return globalIdle[hydrated.status] || globalIdle.default;
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
