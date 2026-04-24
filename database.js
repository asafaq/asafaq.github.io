
class databaseStorage {
    constructor() {
        this.dbName = "PlayerDB";
        this.storeName = "players";
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
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).put(player);
        return tx.complete;
    }

	async getPlayer(id) {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(this.storeName, "readonly");
			const request = tx.objectStore(this.storeName).get(id);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}
}

// const storage = new databaseStorage();

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const player = await storage.getPlayer(username);

    // CASE 1: Player does not exist → create new one
    if (!player) {
        const newPlayer = {
            id: username,
            password: password,
            level: 1,
            xp: 0
        };

        await storage.savePlayer(newPlayer);
        console.log("New player created:", newPlayer);
        startGame(newPlayer);
        return;
    }

    // CASE 2: Player exists → check password
    if (player.password !== password) {
        alert("Wrong password");
        return;
    }

    // CASE 3: Login success
    console.log("Login successful:", player);
    startGame(player);
}





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