class Tower {
    constructor(id, x, y, fireRate, damages, range) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.fireRate = fireRate;
        this.damages = damages;
        this.range = range;
        this.timer = new Timer();
    }

    static loadTowersFile(towersFile) {
        return Tower.openTowersFile(towersFile)
            .catch(error => {
                console.error(error);
                return Promise.reject(`Couldn't open the units file ${towersFile}.`);
            });
    }

    /**
     * Open a units file
     * @param {string} towersFile path to the file
     * @return {Promise} promise of the units data
     */
    // this is a mimick for local tests only to avoid cross-origin protections
    static openTowersFile(towersFile) {
        let towersFileName = towersFile.split('/').slice(-1)[0];
        let towersBook = towersBooks.find(m => m.file === towersFileName);
        if (!towersBook) return Promise.reject("No such file.");
        return Promise.resolve(towersBook);
    }

    /*
    openTowersFile(towersFile) {
        return helpers.loadJSON(towersFile);
    }
    */
}
