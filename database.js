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
        this.currentPlayer = null;   // store only the logged-in player
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

			const req = store.put(player);

			req.onerror = () => reject(req.error);
			tx.oncomplete = () => resolve(true);
			tx.onerror = () => reject(tx.error);
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
			tx.onerror = () => reject(tx.error);
		});
	}
}

const storage = new databaseStorage();
const username = storage.loadPlayer(username);



async function addNewPlayerData(newPlayer) {
    const response = await fetch('./lore.json');
    const lore = await response.json();
    console.log(lore);
}
    // Example: inject adventurer.guy1 data
    const add_adv1 = lore.Adventurer.Hogperson;
    const add_adv2 = lore.Adventurer.Bragain;

    // Copy all fields from the template into the new player
    for (const key in add_adv1) {
        newPlayer[key] = add_adv1[key];
	}
    for (const key in add_adv2) {
        newPlayer[key] = add_adv2[key];
    }

module.exports = addNewPlayerData;
//let Database

async function startGame(newPlayer) {
    console.log("Starting game with player:", player);

    //await Database.init();
    const username = player.id;   // this is the username string
    const tutor = player.tutor;   // example: use other fields

}


