class Scenario {
    constructor(game) {
        this.game = game;
    }

    /**
     * Open a scenario file and set the scenario data
     * @param {string} scenarioFile path to the file
     * @return {Promise} state promise
     */
    loadScenarioFile(scenarioFile) {
        return this.openScenarioFile(scenarioFile)
            .catch(error => {
                console.error(error);
                return Promise.reject(`Couldn't open the scenario file ${scenarioFile}.`);
            })
            .then(scenarioData => {
                this.setScenarioData(scenarioData);
            });
    }

    /**
     * Open a scenario file
     * @param {string} mapFile path to the file
     * @return {Promise} promise of the scenario data
     */
    // this is a mimick for local tests only to avoid cross-origin protections
    openScenarioFile(scenarioFile) {
        let scenarioFileName = scenarioFile.split('/').slice(-1)[0];
        let scenarioData = scenarii.find(m => m.file === scenarioFileName);
        if (!scenarioData) return Promise.reject("No such file.");
        return Promise.resolve(scenarioData);
    }

    /*
    openScenarioFile(mapFile) {
        return helpers.loadJSON(scenarioFile);
    }
    */

    /**
     * Set the scenario data
     * @param {object} scenarioData scenario data
     */
    setScenarioData(scenarioData) {
        this.name = scenarioData.name;
        this.data = scenarioData.data;
        this.units = scenarioData.units;
        this.baseHealth = scenarioData.baseHealth;
    }

    /**
     * Indicate what unit are to be spawned now according to the scenario
     * @param {number} timestamp
     * @return {object[]} array of units to spawn
     */
    unitsToSpawn(timestamp) {
        let data = this.data.filter(d => d.timestamp <= timestamp && !d.spawned);
        return data;
    }


    /**
     * isOver - Indicate if the scenario is over
     *
     * @return {boolean}  true if the scenario is over
     */
    get isOver() {
        return (this.game.globalTimer.now > this.data.slice(-1)[0].timestamp);
    }
}
