const debug = require('./debug.js');
const PubSub = require('pubsub-js');
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
        this.selection = [];

        this.globalTimer = new Timer();

        Promise.all([
            this.loadUnitsBook(unitsFile),
            this.loadTowersBook(towersFile)
        ]).then(() => Promise.all([
            this.loadTowers(),
            this.loadScenarioFile(scenarioFile),
            this.loadMap(mapFile)
        ])).then(() => {

            this.addTower(2, 5, 5);

            // start the motor
            this.renderer.render();
            this.updater.update();

            // start the scene
            this.scene.start();
        });
    }


    /**
     * loadScenarioFile - Load a scenario file
     *
     * @param  {string} scenarioFile path to json file
     * @return {Promise}             state promise
     */
    loadScenarioFile(scenarioFile) {
        return this.scene.loadScenario(scenarioFile)
            .then(() => this.renderer.loadScenarioUnits());
    }

    /**
     * loadUnitsBook - Load the units book
     *
     * @param  {string} unitsFile path to json file
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


    /**
     * addUnit - Add a unit on the map
     *
     * @param  {number} id Id of the unit to add
     * @param  {number} x  x coordinate
     * @param  {number} y  y coordinate
     * @return {Unit}      added unit
     */
    addUnit(id, x, y) {
        let unitData = this.unitsBook.units.find(u => u.id === id);
        let unit = new Unit(id, x, y, unitData.speed, unitData.hp, 0);
        this.map.units.push(unit);
        return unit;
    }


    /**
     * addTower - Add a tower on the map
     *
     * @param  {number} id Id of the tower to add
     * @param  {number} x  x coordinate
     * @param  {number} y  y coordinate
     * @return {Tower}     added tower
     */
    addTower(id, x, y) {
        let towerData = this.towersBook.towers.find(t => t.id === id);
        if (!towerData) {
            debug.error(`Couldn't find the tower of id: ${id}`);
            return;
        }
        let tower = new Tower(id, x, y, towerData.fireRate, towerData.damages, towerData.range);
        this.map.towers.push(tower);
        return tower;
    }


    /**
     * unitsAlive - Every units alive
     *
     * @return {Unit[]}  array of all the units currently alive
     */
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


    /**
     * gridCoordinates - Get grid coordinates from screen coordinates
     *
     * @param  {number} x x screen coordinate
     * @param  {number} y x screen coordinate
     * @return {object}   grid coordinates
     */
    gridCoordinates(x, y) {
        return this.renderer.gridCoordinates(x, y);
    }


    /**
     * caseCoordinates - Get case coordinates from screen coordinates
     *
     * @param  {number} x x screen coordinate
     * @param  {number} y x screen coordinate
     * @return {object}   case coordinates
     */
    caseCoordinates(x, y) {
        let gridCoordinates = this.gridCoordinates(x, y);
        return {
            x: Math.floor(gridCoordinates.x),
            y: Math.floor(gridCoordinates.y)
        }
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


    /**
     * mapClick - Handle a click on the map
     *
     * @param  {number} x x screen coordinate
     * @param  {number} y y screen coordinate
     * @fires onClickTower
     * @fires onClickUnit
     * @fires onClickMap
     */
    mapClick(x, y) {
        let caseCoordinates = this.caseCoordinates(x, y);

        let towerClicked = this.map.towerAt(caseCoordinates.x, caseCoordinates.y);
        if (towerClicked) {
            return PubSub.publish('onClickTower', towerClicked);
        }

        let unitClicked = this.map.unitAt(caseCoordinates.x, caseCoordinates.y);
        if (unitClicked) {
            return PubSub.publish('onClickUnit', unitClicked);
        }

        return PubSub.publish('onClickMap', caseCoordinates);
    }

    /**
     * Toggle the monitoring display
     */
    toggleMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }

    /**
     * Toggle the towers' ranges display
     */
    toggleTowersRangeDisplay() {
        this.renderer.displayTowersRanges = !this.renderer.displayTowersRanges;
    }


    /**
     * select - Select a selection
     *
     * @param  {object} ...selectedObjects selection
     */
    select(...selectedObjects) {
        this.selection = selectedObjects;
    }


    /**
     * isSelected - Indicate if an object is selected
     *
     * @param  {object} obj object to check
     * @return {boolean}    true if selected
     */
    isSelected(obj) {
        return this.selection.includes(obj);
    }
}

module.exports = Game;
