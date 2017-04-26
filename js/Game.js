const debug = require('./debug.js');
const Mouse = require('./Mouse.js');
const Renderer = require('./Renderer.js');
const Map = require('./Map.js');
const Updater = require('./Updater.js');
const Scene = require('./Scene.js');
const InputListener = require('./InputListener.js');
const Timer = require('./Timer.js');
const Unit = require('./Unit.js');
const Tower = require('./Tower.js');

class Game {
    constructor(canvas, mapFile, scenarioFile, unitsFile, towersFile) {
        this.canvas = canvas;
        this.mouse = new Mouse(this);
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.updater = new Updater(this);
        this.scene = new Scene(this);
        this.inputListener = new InputListener(this, canvas);
        this.renderer.setView(576, 384);
        this.unitsBook = {};
        this.towersBook = {};

        this.globalTimer = new Timer();

        Promise.all([
            this.loadUnitsBook(unitsFile),
            this.loadTowersBook(towersFile)
        ]).then(() => Promise.all([
            this.loadTowers(),
            this.loadScenarioFile(scenarioFile),
            this.loadMap(mapFile)
        ])).then(() => {

            this.addTower(2,5,5);

            // start the motor
            this.renderer.render();
            this.updater.update();

            // start the scene
            this.scene.start();
        });
    }

    loadScenarioFile(scenarioFile) {
        return this.scene.loadScenario(scenarioFile)
            .then(() => this.renderer.loadScenarioUnits());
    }

    /**
     * loadUnitsBook - Load the units book
     *
     * @param  {type} unitsFile path to json file
     * @return {Promise} state promise, resolved when the units book is loaded
     */
    loadUnitsBook(unitsFile) {
        return Unit.loadUnitsFile(unitsFile).then(unitsBook => {
            this.unitsBook = unitsBook;
        });
    }


    /**
     * loadTowersBook - Load the towers book
     *
     * @param  {type} towersFile path to the json file
     * @return {Promise} state promise, resolved when the towers book is loaded
     */
    loadTowersBook(towersFile) {
        return Tower.loadTowersFile(towersFile).then(towersBook => {
            this.towersBook = towersBook;
        });
    }


    /**
     * spawnNewUnit - Spawn an unit on the map at the spawn point
     *
     * @param  {number} id unit id
     */
    spawnNewUnit(id) {
        let spawnPoint = this.map.unitPath[0];
        this.addUnit(id, spawnPoint.x, spawnPoint.y);
    }

    addUnit(id, x, y) {
        let unitData = this.unitsBook.units.find(u => u.id === id);
        let unit = new Unit(id, x, y, unitData.speed, unitData.hp, 0);
        this.map.units.push(unit);
    }

    addTower(id, x, y) {
        let towerData = this.towersBook.towers.find(t => t.id === id);
        let tower = new Tower(id, x, y, towerData.fireRate, towerData.damages, towerData.range);
        this.map.towers.push(tower);
    }

    unitsAlive() {
        return this.map.units.filter(u => u.isAlive);
    }


    /**
     * loadTowers - Load the tower sprites
     *
     * @return {Promise} state promise, resolved when the towers sprites are loaded
     */
    loadTowers() {
        return this.renderer.loadTowers();
    }

    /**
     * Load a map from a file
     * @param {string} mapFile path to the json file
     * @return {Promise} state promise, resolved when the map and its textures are loaded
     */
    loadMap(mapFile) {
        return this.map.loadMapFile(mapFile).then(() => {
            return this.renderer.loadMapTiles();
        });
    }


    /**
     * setMouseCoordinates - Set mouse position
     *
     * @param  {number} x
     * @param  {number} y
     */
    setMouseCoordinates(x, y) {
        this.mouse.screenCoordinates.x = x;
        this.mouse.screenCoordinates.y = y;
    }

    gridCoordinates(x,y) {
        return this.renderer.gridCoordinates(x,y);
    }


    /**
     * end - End the game
     *
     * @param  {boolean} isVictory true if the player won
     */
    end(isVictory) {
        if (isVictory) {
            debug.log("YOU WON");
        } else {
            debug.log("GAMEOVER");
        }

        //this.renderer.stop();
        this.updater.stop();
    }


    endBreak() {
        this.scene.startNextWave();
    }

    /**
     * Switch wether or not the monitoring is displayed
     */
    switchMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }
}

module.exports = Game;
