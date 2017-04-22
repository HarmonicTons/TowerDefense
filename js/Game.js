class Game {
    constructor(canvas, mapFile, scenarioFile) {
        this.canvas = canvas;
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.updater = new Updater(this);
        this.scenario = new Scenario(this);
        this.inputListener = new InputListener(this, canvas);
        this.renderer.setView(600, 400);

        this.globalTimer = new Timer();

        Promise.all([
            this.loadScenario(scenarioFile),
            this.loadMap(mapFile)
        ]).then(() => {
            this.renderer.render();
            this.updater.update();
        });
    }

    /**
     * Load a scenario from a file
     * @param {string} scenarioFile path to the json file
     * @return {Promise} state promise, resolved when the scenario and its textures are loaded
     */
    loadScenario(scenarioFile) {
        return this.scenario.loadScenarioFile(scenarioFile).then(() => {
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
     * Update the game
     */
    update() {
    }

    /**
     * Switch wether or not the monitoring is displayed
     */
    switchMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }
}
