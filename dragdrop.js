// ============================================================
// PATRON DRAG & DROP
// Unified mouse + touch + pen implementation
// ============================================================

let patronDragListenersAdded = false;

let selectedPatronId = null;

let patronDrag = {
    active: false,
    pointerId: null,
    advId: null,
    slot: null,
    startX: 0,
    startY: 0,
    currentZone: null,
    moved: false
};


// ============================================================
// LOCATION HELPERS
// ============================================================

const locationToId = {
    1: "guild-patron-inventory",
    2: "guild2-patron-inventory",
    3: "party-a-patron-inventory",
    4: "party-b-patron-inventory",
    5: "party-c-patron-inventory",
    7: "party-a-butler-inventory"
};


function getLocationFromZone(zone) {
    const id = zone.id;

    if (id === "guild-patron-inventory") return 1;
    if (id === "guild2-patron-inventory") return 2;
    if (id === "party-a-patron-inventory") return 3;
    if (id === "party-b-patron-inventory") return 4;
    if (id === "party-c-patron-inventory") return 5;
    if (id === "party-a-guide-inventory") return 6;
    if (id === "party-a-butler-inventory") return 7;
    if (id === "secret-patron-inventory") return 9;

    return 1;
}


function locationHasPatron(location) {
    return patronList.some(
        p => p.location === location
    );
}


function countPatronsInLocation(location) {
    return patronList.filter(
        p => p.location === location
    ).length;
}


// ============================================================
// SELECTION
// ============================================================

function selectPatron(advId) {

    const patron = player.patrons[advId];

    if (!patron) return;

    // Locations 6 and 9 cannot be selected.
    if (patron.location === 6 || patron.location === 9) {
        return;
    }

    deselectPatron();

    selectedPatronId = advId;

    const slot = document.querySelector(
        `.patron-slot[data-adv="${advId}"]`
    );

    if (slot) {
        slot.classList.add("selected");
    }
}


function deselectPatron() {

    if (selectedPatronId) {

        const slot = document.querySelector(
            `.patron-slot[data-adv="${selectedPatronId}"]`
        );

        if (slot) {
            slot.classList.remove("selected");
        }
    }

    selectedPatronId = null;
}


// ============================================================
// COMMON MOVE FUNCTION
// ============================================================
// This is the ONLY function that actually moves a patron.
//
// Mouse, touch, pen and click-select/drop all eventually
// come through here.
// ============================================================

async function movePatron(advId, zone) {

    if (!advId || !zone) {
        return false;
    }

    const patron = getHydratedAdventurer(advId);

    if (!patron) {
        return false;
    }

    const origin = patron.location;

    let newLocation = getLocationFromZone(zone);


    // --------------------------------------------------------
    // RULE 1
    // Passive patrons assigned to location 3 go to 7.
    // --------------------------------------------------------

    if (
        patron.passive === true &&
        newLocation === 3
    ) {
        newLocation = 7;
    }


    // --------------------------------------------------------
    // RULE 2
    // Only passive patrons may enter location 7.
    // --------------------------------------------------------

    if (
        newLocation === 7 &&
        patron.passive !== true
    ) {
        pushStatus(
            "Only passive patrons can be assigned to this location."
        );

        return false;
    }


    // --------------------------------------------------------
    // RULE 3
    // Location 7 can only hold one patron.
    // --------------------------------------------------------

    if (
        newLocation === 7 &&
        origin !== 7 &&
        locationHasPatron(7)
    ) {
        pushStatus(
            "This location can only hold one patron."
        );

        return false;
    }


    // --------------------------------------------------------
    // RULE 4
    // Location 3 can hold max 6 patrons.
    // --------------------------------------------------------

    if (
        newLocation === 3 &&
        origin !== 3 &&
        countPatronsInLocation(3) >= 6
    ) {
        pushStatus(
            "This party is full (max 6 patrons)."
        );

        return false;
    }


    // --------------------------------------------------------
    // Dropping in the same location does nothing.
    // --------------------------------------------------------

    if (origin === newLocation) {
        return false;
    }


    // --------------------------------------------------------
    // Lock logic.
    // --------------------------------------------------------

    const isLocked = loc => ({
        3: player.data.party_A_locked,
        4: player.data.party_B_locked,
        5: player.data.party_C_locked
    }[loc] || false);


    if (
        isLocked(origin) ||
        isLocked(newLocation)
    ) {
        pushStatus(
            "Cannot move patron — party is locked."
        );

        return false;
    }


    // --------------------------------------------------------
    // Find DOM elements.
    // --------------------------------------------------------

    const slot = document.querySelector(
        `.patron-slot[data-adv="${advId}"]`
    );

    const targetZone =
        document.querySelector(
            `.zone[data-location="${newLocation}"]`
        ) ||
        document.getElementById(
            locationToId[newLocation]
        );


    if (!slot || !targetZone) {

        console.warn(
            "Could not move patron: DOM element missing",
            {
                advId,
                newLocation,
                slot,
                targetZone
            }
        );

        return false;
    }


    // --------------------------------------------------------
    // Update REAL player data.
    // --------------------------------------------------------

    player.patrons[advId].location = newLocation;

    await storage.savePlayer(player);


    // --------------------------------------------------------
    // Move DOM node.
    // --------------------------------------------------------

    targetZone.appendChild(slot);


    // --------------------------------------------------------
    // Refresh derived state.
    // --------------------------------------------------------

    patronList = getVisiblePatrons();

    updatePartyAButlerLine();

    // Refresh any UI that depends on patron locations.
    // This also makes the touch and mouse paths behave
    // identically after a move.
    renderPatronInventory();


    return true;
}


