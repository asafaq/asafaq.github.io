
//inventory section
function renderGuildStash() {
  if (!player?.data?.stash || player.data.stash.length === 0) {
  player.data.stash = Array.from({ length: 12 }, () => ({
    item: null,
    qty: 0,
    locked: false
  }));
}
  const stashGrid = document.querySelector("#guild-stash .stash-grid");

  stashGrid.innerHTML = player.data.stash
    .map((slot, index) => {
      const icon = slot.item ? getItemIcon(slot.item) : "assets/guild/inventory_empty.png";
      const qty = slot.qty > 1 ? `<div class="qty">${slot.qty}</div>` : "";
      const lock = slot.locked ? `<div class="lock-overlay"></div>` : "";

      return `
        <div class="stash-slot" data-slot="${index}">
          <img src="${icon}" class="item-icon">
          ${qty}
          ${lock}
        </div>
      `;
    })
    .join("");
}

function assignStashItemToAdventurer(stashIndex, adv) {
  const slot = player.data.stash[stashIndex];
  if (!slot.item) return false;

  for (let i = 0; i < adv.loreData.inventory.length; i++) {
    const invSlot = adv.loreData.inventory[i];

    if (!invSlot.locked && invSlot.item === null) {
      invSlot.item = slot.item;
      invSlot.qty = slot.qty;

      slot.item = null;
      slot.qty = 0;

      return true;
    }
  }

  return false;
}

function initStashRightClicks() {
  const stashContainer = document.getElementById("guild-stash");

  stashContainer.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    const slotDiv = e.target.closest(".stash-slot");
    if (!slotDiv) return;

    const slotIndex = parseInt(slotDiv.dataset.slot);

    if (!selectedAdventurer) {
      console.warn("No adventurer selected");
      return;
    }

    const success = assignStashItemToAdventurer(slotIndex, selectedAdventurer);

    if (success) {
      renderGuildStash();
      renderAdventurerInventory(selectedAdventurer);
    } else {
      console.warn("No space in adventurer inventory");
    }
  });
}

function initStashChestClick() {
  const chest = document.getElementById("stash-chest-icon");
  const grid = document.querySelector("#guild-stash .stash-grid");

  console.log("Chest element:", chest);
  console.log("Grid element:", grid);
  if (!chest) {
    console.warn("Chest icon NOT FOUND in DOM");
    return;
  }

  if (!grid) {
    console.warn("Stash grid NOT FOUND in DOM");
    return;
  }

  chest.addEventListener("click", () => {
    console.log("Chest clicked — toggling stash");
    grid.classList.toggle("hidden");
  });
}

//satchel section

function renderGuildSatchelPage() {
	
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = templates.satchel_guild;
    overlay.classList.remove("hidden");

    initSatchel("guild");

    // stash only exists in guild mode
    //renderGuildStash();
    // initStashChestClick();
    // initStashRightClicks();
}

function renderMissionSatchelPage() {
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = templates.satchel_mission;
    overlay.classList.remove("hidden");

    initSatchel("mission");
}

function openMissionSatchelContextMenu(advId, slot, x, y) {
    showContextMenu([
        { label: "Give to Mission Adventurer", action: () => openAdvSelectMenu(advId, slot, "mission") }
    ], x, y);
}

function initSatchel(mode) {
    const grid = document.querySelector(".satchel-grid");
    grid.classList.remove("hidden");

    const advs = getSatchelAdventurers(mode);
    renderSatchelGrid(grid, advs);

    // Delay so DOM is ready
    setTimeout(() => initSatchelRightClicks(mode), 0);
}

function getSatchelAdventurers(mode) {
    // Convert patrons object → array WITH IDs
    const patrons = Object.entries(player.patrons)
        .map(([id, data]) => ({ id, ...data }))   // attach the ID
        .filter(p => p.status !== "applicant");   // remove applicants

    if (mode === "guild") {
        return patrons.filter(p => p.status === "idle");
    }

    if (mode === "mission") {
        return patrons.filter(p => p.status === "on_mission");
    }

    return [];
}

function renderSatchelGrid(grid, adventurers) {
    console.log("RENDER INPUT:", adventurers);  // ← ADD THIS HERE
    grid.innerHTML = adventurers.map(adv => {
        const hydrated = getHydratedAdventurer(adv.id);
		
        console.log("HYDRATED:", hydrated);
        console.log("INVENTORY:", hydrated.inventory);
        let slotsHTML = "";

		hydrated.inventory.forEach((slot, i) => {

            const isLocked = slot.locked;
            const hasItem = slot.item !== null;

            if (isLocked) {
                slotsHTML += `
                    <div class="slot locked" data-slot="${i}">
                        <div class="lock-icon"></div>
                    </div>
                `;
            } 
            else if (hasItem) {
                const icon = loreData.inventory[slot.item]?.icon || FALLBACK_ITEM_ICON;
                slotsHTML += `
                    <div class="slot" data-slot="${i}">
                        <img src="${icon}" class="item-icon" data-slot="${i}">
                    </div>
                `;
            } 
            else {
                slotsHTML += `
                    <div class="slot empty" data-slot="${i}"></div>
                `;
            }
        });

        return `
            <div class="adv-satchel" data-id="${adv.id}">
                <div class="adv-name">${hydrated.name}</div>
                <div class="adv-items">${slotsHTML}</div>
            </div>
        `;
    }).join("");
}


