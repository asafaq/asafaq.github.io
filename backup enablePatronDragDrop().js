function enablePatronDragDrop() {
    const slots = document.querySelectorAll(".patron-slot");
    const zones = document.querySelectorAll(".dropzone");

    // DRAG START
    slots.forEach(slot => {
        slot.addEventListener("dragstart", e => {
            e.dataTransfer.setData("advId", slot.dataset.adv);
            slot.classList.add("dragging");
        });

        slot.addEventListener("dragend", () => {
            slot.classList.remove("dragging");
        });
    });

    // DROP ZONES
    zones.forEach(zone => {
        zone.addEventListener("dragover", e => {
            e.preventDefault();
            zone.classList.add("drag-over");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("drag-over");
        });

		zone.addEventListener("drop", async e => {
			e.preventDefault();
			zone.classList.remove("drag-over");

			const advId = e.dataTransfer.getData("advId");
			if (!advId) return;

			// 1. Determine new location
			let newLocation = 1;
			if (zone.id === "party-a-patron-inventory") newLocation = 3;
			if (zone.id === "party-b-patron-inventory") newLocation = 4;
			if (zone.id === "party-c-patron-inventory") newLocation = 5;
			if (zone.id === "guild-patron-inventory") newLocation = 1;
			if (zone.id === "guild2-patron-inventory") newLocation = 2;

			// 2. Update patron location in memory
			player.patrons[advId].location = newLocation;

			// 3. Save to IDB
			await storage.savePlayer(player);

			// 4. Re-render UI
			patronList = getVisiblePatrons();
			renderPatronInventory();

			// 5. Re-bind drag/drop AFTER the DOM is replaced
			setTimeout(enablePatronDragDrop, 0);
		});

    });
}
