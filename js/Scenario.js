const debug = require('./debug.js');
const Timer = require('./Timer.js');
const helpers = require('./helpers.js');

class Scenario {
    constructor(scene) {
        this.scene = scene;
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
                debug.error(error);
                return Promise.reject(`Couldn't open the scenario file ${scenarioFile}.`);
            })
            .then(scenarioData => {
                this.setScenarioData(scenarioData);
            });
    }

    /**
     * Open a scenario file
     * @param {string} scenarioFile path to the file
     * @return {Promise} promise of the scenario data
     */
    openScenarioFile(scenarioFile) {
        return helpers.loadJSON(scenarioFile);
    }


    /**
     * startWave - Start the current wave
     *
     */
    startWave() {
        debug.log(`Starting wave #${this._waveIndex+1}`);
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
        if(this.isPaused) {
            debug.warn("This scenario is already paused.");
            return;
        }
        this.timer.pause();
        this.isPaused = true;
    }


    /**
     * continue - Continue the scenario
     *
     */
    continue() {
        if(!this.isPaused) {
            debug.warn("This scenario is not currently paused.");
            return;
        }
        this.timer.continue();
        this.isPaused = false;
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

module.exports = Scenario;
