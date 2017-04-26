const debug = require('./debug.js');
const Timer = require('./Timer.js');
const helpers = require('./helpers.js');

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
                debug.error(error);
                return Promise.reject(`Couldn't open the units file ${towersFile}.`);
            });
    }

    /**
     * Open a units file
     * @param {string} towersFile path to the file
     * @return {Promise} promise of the units data
     */
    static openTowersFile(towersFile) {
        return helpers.loadJSON(towersFile);
    }
}

module.exports = Tower;
