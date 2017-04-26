const helpers = require('./helpers.js');
const debug = require('./debug.js');

class Map {
    constructor(game, mapFile) {
        this.game = game;
        this.units = [];
        this.towers = [];
    }

    /**
     * Open a map file and set the map data
     * @param {string} mapFile path to the file
     * @return {Promise} state promise
     */
    loadMapFile(mapFile) {
        return this.openMapFile(mapFile)
            .catch(error => {
                debug.error(error);
                return Promise.reject(`Couldn't open the scenario file ${scenarioFile}.`);
            })
            .then(mapData => {
                this.setMapData(mapData);
            });
    }

    /**
     * Open a map file
     * @param {string} mapFile path to the file
     * @return {Promise} promise of the map data
     */
    openMapFile(mapFile) {
        return helpers.loadJSON(mapFile);
    }

    /**
     * Set the map data
     * @param {object} mapData map data
     */
    setMapData(mapData) {
        this.name = mapData.name;
        this.width = mapData.width;
        this.height = mapData.height;
        this.data = mapData.data;
        this.tiles = mapData.tiles;
        this.unitPath = mapData.unitPath;
    }

    /**
     * Get the map index of the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @return {number} map index
     */
    indexAt(x, y) {
        return x + y * this.width;
    }

    /**
     * Get the tile id at the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @return {number} tile id
     */
    tileAt(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
        let index = this.indexAt(x, y);
        return this.data[index];
    }


    /**
     * @static distance - Distance between two points
     *
     * @param  {object} u1 point 1
     * @param  {object} u2 point 2
     * @return {number}    distance
     */
    static distance(u1, u2) {
        return Math.sqrt((u1.x - u2.x) * (u1.x - u2.x) + (u1.y - u2.y) * (u1.y - u2.y));
    }
}

module.exports = Map;
