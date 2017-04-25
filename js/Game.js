class Game {
    constructor(canvas, mapFile, scenarioFile, unitsFile, towersFile) {
        this.canvas = canvas;
        this.mouse = new Mouse(this);
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.updater = new Updater(this);
        this.scenario = new Scenario(this);
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
            this.loadScenario(scenarioFile),
            this.loadMap(mapFile)
        ])).then(() => {

            // add a tower
            let towerData = this.towersBook.towers[1];
            let tower = new Tower(towerData.id, 5, 5, towerData.fireRate, towerData.damages, towerData.range);
            this.map.towers.push(tower);

            // start the motor
            this.renderer.render();
            this.updater.update();

            // start the scenario
            this.scenario.startWave();
        });
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
     * loadTowers - Load the tower sprites
     *
     * @return {Promise} state promise, resolved when the towers sprites are loaded 
     */
    loadTowers() {
        return this.renderer.loadTowers();
    }

    /**
     * Load a scenario from a file
     * @param {string} scenarioFile path to the json file
     * @return {Promise} state promise, resolved when the scenario and its textures are loaded
     */
    loadScenario(scenarioFile) {
        return this.scenario.loadScenarioFile(scenarioFile).then(() => {
            this.baseHealth = this.scenario.baseHealth;
            return this.renderer.loadScenarioUnits();
        });
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
     * end - End the game
     *
     * @param  {boolean} isVictory true if the player won
     */
    end(isVictory) {
        if (isVictory) {
            console.log("YOU WON");
        } else {
            console.log("GAMEOVER");
        }

        //this.renderer.stop();
        this.updater.stop();
    }

    /**
     * Switch wether or not the monitoring is displayed
     */
    switchMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }
}
