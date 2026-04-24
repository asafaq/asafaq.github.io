async function startGame() {
    await Database.init();

    const save = await Database.get("playerData");

    if (save) {
        console.log("Loaded save:", save);
    } else {
        console.log("No save found, starting new game");
    }
}


function loadPage(page) {
  const main = document.getElementById("mainWindow");

  const pages = {
    guild: `
      <div id="guild-container">
        <img id="guild-image" src="assets/guild/guild.png" />

        <div class="guild_licence" style="top: 160px; left: 160px;">
          <img src="assets/guild/licence_icon.png" class="item-icon">

          <div class="hover-zone"
               data-label="Guild licence"
               data-large="assets/guild/adventurers_licence_50.png">
          </div>

          <div class="tooltip"></div>
        </div>
      </div>
    `,
    // other pages...
  };

  main.innerHTML = pages[page] || "<p>Unknown page</p>";

  if (page === "guild") {
    loadPhaserScripts();
    initGuildTooltips();   // <-- important
  }
}

function initGuildTooltips() {
  document.querySelectorAll('.guild_licence').forEach(unit => {
    const zone = unit.querySelector('.hover-zone');
    const tooltip = unit.querySelector('.tooltip');

    zone.addEventListener('mouseenter', () => {
      const largeSrc = zone.dataset.large;
      tooltip.innerHTML = `<img src="${largeSrc}">`;
      tooltip.style.display = "block";
    });

    zone.addEventListener('mouseleave', () => {
      tooltip.style.display = "none";
    });

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const largeSrc = zone.dataset.large;

      if (tooltip.style.display === "block") {
        tooltip.style.display = "none";
      } else {
        tooltip.innerHTML = `<img src="${largeSrc}">`;
        tooltip.style.display = "block";
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (!unit.contains(e.target)) {
        tooltip.style.display = "none";
      }
    });
  });
}

function loadPhaserScripts() {
  const scripts = [
    "node_modules/phaser/dist/phaser.js",
    "dist/scenes/Adventurer.js",
    "dist/scenes/GuildHallScene.js",
  ];

  scripts.forEach(src => {
    const s = document.createElement("script");
    s.src = src;
    document.body.appendChild(s);
  });
}