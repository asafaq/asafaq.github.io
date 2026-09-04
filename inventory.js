
//inventory section
async function renderGuildStash() {
    if (!player?.missions?.current_mission?.active) {
        depositSatchel();
    }

    if (!player?.data?.stash || player.data.stash.length === 0) {
        player.data.stash = Array.from({ length: 12 }, () => ({
            item: null,
            qty: 0,
            locked: false
        }));
		
		await storage.savePlayer(player);
    }

    const stashGrid = document.querySelector("#guild-stash .stash-grid");

    if (!stashGrid) {
        console.warn("Guild stash grid NOT FOUND");
        return;
    }

    stashGrid.innerHTML = player.data.stash.map((slot, index) => {

        const hasItem =
            slot.item !== null &&
            slot.item !== undefined &&
            slot.item !== "";

        const itemData =
            hasItem
                ? loreData?.inventory?.[slot.item]
                : null;

        const itemIcon =
            itemData?.icon || FALLBACK_ITEM_ICON;

        const qtyHTML =
            hasItem && slot.qty > 1
                ? `<div class="qty">${slot.qty}</div>`
                : "";

        const lockHTML =
            slot.locked
                ? `<div class="lock-overlay"></div>`
                : "";

        return `
            <div
                class="stash-slot"
                data-slot="${index}"
                data-item="${hasItem ? slot.item : ""}"
            >

                <!-- ALWAYS present: inventory slot background -->
                <img
                    src="assets/guild/inventory_empty.png"
                    class="stash-slot-background"
                    draggable="false"
                    alt=""
                >

                <!-- Only present when slot contains an item -->
                ${hasItem ? `
                    <img
                        src="${itemIcon}"
                        class="item-icon"
                        draggable="false"
                        alt="${itemData?.name || slot.item}"
                    >
                ` : ""}

                ${qtyHTML}
                ${lockHTML}

            </div>
        `;
    }).join("");
}

function renderTreasuryLine() {
    const treasury = [];

    const silver = Number(player?.treasury?.silver || 0);
    const electrum = Number(player?.treasury?.counterfeit_electrum || 0);

    if (silver > 0) {
        treasury.push(`${silver} silver`);
    }

    if (electrum > 0) {
        treasury.push(`${electrum} electrum`);
    }

    return treasury.length > 0
        ? `Treasury: ${treasury.join(", ")}`
        : "Treasury:";
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
  const overlay = document.getElementById("overlay");

  if (!chest || !grid || !overlay) return;

  // Clicking the chest toggles stash + overlay
  chest.addEventListener("click", () => {
    console.log("Chest clicked — toggling stash");

    // Remove satchel content from overlay
    overlay.innerHTML = "";

    // Hide any satchel windows in DOM
    document.querySelectorAll(".adv-satchel").forEach(el => {
      el.classList.add("hidden");
    });

    // Toggle stash visibility
    const stashIsNowVisible = grid.classList.toggle("hidden") === false;

    if (stashIsNowVisible) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }

    initInventoryTooltips();
	initInventoryTransferClicks();
    treasury = renderTreasuryLine();
    pushStatus(treasury, 8000);
  });

  // Clicking the overlay closes BOTH stash and overlay
  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden");
    grid.classList.add("hidden");
  });
}
//    document.body.appendChild(overlay);
//satchel section

function renderGuildSatchelPage() {
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = templates.satchel_guild;
    overlay.classList.remove("hidden");

    initSatchel("guild");

    const satchelGrid = overlay.querySelector(".satchel-grid");

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
	grid.dataset.mode = mode;
    const advs = getSatchelAdventurers(mode);
    renderSatchelGrid(grid, advs);

    initInventoryTooltips();
	initInventoryTransferClicks();
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
        return patrons.filter(p => p.status === "mission");
    }

    return [];
}

