class Game {
    constructor(canvas, mapFile, scenarioFile) {
        this.canvas = canvas;
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.scenario = new Scenario(this);
        this.inputListener = new InputListener(this, canvas);
        this.renderer.setView(600, 400);

        this.globalTimer = new Timer();

        this.upsTimer = new Timer();
        this.ups = 0;
        this.updates = 0;
        this.lastUpdateDuration = [];

        Promise.all([
            this.loadScenario(scenarioFile),
            this.loadMap(mapFile)
        ]).then(() => {
            this.renderer.render();
            this.update();
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
        this.updates++;
        let dt = this.upsTimer.reset();
        if (this.updates % 100 === 0) {
            let avg_dt = this.lastUpdateDuration.reduce((s, dt) => s + dt, 0) / this.lastUpdateDuration.length;
            this.ups = 1000 / avg_dt;
            this.lastUpdateDuration = [];
        } else {
            this.lastUpdateDuration.push(dt);
        }

        // update all the things
        let timestamp = this.globalTimer.now;
        //move units
        let units = this.map.units;
        units.forEach(unit => {
            if (!unit.isAlive) return;
            let startPoint = this.map.unitPath[unit.pathIndex];
            let endPoint = this.map.unitPath[unit.pathIndex + 1];
            let currentPath = [startPoint, endPoint];
            let dx = endPoint.x - startPoint.x;
            let dy = endPoint.y - startPoint.y;
            let pathLength = Math.sqrt(dx * dx + dy * dy);

            let distanceToTravel = dt / 1000 * unit.speed;

            unit.x += dx / pathLength * distanceToTravel;
            unit.y += dy / pathLength * distanceToTravel;


            if (((dx >= 0 && unit.x >= endPoint.x) || (dx < 0 && unit.x <= endPoint.x)) &&
                ((dy >= 0 && unit.y >= endPoint.y) || (dy < 0 && unit.y <= endPoint.y))) {
                unit.x = endPoint.x;
                unit.y = endPoint.y;
                unit.pathIndex++;

                if (unit.pathIndex >= this.map.unitPath.length - 1) {
                    console.log("BOOM!");
                    unit.hp = 0;
                }
            }
        });
        //spawn new units
        let unitsToSpawn = this.scenario.unitsToSpawn(timestamp);
        let spawnPoint = this.map.unitPath[0];
        unitsToSpawn.forEach(u => {
            let unit = new Unit(u.id, spawnPoint.x, spawnPoint.y, u.speed, u.hp, 0);
            this.map.units.push(unit);
            u.spawned = true;
        });

        // do next update
        setTimeout(() => {
            this.update();
        }, 5);
    }

    /**
     * Switch wether or not the monitoring is displayed
     */
    switchMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }
}