// ============================================================
// FIND DROP ZONE UNDER POINTER
// ============================================================

function getDropZoneAtPoint(x, y) {

    const element = document.elementFromPoint(x, y);

    if (!element) {
        return null;
    }

    return element.closest(".dropzone");
}


// ============================================================
// DROP-ZONE VISUAL STATE
// ============================================================

function clearDragOverZones() {

    document
        .querySelectorAll(".dropzone.drag-over")
        .forEach(zone => {
            zone.classList.remove("drag-over");
        });

    document
        .querySelectorAll(".dropzone.patron-drag-target")
        .forEach(zone => {
            zone.classList.remove("patron-drag-target");
        });
}


// ============================================================
// POINTER DOWN
// ============================================================

function handlePatronPointerDown(e) {

    if (e.isPrimary === false) {
        return;
    }

    const slot = e.target.closest(".patron-slot");

    if (!slot) {
        return;
    }

    const advId = slot.dataset.adv;

    if (!advId) {
        return;
    }

    const patron = player.patrons[advId];

    if (!patron) {
        return;
    }

    // Locations 6 and 9 cannot be dragged.
    if (
        patron.location === 6 ||
        patron.location === 9
    ) {
        return;
    }


    // Start tracking the pointer.
    patronDrag.active = true;
    patronDrag.pointerId = e.pointerId;
    patronDrag.advId = advId;
    patronDrag.slot = slot;
    patronDrag.startX = e.clientX;
    patronDrag.startY = e.clientY;
    patronDrag.currentZone = null;
    patronDrag.moved = false;
	document
    .querySelectorAll(".dropzone")
    .forEach(zone => {
        zone.classList.add("patron-drag-target");
    });

    // Prevent browser scrolling/gestures while interacting
    // with a patron.
    e.preventDefault();


    // Keep receiving pointer events even if the finger moves
    // outside the patron element.
    try {
        slot.setPointerCapture(e.pointerId);
    } catch (err) {
        // Safe to ignore if pointer capture isn't available.
    }

}


// ============================================================
// POINTER MOVE
// ============================================================

