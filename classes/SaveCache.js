const fs = require("node:fs");
const path = require("node:path");

class SaveCache {
    #cache = {};
    #filePath;

    /**
     * Cache that uses file storage.
     * 
     * @param { String } filePath - Where the file should be stored.
     */
    constructor(filePath) {
        this.#filePath = filePath;
        this.#constructAndRead();
    }

    /**
     * Initialise cache, reading if it exists, creating if it does not.
     */
    #constructAndRead() {
        if (!fs.existsSync(this.#filePath)) {
            fs.mkdirSync(path.dirname(this.#filePath));
            fs.writeFileSync(this.#filePath, "{}", "utf-8");
            return;
        }

        const content = fs.readFileSync(this.#filePath);
        try {
            this.#cache = JSON.parse(content);
        } catch {}
    }

    /**
     * Check if a value has been set at a given key.
     * 
     * @param { String } key 
     * @returns { Boolean }
     */
    exists(key) {
        return Object.hasOwn(this.#cache, key);
    }

    /**
     * Check if a value has been set at a given key, and if it is still valid (not expired).
     * 
     * @param { String } key 
     * @returns { Boolean }
     */
    existsAndValid(key) {
        const data = this.#cache[key];
        if (!data) return false;

        const expiry = new Date(data.expiresAt);
        const now = new Date();

        // Returns true if expiry time has not passed yet.
        return (now < expiry);
    }

    /**
     * Get value stored at key.
     * 
     * @param { String } key
     * @returns { any } 
     */
    getValue(key) {
        const data = this.#cache[key];
        
        return data?.value || null;
    }

    /**
     * Set value for key.
     * 
     * @param { String } key 
     * @param { any } value 
     * @param { Number } expiresAfter - Minutes after which the cache should expire, or become "invalid" as it does not just remove it at this time but marks as expired.
     */
    set(key, value, expiresAfter = 60) {
        const now = new Date().toISOString();
        const createdAt = this.#cache[key]?.createdAt || now;

        const expiryDate = (expiresAfter) ? new Date() : null;
        if (expiresAfter) expiryDate.setMinutes(expiryDate.getMinutes() + expiresAfter);

        this.#cache[key] = {
            value,
            lastUpdated: now,
            createdAt,
            expiresAt: expiryDate ? expiryDate.toISOString() : null
        }

        this.#save();
    }

    /**
     * Remove an entry from the cache.
     * 
     * @param { String } key 
     */
    remove(key) {
        delete this.#cache[key];

        this.#save();
    }

    #save() {
        return fs.promises.writeFile(this.#filePath, JSON.stringify(this.#cache), "utf-8");
    }
}

module.exports = SaveCache;