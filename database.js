// Remote DB placeholders (future)
// These functions do nothing now, but your game already supports them.


async function getRemote(key) {
    try {
        const res = await fetch(`/api/get?key=${key}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function setRemote(key, value) {
    try {
        await fetch(`/api/set`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value })
        });
    } catch {}
}

async function deleteRemote(key) {
    try {
        await fetch(`/api/delete?key=${key}`, { method: "DELETE" });
    } catch {}
}

// Remote DB placeholders (future)
// These functions do nothing now, but your game already supports them.

// Start of local DB



class databaseStorage {
    constructor() {
        this.dbName = "PlayerDB";
        this.storeName = "players";
        this.currentPlayer = null;
    }

    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 2);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

	async savePlayer(player) {
		const db = await this.open();

		return new Promise((resolve, reject) => {
			const tx = db.transaction(this.storeName, "readwrite");
			const store = tx.objectStore(this.storeName);

			// Ensure the keyPath exists
			if (!player.id) {
				player.id = crypto.randomUUID();
			}

			const req = store.put(player);

			req.onsuccess = () => {
				this.currentPlayer = player;
				resolve(req.result);
			};

			req.onerror = () => reject(req.error);
		});
	}

    async loadPlayer(id) {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);

            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
}

const storage = new databaseStorage();

async function addNewPlayerData(username, password) {
    //const response = await fetch('./lore.json');
    //const lore = await response.json();

    //const add_adv1 = lore.Adventurer.Hogperson;
    //const add_adv2 = lore.Adventurer.Bragain;

    const newPlayer = {
        id: username, 
        auth: {
            password: password,
            lastLogin: Date.now()
        },
        data: {
            accountType: 0,
            tutor: 0,
            guild_name: "The Adventurers Guild",
            party_A: "Party A",
            party_B: "Party B"
        },
        patrons: {} // The container for our NPCs/Adventurers
    };

    // 1. Assign Hogperson to the patrons object under the key 'Hogperson'
    //newPlayer.patrons["Hogperson"] = add_adv1;

    // 2. Assign Bragain to the patrons object under the key 'Bragain'
    //newPlayer.patrons["Bragain"] = add_adv2;
	
	await storage.savePlayer(newPlayer);
}