function initSatchelRightClicks(mode) {
    const overlay = document.getElementById("overlay");

    overlay.addEventListener("contextmenu", e => {
        e.preventDefault();

        const slotEl = e.target.closest(".slot");
        const advEl = e.target.closest(".adv-satchel");

        // If not clicking inside an adventurer satchel, ignore
        if (!advEl) return;

        const advId = advEl.dataset.id;

        // If clicked on a slot (empty, locked, or item)
        if (slotEl) {
            const slot = slotEl.dataset.slot;

            // Only items should open the real menu
            if (slotEl.querySelector(".item-icon")) {
                if (mode === "guild") {
                    openGuildSatchelContextMenu(advId, slot, e.pageX, e.pageY);
                } else {
                    openMissionSatchelContextMenu(advId, slot, e.pageX, e.pageY);
                }
            } else {
                pushStatus("Just RIGHT click an item");
            }

            return;
        }

        // Clicked inside satchel but not on a slot
        pushStatus("Just RIGHT click an item");
    });
}

const FALLBACK_ITEM_ICON = "/assets/inventory/fallback.png";

document.addEventListener("click", e => {
    const overlay = document.getElementById("overlay");
    if (overlay.classList.contains("hidden")) return;

    // If clicked directly on the overlay background, close it
    if (e.target.id === "overlay") {
        overlay.classList.add("hidden");
    }
});

document.addEventListener("click", e => {
    if (e.target.id === "close-satchel") {
        document.getElementById("overlay").classList.add("hidden");
    }
});

//end of satchel section


//Adding an Item (Smart Slot Finding) This function checks for existing stacks first (if you want stackable items) and then finds the first empty, unlocked slot.
function addItemToContainer(container, itemId, quantity = 1) {
  // 1. Optional: Try to find an existing stack first (if item is stackable)
  const existingSlot = container.find(slot => slot.item === itemId && !slot.locked);
  if (existingSlot) {
    existingSlot.qty += quantity;
    return true;
  }

  // 2. Find the first empty, unlocked slot
  const emptySlot = container.find(slot => slot.item === null && !slot.locked);
  
  if (emptySlot) {
    emptySlot.item = itemId;
    emptySlot.qty = quantity;
    return true;
  }

  console.warn("Inventory Full");
  return false;
}

//B. Displaying Item Properties (The Tooltip/Info Logic) Since your inventory only stores the id, you need a helper to fetch the full data from your database for the UI.

function getItemData(itemId) {
  return itemDatabase[itemId] || null;
}

function showItemDetails(itemId) {
  const item = getItemData(itemId);
  if (!item) return;

  // Example: Injecting into a tooltip or info panel
  const infoPanel = document.querySelector("#item-info-panel");
  infoPanel.innerHTML = `
    <h3>${item.name || itemId}</h3>
    <p>Type: ${item.type}</p>
    <p>${item.dmg ? `Damage: ${item.dmg}` : ''}</p>
    <p>${item.heal ? `Heal: ${item.heal}` : ''}</p>
    <p><em>${item.desc || ""}</em></p>
  `;
}


//Updated Move Logic (The "Refactored" Way)
function transferItem(sourceInventory, index, targetInventory) {
  const slot = sourceInventory[index];
  if (!slot.item) return false;

  const success = addItemToContainer(targetInventory, slot.item, slot.qty);
  
  if (success) {
    // Clear the source slot
    slot.item = null;
    slot.qty = 0;
    return true;
  }
  return false;
}


//1. The "Find Best Slot" Logic
//This function cycles through the array and finds the first available spot. It respects your locked property.

function findAvailableSlot(inventoryArray) {
  // .findIndex returns the index of the first element that matches the condition
  // returns -1 if no slot is found
  return inventoryArray.findIndex(slot => slot.item === null && slot.locked === false);
}

// 2. Adding Items (Stash or Patron)
// You can use this for looting, buying, or moving items.

function addItemToInventory(inventoryArray, itemID, amount = 1) {
  const slotIndex = findAvailableSlot(inventoryArray);

  if (slotIndex !== -1) {
    inventoryArray[slotIndex].item = itemID;
    inventoryArray[slotIndex].qty = amount;
    return true; // Success!
  }

  console.error("Inventory is full!");
  return false; // Failed
}

// 3. Displaying Item Properties
// To show info in your UI (like a description box or tooltip), you need to bridge the gap between the ID in the inventory and the Data in your database.

function updateUIItemDetails(itemID) {
  const detailsContainer = document.querySelector("#item-details");
  const itemData = itemDatabase[itemID]; // Looking up the key in your DB

  if (!itemData) {
    detailsContainer.innerHTML = "Select an item to see details.";
    return;
  }

  // Build the HTML based on what properties exist in the DB
  detailsContainer.innerHTML = `
    <h4>${itemID}</h4>
    <p>${itemData.desc || "No description available."}</p>
    <ul>
      ${itemData.dmg ? `<li>Damage: ${itemData.dmg}</li>` : ""}
      ${itemData.heal ? `<li>Heals: ${itemData.heal}</li>` : ""}
      ${itemData.type ? `<li>Type: ${itemData.type}</li>` : ""}
    </ul>
  `;
}