function handlePatronPointerMove(e) {

    if (!patronDrag.active) {
        return;
    }

    if (e.pointerId !== patronDrag.pointerId) {
        return;
    }


    const dx =
        e.clientX - patronDrag.startX;

    const dy =
        e.clientY - patronDrag.startY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);


    // A small movement is still considered a tap.
    // Once the pointer moves 8px, it becomes a drag.
	if (!patronDrag.moved && distance < 8) {
		return;
	}

	if (!patronDrag.moved) {

		patronDrag.moved = true;

		if (patronDrag.slot) {
			patronDrag.slot.classList.add(
				"pointer-dragging"
			);
		}

		document
			.querySelectorAll(".dropzone")
			.forEach(zone => {
				zone.classList.add(
					"patron-drag-target"
				);
			});
	}

    e.preventDefault();


    // Find the drop zone under the pointer.
    const zone = getDropZoneAtPoint(
        e.clientX,
        e.clientY
    );


    clearDragOverZones();


    if (zone) {

        zone.classList.add("drag-over");

        patronDrag.currentZone = zone;

    } else {

        patronDrag.currentZone = null;
    }

}


// ============================================================
// POINTER UP
// ============================================================

async function handlePatronPointerUp(e) {

    if (!patronDrag.active) {
        return;
    }

    if (e.pointerId !== patronDrag.pointerId) {
        return;
    }


    e.preventDefault();


    const advId = patronDrag.advId;
    const slot = patronDrag.slot;
    const wasDrag = patronDrag.moved;


    // Determine final drop zone BEFORE clearing state.
    const finalZone =
        patronDrag.currentZone ||
        getDropZoneAtPoint(
            e.clientX,
            e.clientY
        );


    // Release pointer capture.
    if (slot) {

        try {
            slot.releasePointerCapture(
                e.pointerId
            );
        } catch (err) {
            // Already released / unsupported.
        }
    }


    // Clear visuals.
    clearDragOverZones();

    if (slot) {

        slot.classList.remove(
            "pointer-dragging"
        );
    }


    // Reset drag state.
    patronDrag.active = false;
    patronDrag.pointerId = null;
    patronDrag.advId = null;
    patronDrag.slot = null;
    patronDrag.currentZone = null;
    patronDrag.startX = 0;
    patronDrag.startY = 0;
    patronDrag.moved = false;


    // --------------------------------------------------------
    // It was only a tap.
    //
    // The click handler will handle selection.
    // --------------------------------------------------------

    if (!wasDrag) {
        return;
    }


    // --------------------------------------------------------
    // It was a real drag.
    // --------------------------------------------------------

    if (!finalZone) {
        return;
    }


    await movePatron(
        advId,
        finalZone
    );


    // Clear any old click selection.
    deselectPatron();
}


// ============================================================
// POINTER CANCEL
// ============================================================

function handlePatronPointerCancel(e) {

    if (!patronDrag.active) {
        return;
    }

    if (e.pointerId !== patronDrag.pointerId) {
        return;
    }


    clearDragOverZones();


    if (patronDrag.slot) {

        patronDrag.slot.classList.remove(
            "pointer-dragging"
        );
    }


    patronDrag.active = false;
    patronDrag.pointerId = null;
    patronDrag.advId = null;
    patronDrag.slot = null;
    patronDrag.currentZone = null;
    patronDrag.startX = 0;
    patronDrag.startY = 0;
    patronDrag.moved = false;
}


// ============================================================
// CLICK / TAP SUPPORT
// ============================================================

// ============================================================
// ENABLE UNIFIED PATRON INPUT
// ============================================================

function enablePatronDragDrop() {

    if (patronDragListenersAdded) {
        return;
    }

    patronDragListenersAdded = true;


    // --------------------------------------------------------
    // POINTER EVENTS
    //
    // One system for:
    //   mouse
    //   touch
    //   pen
    // --------------------------------------------------------

    document.addEventListener(
        "pointerdown",
        handlePatronPointerDown,
        { passive: false }
    );


    document.addEventListener(
        "pointermove",
        handlePatronPointerMove,
        { passive: false }
    );


    document.addEventListener(
        "pointerup",
        handlePatronPointerUp,
        { passive: false }
    );


    document.addEventListener(
        "pointercancel",
        handlePatronPointerCancel,
        { passive: false }
    );


    // --------------------------------------------------------
    // TAP / CLICK
    //
    // Kept as the click-select / click-drop fallback.
    // --------------------------------------------------------

    document.addEventListener(
        "click",
        handlePatronClick
    );
}


// Backwards compatibility.
// Your loadMissionPage() currently calls this function.
function enablePatronTouchSupport() {
    enablePatronDragDrop();
}