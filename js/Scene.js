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
        this.addAction('click the map', function(eventName, data) {
            debug.log(`Click x:${data.x}, y:${data.y}`);
        }, ['onClickMap']);
    }


    /**
     * setBreakActions - Define the actions available during the break phase
     *
     */
    setBreakActions() {
        this.resetActions();

        // Click on the map
        this.addAction('click the map', function(eventName, data) {
            debug.log(`Click x:${data.x}, y:${data.y}`);

            // if there is a tower to place
            if (this.towerToPlace) {
                // place the tower
                let tower = this.game.addTower(this.towerToPlace, data.x, data.y);
                this.game.select(tower);
                // indicate that there is no more a tower to place
                delete this.towerToPlace;
            }
        }, ['onClickMap']);

        // Click a tower
        this.addAction('click a tower', function(eventName, data) {
            // if there is a tower to place
            if (this.towerToPlace) {
                debug.warn(`You cannot place a tower on another tower.`);
            } else {
                this.game.select(data);
            }
        }, ['onClickTower']);

        // Finish the break
        this.addAction('Finish break', function(eventName, data) {
            this.startNextWave();
        }, ['onkeypress-n', 'onkeypress-s']);

        // Select a tower to place
        this.addAction('Select tower to place', function(eventName, data) {
            debug.log("Selected tower: " + data);
            this.towerToPlace = +data;
        }, ['onkeypress-1', 'onkeypress-2', 'onkeypress-3']);

        // Select a tower to place
        this.addAction('stop placing a tower to place', function(eventName, data) {
            delete this.towerToPlace;
        }, ['onkeypress-Escape']);
    }


    /**
     * addAction - Add an action
     *
     * @param  {string} name        Action's name
     * @param  {function} operation Action's operation
     * @param  {string[]} triggers  Action's triggers
     * @return {Action}             Action added
     */
    addAction(name, operation, triggers) {
        let action = new Action(this, name, operation, triggers);
        this.actions.push(action);
        return action;
    }


    /**
     * removeAction - Remove an action if it exists currently
     *
     * @param  {string} name Name of the action to remove       
     */
    removeAction(name) {
        let actionsToRemove = this.actions.filter(a => a.name === name);
        actionsToRemove.forEach(a => {
            a.deactivate();
            this.actions.splice(this.actions.indexOf(a));
        });
    }
}

module.exports = Scene;
