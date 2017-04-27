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
    }

    get status() {
        return this._statusNames[this.statusIndex];
    }

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

    startBreak() {
        if (this.statusIndex === 1) {
            debug.warn("The game is already in break phase.");
            return;
        }
        debug.log("Break phase.");
        this.statusIndex = 1;

        this.setBreakActions();
    }

    startNextWave() {
        if (this.statusIndex === 0) {
            debug.warn("The game is already in wave phase.");
            return;
        }
        debug.log("Wave phase.");
        this.statusIndex = 0;
        this.scenario.nextWave();
        this.scenario.startWave();
    }

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

    setBreakActions() {
        let actionTest = new Action(
            this,
            1,
            'click the map',
            "log a msg when the player click on the map",
            function(data) {
                debug.log("you clicked on the map");
                debug.log(JSON.stringify(data));
            }, ['onClickMap']);
        this.actions = [actionTest];
    }
}

module.exports = Scene;
