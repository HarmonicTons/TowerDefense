const debug = require('./debug.js');
const Scenario = require('./Scenario.js');
const Action = require('./Action.js');
const InputListener = require('./InputListener.js');

class Scene {
    constructor(game) {
        this.game = game;
        this.scenario = new Scenario(this);
        this._statusNames = ["in wave", "in break"];
        this.statusIndex = 0;
        this.actions = [];

        this.setWaveActions();
    }

    get status() {
        return this._statusNames[this.statusIndex];
    }


    /**
     * start - Start the scene with it's scenaro
     *
     */
    start() {
        this.scenario.startWave();
    }

    /**
     * Load a scenario from a file
     * @param {string} scenarioFile path to the json file
     * @return {Promise} state promise, resolved when the scenario and its textures are loaded
     */
    loadScenario(scenarioFile) {
        return this.scenario.loadScenarioFile(scenarioFile).then(() => {
            this.game.baseHealth = this.scenario.baseHealth;
        });
    }


    /**
     * startBreak - Start the break phase
     *
     */
    startBreak() {
        if (this.statusIndex === 1) {
            debug.warn("The game is already in break phase.");
            return;
        }
        debug.log("Break phase.");
        this.statusIndex = 1;

        this.setBreakActions();
    }


    /**
     * startNextWave - Start the next wave
     *
     */
    startNextWave() {
        if (this.statusIndex === 0) {
            debug.warn("The game is already in wave phase.");
            return;
        }
        debug.log("Wave phase.");
        this.statusIndex = 0;
        this.setWaveActions();
        this.scenario.nextWave();
        this.scenario.startWave();
    }


    /**
     * update - Update the scene
     *
     */
    update() {
        if (this.statusIndex === 0) {
            let unitsToSpawn = this.scenario.unitsToSpawn();
            unitsToSpawn.forEach(d => {
                this.game.spawnNewUnit(d.id);
                d.spawned = true;
            });
            let unitsAlive = this.game.unitsAlive();
            if (this.scenario.waveOver && unitsAlive.length === 0) {
                // put the scenario on hold
                this.startBreak();
            }

            // if the game is over
            // victory
            if (this.scenario.isOver && unitsAlive.length === 0) {
                this.game.end(1);
            }
            // defeat
            if (this.game.baseHealth <= 0) {
                this.game.end(0);
            }
        }
    }


    /**
     * resetActions - Turn off the current set of available actions
     *
     */
    resetActions() {
        this.actions.forEach(action => {
            action.deactivate();
        })
    }


    /**
     * setWaveActions - Define the actions available during the wave phase
     *
     */
    setWaveActions() {
        this.resetActions();
        let actionTest = new Action(this, 1, 'click the map', function(data) {
            debug.log(`Click x:${data.x}, y:${data.y}`);
        }, ['onClickMap']);
        this.actions = [actionTest];
    }


    /**
     * setBreakActions - Define the actions available during the break phase
     *
     */
    setBreakActions() {
        this.resetActions();
        let actionTest = new Action(this, 1, 'click the map', function(data) {
            debug.log(`Click x:${data.x}, y:${data.y}`);
        }, ['onClickMap']);
        let actionTest2 = new Action(this, 2, 'Finish break', function(data) {
            this.startNextWave();
        }, ['onkeypress-n', 'onkeypress-s']);
        this.actions = [actionTest, actionTest2];
    }
}

module.exports = Scene;
