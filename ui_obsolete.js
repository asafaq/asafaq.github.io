function startTutorial() {
	// TODO: Replace with mission-based tutorial system
	if (player.missions.tutorial === 0) {
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
                setTutorialChoices([
					{
						label: "OK",
						action: () =>	{
							closeTutorial();
							startMissionSystem("tutor1_101");}
							}]);
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

function startTutorial2() {
	// TODO: Replace with mission-based tutorial system
	if (player.missions.green_1 === 6) {
	startMissionSystem("tutor2_101")
	}
}






async function handleMissionEnd_OLD(sceneId) {
    console.log("Mission finished. Processing rewards and cleanup...");
    console.log(`Ending triggered by scene: ${sceneId}`);
	nextPage = {}
	const partyKey = player.missions.current_mission?.party ?? null;


    // 1. Reward Logic
    if (sceneId === "tutor1_110") {
		player = await storage.loadPlayer(player.id);
        console.log("Logic for Tutorial 1 completion!");
        player.missions.tutorial = 1;
		
		if (!player.missions) player.missions = {};
		//if (!player.missions.current_mission) player.missions.current_mission = "green1";
		if (!player.missions.current_mission) player.missions.current_mission = {};
		if (!player.missions.current_mission.id) player.missions.current_mission.id = {};
		if (!player.missions.current_mission.party) player.missions.current_mission.party = {};
			
        player.missions.green_1 = 1;
		recruitAdventurer("adv_Hogperson")
		recruitAdventurer("adv_Bragain")
		recruitAdventurer("adv_Claudio")
		recruitAdventurer("adv_Amyssa")
		//change Claudio's location to 0 meaning he is missing, then later set to 2.
		player.patrons ??= {};
		player.patrons.adv_Bragain.location = 3;
		player.patrons.adv_Hogperson.location = 3;
		player.patrons.adv_Claudio.location = 0;
		player.patrons.adv_Amyssa.status = "applicant";
		player.missions.current_mission.current_party = "party_A";
		player.missions.current_mission.id = "green_1";
		
		Journal.addEntry("You've purchase yourself a Tavern.")
		Journal.addEntry("You've signed a contract with the government and recieved your Adventurers' Guild Licence.")
		Journal.addEntry("You've recruited Hogperson, Bragain and Claudio.")
		nextPage = "missions"
    } 
  
    if (sceneId === "green1_008END") {
		player = await storage.loadPlayer(player.id);
		player.missions.green_1 = 2;
		//player.missions.current_mission.id = "green2"
		loadPage("mission_green_1")
		Journal.addEntry("You've agreed to head towards a stash of coins.")
		
		nextPage = "mission_green_1"
	}
  
    if (sceneId === "green1_019END") {
		player = await storage.loadPlayer(player.id);
		player.missions.green_1 = 3;
		//player.missions.current_mission.id = "green3"
		loadPage("mission_green_1")
		Journal.addEntry("In the nearby green pastures, you've smashed a rock to bits.")
		
		nextPage = "mission_green_1"
	}
  
    if (sceneId === "green1_025END") {
		player = await storage.loadPlayer(player.id);
		player.missions.green_1 = 4;
		//player.missions.current_mission.id = "green4"
		loadPage("mission_green_1")
		Journal.addEntry("You've cheered up a wandering traveler.")
		
		nextPage = "mission_green_1"
	}

    if (sceneId === "green1_502end") {
		launchBattle("tutor_test");
		
		player.missions.green_1 = 6;
		nextPage = "mission_green_1"
		
		
	}

    if (sceneId === "green1_048END") {
		player = await storage.loadPlayer(player.id);
		player.missions.green_1 = 5;
		//player.missions.current_mission.id = "green5";
		//recruitAdventurer("adv_Claudio")
		player.patrons.adv_Claudio.location = 3;
		loadPage("mission_green_1")
		Journal.addEntry("You've successfully demoralized a band of Koboldogs.")
		Journal.addEntry("You've saved Claudio from a cage.")
		nextPage = "mission_green_1"
	}
  
    if (sceneId === "green1_056END") {
		
		player = await storage.loadPlayer(player.id);
		setPartyLock(false)
		player.missions.green_1 = 6;

		endMission(); // ← THE ONLY NEW LINE THAT MATTERS
		loadPage("tavern")
		Journal.addEntry("You've found 50 silver coins and returned to the guild.")
		//ending mission so releasing the party lock
		nextPage = "guild"
	}
    if (sceneId === "tutor2_118END") {
		await addMail({
			id: crypto.randomUUID(),
			from: "Hogmother",
			subject: "Dad update",
			body: "My Dear Hoggy!\n\nYour father has gone missing! He went out to work and never came back.\n\nI'll be travelling to the Township Tavern to gather information and post a missing fliar hoping to recruit investigators to try and find him.\n\nI wish you the best my precious Hoggy\nI'm so proud of you!\nLove and kisses\nHogmother XOXO",
			timestamp: Date.now(),
			image: "assets/missions/hogmother_letter.jpg"
			});
		player = await storage.loadPlayer(player.id);
		
        console.log("Logic for Tutorial 2 completion!");
        player.missions.tutorial = 2; 
        player.missions.green_1 = 7;
        player.missions.green_2 ??= 0; // 0 means the mail arrived.
		player.patrons.adv_Amyssa.status = "idle";

        // Add your logic to add Amyssa, deduct money, etc. here
		Journal.addEntry("You've recruited Amyssa to sign a 25 silver coins contract.")		
		nextPage = "tavern"
    } 
	
    if (sceneId === "green2_008end") {
        player.missions.green_2 = 1;
		Journal.addEntry("You've decided to travel to the Township Tavern and meet up with Hogmother.")
		nextPage = "missions"
	}

	if (sceneId === "green2_117end") {
		player.missions.green_2 = 2;
		player.patrons.adv_Amyssa.location = 3;
		// add spellscrolls management logic, if her scrolls remained in the stash back in the guild, she'll bring them along.
		Journal.addEntry(
			`Amyssa has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`
		);
		nextPage = "mission_green_2"
	}

	if (sceneId === "green2_240a_end") {
		player.missions.green_2 = 3;
		recruitAdventurer("adv_Hogmother")
		player.patrons.adv_Hogmother.location = 3;
		player.patrons.adv_Hogmother.status = "mission";
		Journal.addEntry(
			`You've met up with Hogmother and she has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`
		);
		nextPage = "mission_green_2"
	}

	if (sceneId === "green2_245b_end") {
		player.missions.green_2 = 3;
		player.missions.green_3 = 2;
		player.missions.current_mission.id = "green_3";
		player.missions.current_mission.locked_mission = "green_3";
		player.missions.current_mission.page = "mission_green_3"
		recruitAdventurer("adv_Hogmother")
		player.patrons.adv_Hogmother.location = 3;
		player.patrons.adv_Hogmother.status = "mission";
		recruitAdventurer("adv_Lurch")
		player.patrons.adv_Lurch.location = 9;
		player.patrons.adv_Lurch.status = "secret";
		Journal.addEntry(
			`You've met up with Hogmother and she has joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}.`
		);
		Journal.addEntry(
			`You've dealth with Lurch who has agreed on to spy for the ${player.data.party_A} and meet them later as they make their own way to ${player.missions.current_mission.id}.`
		);
		nextPage = "mission_green_3"
	}

	
	if (sceneId === "green3_243END") {
		player.missions.green_3 = 3;
		player.missions.dwood_1 = 0;
		player.missions.current_mission.id = "dwood_1";
		player.missions.current_mission.locked_mission = "dwood_1";
		player.missions.current_mission.page = "mission_dwood_1"
		recruitAdventurer("adv_Awetruce")
		player.patrons.adv_Awetruce.location = 6; //guide _A position
		player.patrons.adv_Awetruce.status = "mission";
		
		recruitAdventurer("adv_Sebastian")
		player.patrons.adv_Sebastian.location = 3;
		player.patrons.adv_Sebastian.status = "mission";
		
		Journal.addEntry(
			`You've met with Awetruce who have agreed to overwatch the ${player.data.party_A} on their way to ${player.missions.current_mission.id}, and will participate in their final fight.`
		);
		Journal.addEntry(
			`You've met with Sebastian the Young who joined the ${player.data.party_A} on their way to ${player.missions.current_mission.id}, and will investigate the Temple alongside you.`
		);
		
		
		nextPage = "mission_dwood_1"
	}

	
    
    // 2. Save Player Data
    if (typeof player !== 'undefined' && typeof storage !== 'undefined') {
        await storage.savePlayer(player); 
    }

    // 3. Clear Game State from IDB
    if (db) {
        const tx = db.transaction("gameState", "readwrite");
        tx.objectStore("gameState").clear();
    }

    // 4. UI Cleanup & Navigation
    const viewport = document.getElementById('m-viewport');
    if (viewport) viewport.style.display = 'none';
    
	loadPage(nextPage);
	}

async function handleMissionEnd_FUNKY(sceneId) {
    // 1. Identify which scenes are "Final Bosses" or true ending points.
    // These will trigger the full cleanup (endMission, Viewport hide, DB clear).
    const campaignEndScenes = [
        "green1_056END", 
        "tutor1_110", 
        "tutor2_118END"
        // Add more final scene IDs here as you write them
    ];
    const isCampaignEnd = campaignEndScenes.includes(sceneId);

    const endings = {
        /* --- TUTORIALS --- */
        "tutor1_110": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions ??= {};
            player.patrons ??= {};
            
            player.missions.tutorial = 1;
            player.missions.green_1 = 1;

            recruitAdventurer("adv_Hogperson");
            recruitAdventurer("adv_Bragain");
            recruitAdventurer("adv_Claudio");
            recruitAdventurer("adv_Amyssa");

            player.patrons.adv_Bragain.location = 3;
            player.patrons.adv_Hogperson.location = 3;
            player.patrons.adv_Claudio.location = 0;
            player.patrons.adv_Amyssa.status = "applicant";

            Journal.addEntry("You've purchased yourself a Tavern.");
            Journal.addEntry("You've signed a contract with the government.");
            loadPage("missions");
        },

        "tutor2_118END": async () => {
            await addMail({
                id: crypto.randomUUID(),
                from: "Hogmother",
                subject: "Dad update",
                body: "...", // Letter content
                timestamp: Date.now(),
                image: "assets/missions/hogmother_letter.jpg"
            });
            player = await storage.loadPlayer(player.id);
            player.missions.tutorial = 2;
            player.missions.green_1 = 7;
            player.missions.green_2 ??= 0;
            player.patrons.adv_Amyssa.status = "idle";
            Journal.addEntry("You've recruited Amyssa.");
            loadPage("tavern");
        },

        /* --- GREEN 1 ARC --- */
        "green1_008END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 2;
            player.patrons.adv_Bragain.location = 3;
            player.patrons.adv_Hogperson.location = 3;
            player.patrons.adv_Claudio.location = 0;
            Journal.addEntry("You've agreed to head towards a stash of coins.");
            loadPage("mission_green_1");
        },

		"green1_019END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 3;
            Journal.addEntry("In the nearby green pastures, you've smashed a rock to bits.");
            loadPage("mission_green_1");
        },

        "green1_025END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 4;
            Journal.addEntry("You've cheered up a wandering traveler.");
            loadPage("mission_green_1");
        },

        "green1_502end": async () => {
            // CRITICAL: This triggers the actual battle engine
            launchBattle("tutor_test");
            player.missions.green_1 = 6;
            // No loadPage here because launchBattle takes over the UI
        },

        "green1_048END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 5;
            player.patrons.adv_Claudio.location = 3; // Ensure he appears in the Tavern/Guild
            Journal.addEntry("You've successfully demoralized a band of Koboldogs and saved Claudio.");
            loadPage("mission_green_1");
        },


        "green1_056END": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.green_1 = 7; // Campaign Complete
            player.data.treasury = { "Silver Coins": 50 };
            Journal.addEntry("You've found 50 silver coins and returned to the guild.");
            loadPage("tavern");
        },

        /* --- GREEN 2 ARC (Ported from old function) --- */
        "green2_008end": async () => {
            player.missions.green_2 = 1;
            Journal.addEntry("You've decided to travel to meet up with Hogmother.");
            loadPage("missions");
        },

        "green2_245b_end": async () => {
            player.missions.green_2 = 3;
            player.missions.green_3 = 2;
            player.missions.current_mission.id = "green_3";
            player.missions.current_mission.page = "mission_green_3";
            recruitAdventurer("adv_Hogmother");
            recruitAdventurer("adv_Lurch");
			
            player.patrons.adv_Hogmother.location = 3;
            player.patrons.adv_Lurch.location = 9;
			
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            Journal.addEntry("You've met Hogmother and dealt with Lurch the spy.");
            loadPage("mission_green_3");
        },

		"green3_243END": async () => {
            // 1. Advance the story states
            player.missions.green_3 = 3;
            player.missions.dwood_1 = 0;

            // 2. Mid-mission pivot: Changing the active quest data
            player.missions.current_mission.id = "dwood_1";
            player.missions.current_mission.locked_mission = "dwood_1";
            player.missions.current_mission.page = "mission_dwood_1";

            // 3. New Recruitments (Awetruce & Sebastian)
            recruitAdventurer("adv_Awetruce");
            player.patrons.adv_Awetruce.location = 6; // Positioned as a guide
            player.patrons.adv_Awetruce.status = "mission";

            recruitAdventurer("adv_Sebastian");
            player.patrons.adv_Sebastian.location = 3;
            player.patrons.adv_Sebastian.status = "mission";

			
			const partyKey = player.missions.current_mission.party;
            buildPartyTraits(partyKey);
			buildPartySummary(partyKey);
            // 4. Record the lore
            Journal.addEntry(
                `You've met with Awetruce who has agreed to overwatch the ${player.data.party_A}`
            );
            Journal.addEntry(
                `You've met with Sebastian the Young who joined the ${player.data.party_A}`
            );

            // 5. Switch the map without returning to the Tavern
            loadPage("mission_dwood_1");
        },


        /* --- DEEPWOOD ARC (New Content) --- */
        "dwood1_181end": async () => {
            player = await storage.loadPlayer(player.id);
            player.missions.dwood_1 = 1;
            player.missions.dwood_fort1 = 0;
            Journal.addEntry("The Trollkin approached, and Amyssa lost her spellbook.");
            recruitAdventurer("adv_Trollkin");
            player.patrons.adv_Trollkin.status = "rival";
            loadPage("mission_dwood_1");
        }
    };

    // --- EXECUTION ENGINE ---
    if (endings[sceneId]) {
        // 1. Run the specific scene logic
        await endings[sceneId]();

        // 2. Handle Logic Fork: Total End vs. Checkpoint
        if (isCampaignEnd) {
            console.log("Cleanup: Campaign Ending Triggered.");
            
            // Run your existing reset function
            endMission(); 

            // Clear the temporary IndexedDB state
            if (typeof db !== 'undefined') {
                const tx = db.transaction("gameState", "readwrite");
                tx.objectStore("gameState").clear();
            }

            // Hide the mission viewport
            const viewport = document.getElementById('m-viewport');
            if (viewport) viewport.style.display = 'none';

        } else {
            console.log("Cleanup: Mid-mission Checkpoint saved.");
            // Just unlock the party temporarily if needed, 
            // but keep the viewport visible.
        }

        // 3. Final Permanent Save
        await storage.savePlayer(player);
        return true;
    }

    console.warn(`No ending logic found for sceneId: ${sceneId}`);
    return false;
}