function renderSatchelGrid(grid, adventurers) {
    console.log("RENDER INPUT:", adventurers);

    grid.innerHTML = adventurers.map(adv => {

        // Hydration is only used to retrieve display information such as the name
        const hydrated = getHydratedAdventurer(adv.id);
        const advName = hydrated?.name || adv.name || adv.id;

        // Inventory comes directly from the adventurer object
        const inventory = adv.inventory;

        console.log("ADVENTURER:", adv);
        console.log("NAME:", advName);
        console.log("INVENTORY:", inventory);

        if (!Array.isArray(inventory)) {
            console.error("INVALID INVENTORY:", adv.id, inventory);
            return "";
        }

        let slotsHTML = "";

        inventory.forEach((slot, i) => {

            const isLocked =
                slot.locked === true ||
                slot.locked === 1 ||
                slot.locked === "true";

            const hasItem =
                slot.item !== null &&
                slot.item !== undefined;

            // Quantity
            const qtyHTML = hasItem && slot.qty > 1
                ? `<div class="qty">${slot.qty}</div>`
                : "";

            // Item icon
            const icon = hasItem
                ? (loreData.inventory[slot.item]?.icon || FALLBACK_ITEM_ICON)
                : "";

            console.log(
                "SLOT:",
                i,
                "ITEM:", slot.item,
                "QTY:", slot.qty,
                "LOCKED:", isLocked
            );

            slotsHTML += `
                <div class="slot ${isLocked ? "locked" : ""} ${hasItem ? "has-item" : "empty"}"
                     data-slot="${i}">

                    ${hasItem
                        ? `<img src="${icon}" class="invitem-icon" data-slot="${i}">`
                        : ""
                    }

                    ${qtyHTML}

                    ${isLocked
                        ? `<div class="lock-overlay"></div>`
                        : ""
                    }
                </div>
            `;
        });

        return `
            <div class="adv-satchel" data-id="${adv.id}">
                <div class="adv-name">${advName}</div>
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
            if (slotEl.querySelector(".invitem-icon")) {
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
function initInventoryTooltips() {

    const tooltip = document.getElementById("satchel-tooltip");

    if (!tooltip) {
        console.error("Inventory tooltip: #satchel-tooltip NOT FOUND");
        return;
    }

    if (document.documentElement.dataset.inventoryTooltipsInitialized === "true") {
        return;
    }

    document.documentElement.dataset.inventoryTooltipsInitialized = "true";

    let activeSlot = null;


    // =========================================================
    // GET SLOT DATA
    // =========================================================

    function getSlotData(slotEl) {

        // -------------------------
        // ADVENTURER SATCHEL
        // -------------------------

        if (slotEl.classList.contains("slot")) {

            const advEl = slotEl.closest(".adv-satchel");

            if (!advEl) {
                return null;
            }

            const advId = advEl.dataset.id;
            const slotIndex = Number(slotEl.dataset.slot);

            const hydrated = getHydratedAdventurer(advId);
            const slot = hydrated?.inventory?.[slotIndex];

            if (!slot) {
                return null;
            }

            return {
                slot,
                type: "satchel"
            };
        }


        // -------------------------
        // GUILD STASH
        // -------------------------

        if (slotEl.classList.contains("stash-slot")) {

            const slotIndex = Number(slotEl.dataset.slot);
            const slot = player?.data?.stash?.[slotIndex];

            if (!slot) {
                return null;
            }

            return {
                slot,
                type: "stash"
            };
        }


        return null;
    }


    // =========================================================
    // SHOW TOOLTIP
    // =========================================================

    function showTooltip(slotEl, x, y) {

        const data = getSlotData(slotEl);

        if (!data) {
            hideTooltip();
            return;
        }

        const slot = data.slot;

        const isLocked =
            slot.locked === true ||
            slot.locked === 1 ||
            slot.locked === "true";

        const hasItem =
            slot.item !== null &&
            slot.item !== undefined &&
            slot.item !== "";


        // Empty unlocked slot
        if (!hasItem && !isLocked) {
            hideTooltip();
            return;
        }


        let html = "";


        // =====================================================
        // ITEM
        // =====================================================

        if (hasItem) {

            const itemData =
                loreData?.inventory?.[slot.item];

            const itemName =
                itemData?.name ||
                slot.item;

            html += `<strong>${itemName}</strong>`;


            if (slot.qty > 1) {
                html += `<br>Qty: ${slot.qty}`;
            }


            // -----------------------------------------------
            // ITEM DATA
            // -----------------------------------------------


			if (itemData) {

				const skipFields = [
					"name",
					"icon",
					"stack",
					"image",
					"charges",
					"weapon",
					"food",
				];

				// -------------------------------------------
				// NORMAL ITEM FIELDS
				// -------------------------------------------

				for (const key in itemData) {

					if (skipFields.includes(key)) {
						continue;
					}

					const value = itemData[key];

					if (
						value === undefined ||
						value === null ||
						value === ""
					) {
						continue;
					}

					const label =
						key === "desc"
							? "Description"
							: key;

					html += `<br>${label}: ${value}`;
				}


				// -------------------------------------------
				// WEAPON INFO
				// -------------------------------------------

				if (
					itemData.type === "weapon" &&
					Array.isArray(itemData.weapon)
				) {

					const [
						proficiency,
						damageDie,
						damageType,
						bonus,
						cursed
					] = itemData.weapon;

					let weaponText = `Weapon proficiency: ${proficiency}, d${damageDie} ${damageType} damage`;

					// Only show bonus when it isn't 0
					if (bonus !== undefined && bonus !== null && bonus !== 0) {
						weaponText += `, ${bonus > 0 ? "+" : ""}${bonus} bonus`;
					}

					// Only show cursed when true
					if (cursed === true) {
						weaponText += `, Cursed`;
					}

					html += `<br>${weaponText}`;
				}


				// -------------------------------------------
				// FOOD INFO
				// -------------------------------------------

				if (
					itemData.type === "food" &&
					Array.isArray(itemData.food)
				) {

					const [
						foodGroup,
						quantity
					] = itemData.food;

					html += `<br>Food group: ${foodGroup}, quantity: ${quantity}`;
				}


				// -------------------------------------------
				// CHARGES
				// -------------------------------------------

				if (
					Array.isArray(itemData.charges) &&
					itemData.charges.length === 2
				) {

					const [current, max] = itemData.charges;

					html += `<br>Charges: ${current} out of ${max}`;
				}


				// -------------------------------------------
				// OPTIONAL IMAGE
				// -------------------------------------------

				if (itemData.image) {

					html += `
						<br>
						<img
							src="${itemData.image}"
							class="satchel-tooltip-item-image"
						>
					`;
				}
			}


        }


        // =====================================================
        // LOCKED
        // =====================================================

        if (isLocked) {

            if (html) {
                html += `<br>`;
            }

            html += `<span>Locked</span>`;
        }


        tooltip.innerHTML = html;
        tooltip.classList.add("visible");

        activeSlot = slotEl;

        positionTooltip(x, y);
    }


    // =========================================================
    // POSITION
    // =========================================================

    function positionTooltip(x, y) {

        if (!activeSlot) {
            return;
        }

        const padding = 10;
        const offset = 12;

        const rect = tooltip.getBoundingClientRect();

        let left = x + offset;
        let top = y + offset;


        if (
            left + rect.width + padding >
            window.innerWidth
        ) {
            left = x - rect.width - offset;
        }


        if (
            top + rect.height + padding >
            window.innerHeight
        ) {
            top = y - rect.height - offset;
        }


        left = Math.max(padding, left);
        top = Math.max(padding, top);


        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }


    // =========================================================
    // HIDE
    // =========================================================

    function hideTooltip() {

        tooltip.classList.remove("visible");
        tooltip.innerHTML = "";

        activeSlot = null;
    }


    // =========================================================
    // MOUSE OVER
    // =========================================================

    document.addEventListener("pointerover", e => {

        if (e.pointerType !== "mouse") {
            return;
        }

        const slotEl =
            e.target.closest(".slot, .stash-slot");

        if (!slotEl) {
            return;
        }

        if (slotEl === activeSlot) {
            return;
        }

        showTooltip(
            slotEl,
            e.clientX,
            e.clientY
        );
    });


    // =========================================================
    // MOUSE MOVE
    // =========================================================

    document.addEventListener("pointermove", e => {

        if (e.pointerType !== "mouse") {
            return;
        }

        if (!activeSlot) {
            return;
        }

        positionTooltip(
            e.clientX,
            e.clientY
        );
    });


    // =========================================================
    // MOUSE OUT
    // =========================================================

    document.addEventListener("pointerout", e => {

        if (e.pointerType !== "mouse") {
            return;
        }

        const slotEl =
            e.target.closest(".slot, .stash-slot");

        if (!slotEl) {
            return;
        }

        const related = e.relatedTarget;

        if (
            related &&
            slotEl.contains(related)
        ) {
            return;
        }

        hideTooltip();
    });


    // =========================================================
    // TOUCH
    // =========================================================

    document.addEventListener("pointerup", e => {

        if (e.pointerType !== "touch") {
            return;
        }

        const slotEl =
            e.target.closest(".slot, .stash-slot");


        if (!slotEl) {
            hideTooltip();
            return;
        }


        if (activeSlot === slotEl) {
            hideTooltip();
            return;
        }


        showTooltip(
            slotEl,
            e.clientX,
            e.clientY
        );
    });


    console.log("Inventory tooltips initialized");
}

function addItemToContainer(container, itemId, quantity = 1) {
    const itemData = loreData.inventory[itemId];

    if (!itemData) {
        console.warn("Unknown item:", itemId);
        return false;
    }

    let remaining = Number(quantity);

    if (remaining <= 0) return false;

    const maxStack = Number(itemData.stack || 1);


    // -----------------------------------------
    // 1. Fill existing stacks first
    // -----------------------------------------

    if (maxStack > 1) {

        for (const slot of container) {

            if (
                !slot.locked &&
                slot.item === itemId &&
                slot.qty < maxStack
            ) {
                const space = maxStack - slot.qty;
                const amount = Math.min(space, remaining);

                slot.qty += amount;
                remaining -= amount;

                if (remaining <= 0) {
                    return true;
                }
            }
        }
    }


    // -----------------------------------------
    // 2. Put remaining items into empty slots
    // -----------------------------------------

    while (remaining > 0) {

        const emptySlot = container.find(
            slot => !slot.locked && slot.item === null
        );

        if (!emptySlot) {
            console.warn("Not enough inventory space for:", itemId);
            return false;
        }

        const amount = Math.min(maxStack, remaining);

        emptySlot.item = itemId;
        emptySlot.qty = amount;

        remaining -= amount;
    }

    return true;
}

/*	creating an item in a patron's inventory.
addItemToContainer(
    player.patrons.adv_Amyssa.inventory,
    "Amyssa's Spellbook",
    1
);
*/


function transferItem(source, sourceIndex, target, requestedQuantity = null) {

    const sourceSlot = source[sourceIndex];

    if (!sourceSlot || !sourceSlot.item) {
        pushStatus("No item in source slot");
        return false;
    }

    if (sourceSlot.locked) {
        pushStatus("This item is locked");
        return false;
    }

    const itemId = sourceSlot.item;
    const availableQuantity = Number(sourceSlot.qty) || 1;

    // If no quantity was specified, move the entire stack.
    const quantity = requestedQuantity === null
        ? availableQuantity
        : Number(requestedQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        pushStatus("Invalid quantity");
        return false;
    }

    if (quantity > availableQuantity) {
        pushStatus(`You only have ${availableQuantity}`);
        return false;
    }


    // -----------------------------------------
    // Remember target before transfer
    // -----------------------------------------

    const originalTarget = target.map(slot => ({
        item: slot.item,
        qty: Number(slot.qty) || 0
    }));


    // -----------------------------------------
    // Try to add requested quantity
    // -----------------------------------------

    if (addItemToContainer(target, itemId, quantity)) {

        sourceSlot.qty -= quantity;

        if (sourceSlot.qty <= 0) {
            sourceSlot.item = null;
            sourceSlot.qty = 0;
        }

        return true;
    }


    // -----------------------------------------
    // Target may have accepted part of it
    // -----------------------------------------

    let targetAdded = 0;

    target.forEach((slot, i) => {

        const before = originalTarget[i];

        if (slot.item === itemId) {

            const beforeQty =
                before.item === itemId
                    ? before.qty
                    : 0;

            const difference = slot.qty - beforeQty;

            if (difference > 0) {
                targetAdded += difference;
            }
        }
    });


    // -----------------------------------------
    // Remove whatever was actually transferred
    // -----------------------------------------

    if (targetAdded > 0) {

        sourceSlot.qty -= targetAdded;

        if (sourceSlot.qty <= 0) {
            sourceSlot.item = null;
            sourceSlot.qty = 0;
        }

        return true;
    }


    pushStatus("No space in target inventory");
    return false;
}

async function showTransferQuantity(menu, source, sourceIndex, target) {

    const sourceSlot = source[sourceIndex];

    if (!sourceSlot || !sourceSlot.item) {
        return;
    }

    const currentQuantity = Number(sourceSlot.qty) || 1;


    // =========================================
    // Single item
    // =========================================

    if (currentQuantity <= 1) {

        menu.remove();

        const success = transferItem(
            source,
            sourceIndex,
            target,
            1
        );

        if (success) {
            refreshInventoryAfterTransfer();
			await storage.savePlayer(player);
        }

        return;
    }


    // =========================================
    // Quantity selector
    // =========================================

    let quantity = currentQuantity;

    menu.innerHTML = `
        <div class="transfer-title">
            Move ${sourceSlot.item}
        </div>

        <div class="transfer-quantity-title">
            How many?
        </div>

        <div class="transfer-quantity-controls">

            <button class="transfer-qty-minus">
                −
            </button>

            <input
                class="transfer-qty-input"
                type="number"
                min="1"
                max="${currentQuantity}"
                value="${currentQuantity}"
            >

            <button class="transfer-qty-plus">
                +
            </button>

        </div>

        <div class="transfer-actions">

            <div class="transfer-confirm">
                Move
            </div>

            <div class="transfer-cancel">
                Cancel
            </div>

        </div>
    `;


    const input = menu.querySelector(".transfer-qty-input");
    const minus = menu.querySelector(".transfer-qty-minus");
    const plus = menu.querySelector(".transfer-qty-plus");
    const confirm = menu.querySelector(".transfer-confirm");
    const cancel = menu.querySelector(".transfer-cancel");


    // =========================================
    // Validate quantity
    // =========================================

    function updateQuantity(value) {

        value = Number(value);

        if (!Number.isInteger(value)) {
            value = 1;
        }

        value = Math.max(
            1,
            Math.min(currentQuantity, value)
        );

        quantity = value;
        input.value = value;
    }


    // =========================================
    // Minus
    // =========================================

    minus.addEventListener("click", () => {
        updateQuantity(quantity - 1);
    });


    // =========================================
    // Plus
    // =========================================

    plus.addEventListener("click", () => {
        updateQuantity(quantity + 1);
    });


    // =========================================
    // Manual input
    // =========================================

    input.addEventListener("change", () => {
        updateQuantity(input.value);
    });


    // =========================================
    // Move
    // =========================================

    confirm.addEventListener("click", async () => {

        updateQuantity(input.value);

        const success = transferItem(
            source,
            sourceIndex,
            target,
            quantity
        );

        if (success) {
            menu.remove();
            refreshInventoryAfterTransfer();
			
			await storage.savePlayer(player);
        }
    });


    // =========================================
    // Cancel
    // =========================================

    cancel.addEventListener("click", () => {
        menu.remove();
    });


    // =========================================
    // Select current quantity
    // =========================================

    input.focus();
    input.select();
}
/*
transferItem(
    player.data.stash,
    stashIndex,
    player.patrons[selectedAdventurer].inventory
);

transferItem(
    player.patrons[advId].inventory,
    slotIndex,
    player.data.stash
);

transferItem(
    player.patrons[sourceAdvId].inventory,
    sourceSlotIndex,
    player.patrons[targetAdvId].inventory
);
*/

function openInventoryTransferMenu(source, sourceIndex, x, y, mode = null) {

    const sourceSlot = source[sourceIndex];

    console.log("transfer menu fired");

    if (!sourceSlot || !sourceSlot.item) {
        return;
    }

    if (sourceSlot.locked) {
        pushStatus("This item is locked");
        return;
    }

    document.querySelector(".inventory-transfer-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "inventory-transfer-menu";

    menu.innerHTML = `
        <div class="transfer-title">
            Move ${sourceSlot.item}
        </div>

        <div class="transfer-targets"></div>

        <div class="transfer-cancel">
            Cancel
        </div>
    `;

    const targets = menu.querySelector(".transfer-targets");


    // =========================================
    // GUILD STASH
    // =========================================

    if (
        mode === "guild" &&
        source !== player.data.stash
    ) {

        const button = document.createElement("div");

        button.className = "transfer-target";
        button.textContent = "Guild Stash";

        button.addEventListener("click", () => {

            showTransferQuantity(
                menu,
                source,
                sourceIndex,
                player.data.stash
            );

        });

        targets.appendChild(button);
    }


    // =========================================
    // ADVENTURERS
    // =========================================

    Object.entries(player.patrons).forEach(([advId, adv]) => {

        if (!adv.inventory) return;

        // Don't offer the source adventurer
        if (adv.inventory === source) return;


        // -----------------------------------------
        // Mission satchel
        // -----------------------------------------

        if (mode === "mission") {

            // Only adventurers currently on mission
            if (adv.status !== "mission") {
                return;
            }

        }


        // -----------------------------------------
        // Guild satchel OR Guild stash
        // -----------------------------------------

        else {

            // Only idle adventurers
            if (adv.status !== "idle") {
                return;
            }
        }


        const button = document.createElement("div");

        button.className = "transfer-target";
        button.textContent = adv.name || advId;

        button.addEventListener("click", () => {

            showTransferQuantity(
                menu,
                source,
                sourceIndex,
                adv.inventory
            );

        });

        targets.appendChild(button);
    });


    // =========================================
    // CANCEL
    // =========================================

    menu.querySelector(".transfer-cancel").addEventListener(
        "click",
        () => {
            menu.remove();
        }
    );


    // =========================================
    // SHOW
    // =========================================

    menu.style.position = "fixed";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    document.body.appendChild(menu);


    // =========================================
    // Keep inside screen
    // =========================================

    requestAnimationFrame(() => {

        const rect = menu.getBoundingClientRect();

        let left = x;
        let top = y;

        if (left + rect.width > window.innerWidth) {
            left = window.innerWidth - rect.width - 10;
        }

        if (top + rect.height > window.innerHeight) {
            top = window.innerHeight - rect.height - 10;
        }

        menu.style.left = `${Math.max(10, left)}px`;
        menu.style.top = `${Math.max(10, top)}px`;
    });
}

function refreshInventoryAfterTransfer() {
    // Refresh stash if it exists
    if (document.querySelector("#guild-stash .stash-grid")) {
        renderGuildStash();
    }

    // Refresh satchel if it exists
    const satchelGrid = document.querySelector(".satchel-grid");

    if (satchelGrid) {
        const mode = satchelGrid.dataset.mode || "guild";

        const advs = getSatchelAdventurers(mode);

        renderSatchelGrid(satchelGrid, advs);
    }

    // Refresh any currently displayed adventurer inventory
    if (typeof renderAdventurerInventory === "function") {
        const advId = document.querySelector(
            ".adventurer-inventory"
        )?.dataset?.advId;

        if (advId) {
            renderAdventurerInventory(advId);
        }
    }
}

function initInventoryTransferClicks() {
    console.log("initInventoryTransferClicks called");
    if (document.body.dataset.inventoryTransferInitialized === "true") {
        return;
    }

    document.body.dataset.inventoryTransferInitialized = "true";

    document.addEventListener("click", e => {
		
        console.log("Global click handler fired on:", e.target);
		
        const slot = e.target.closest(
            ".slot, .stash-slot"
        );

        if (!slot) return;

        console.log("Slot classes:", slot.classList.value);

        if (slot.classList.contains("stash-slot")) {
            console.log("Entered stash-slot branch");
        }
        // Don't interfere with buttons/menus
        if (e.target.closest(".inventory-transfer-menu")) {
            return;
        }

        // Must contain an actual item
        const itemImage = slot.querySelector(
            ".invitem-icon, .actual-item, .item-icon"
        );

        if (!itemImage) {
            return;
        }


        // -----------------------------------------
        // Adventurer / Satchel inventory
        // -----------------------------------------

        if (slot.classList.contains("slot")) {

            const advEl = slot.closest(".adv-satchel");

            if (!advEl) return;

            const advId = advEl.dataset.id;
            const slotIndex = Number(slot.dataset.slot);

            const inventory =
                player.patrons[advId]?.inventory;

            if (!inventory) return;


            // -------------------------------------
            // Get satchel mode
            // -------------------------------------

            const satchelGrid =
                slot.closest(".satchel-grid");

            if (!satchelGrid) return;

            const mode =
                satchelGrid.dataset.mode;


            console.log(
                "TRANSFER:",
                advId,
                "MODE:",
                mode
            );


            openInventoryTransferMenu(
                inventory,
                slotIndex,
                e.clientX,
                e.clientY,
                mode
            );

            return;
        }


        // -----------------------------------------
        // Guild stash
        // -----------------------------------------

        if (slot.classList.contains("stash-slot")) {

			console.log("Stash contents:", player.data.stash);


            const slotIndex =
                Number(slot.dataset.slot);

			
			console.log("Slot index:", slotIndex);
            // Stash has its own mode
            const mode = "stash";


            console.log(
                "TRANSFER: Guild Stash MODE:",
                mode
            );

			console.log("Clicked element:", slot, slot.classList);

            openInventoryTransferMenu(
                player.data.stash,
                slotIndex,
                e.clientX,
                e.clientY,
                mode
            );
        }
    });
}
//initInventoryTransferClicks();

function positionTooltip(x, y) {
    const tooltip = document.getElementById("satchel-tooltip");

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";

    // Force layout so we can read width
    const rect = tooltip.getBoundingClientRect();

    const screenWidth = window.innerWidth;

    // If tooltip goes off the right side, clamp it
    if (rect.right > screenWidth) {
        tooltip.style.left = (screenWidth - rect.width - 10) + "px";
    }
}
