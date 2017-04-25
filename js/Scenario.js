class Scenario {
    constructor(game) {
        this.game = game;
        this.timer = new Timer();
        this.isPaused = true;
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
     * startWave - Start the current wave
     *
     */
    startWave() {
        console.log(`Starting wave #${this._waveIndex+1}`);
        this.timer.reset();
        this.isPaused = false;
    }

    /**
     * Set the scenario data
     * @param {object} scenarioData scenario data
     */
    setScenarioData(scenarioData) {
        this.name = scenarioData.name;
        this.waves = scenarioData.waves;
        this.units = scenarioData.units;
        this.baseHealth = scenarioData.baseHealth;

        this._waveIndex = 0;
    }


    /**
     * pause - Put the scenario on hold
     *
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Indicate what unit are to be spawned now according to the scenario
     * @return {object[]} array of units to spawn
     */
    unitsToSpawn() {
        let data = this.currentWave.filter(d => d.timestamp <= this.timer.now && !d.spawned);
        return data;
    }


    /**
     * get currentWave - Get the current wave data
     *
     * @return {object}  current wave data
     */
    get currentWave() {
        return this.waves[this._waveIndex];
    }


    /**
     * nextWave - Move to the next wave
     *
     * @return {object}  next wave data
     */
    nextWave() {
        this._waveIndex++;
        return this.currentWave;
    }

    /**
     * isOver - Indicate if the scenario is over
     *
     * @return {boolean}  true if the scenario is over
     */
    get isOver() {
        return this._waveIndex > this.waves.length || (this._waveIndex == this.waves.length && this.waveOver);
    }


    /**
     * get waveOver - Indicate if the current wave is over
     *
     * @return {boolean}  true if the wave is over
     */
    get waveOver() {
        return (!this.currentWave || this.timer.now > this.currentWave.slice(-1)[0].timestamp);
    }
}
