class Updater {
    constructor(game) {
        this.game = game;

        this.upsTimer = new Timer();
        this.ups = 0;
        this.updates = 0;
        this.lastUpdateDuration = [];
        this.stoped = false;
    }


    /**
     * stop - Stop the updater
     *
     */
    stop() {
        console.log("Stoping update.");
        this.stoped = true;
    }


    /**
     * update - Update the game
     *          
     */
    update() {
        if (this.stoped) return;
        this.updates++;
        let dt = this.upsTimer.reset();
        if (this.updates % 100 === 0) {
            let avg_dt = this.lastUpdateDuration.reduce((s, dt) => s + dt, 0) / this.lastUpdateDuration.length;
            this.ups = 1000 / avg_dt;
            this.lastUpdateDuration = [];
        } else {
            this.lastUpdateDuration.push(dt);
        }

        let map = this.game.map;
        let scenario = this.game.scenario;

        // update all the things
        let timestamp = this.game.globalTimer.now;
        //move units
        let units = map.units;
        let unitsAlive = [];
        units.forEach(unit => {
            if (!unit.isAlive) return;

            unitsAlive.push(unit);
            let startPoint = map.unitPath[unit.pathIndex];
            let endPoint = map.unitPath[unit.pathIndex + 1];
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

                if (unit.pathIndex >= map.unitPath.length - 1) {
                    console.log("BOOM!");
                    this.game.baseHealth--;
                    unit.kill();
                }
            }
        });

        //tower fires
        let towers = map.towers;
        towers.forEach(tower => {
            // cooldown
            if (tower.timer.now < 1000/tower.fireRate) return;

            let closestUnit = {
                distance: map.width + map.height
            }
            for (let i = 0; i < map.units.length; i++) {
                let unit = map.units[i];
                if (!unit.isAlive) continue;
                let distance = Map.distance(tower, unit);
                if (distance < closestUnit.distance && distance < tower.range) {
                    closestUnit = {
                        unit: unit,
                        distance: distance
                    }
                }
            }

            // if there is an unit in range
            if (closestUnit.unit) {
                // attack unit
                closestUnit.unit.takeDamage(tower.damages);
                // reset cooldown
                tower.timer.reset();
            }


        });

        //spawn new units
        if (!scenario.isPaused) {
            let unitsBook = this.game.unitsBook;
            let unitsToSpawn = scenario.unitsToSpawn(timestamp);
            let spawnPoint = map.unitPath[0];
            unitsToSpawn.forEach(d => {
                let unitData = unitsBook.units.find(u => u.id === d.id);
                let unit = new Unit(d.id, spawnPoint.x, spawnPoint.y, unitData.speed, unitData.hp, 0);
                map.units.push(unit);
                d.spawned = true;
            });

            //if the wave is over
            if (scenario.waveOver && unitsAlive.length === 0) {
                // put on the scenario on hold
                scenario.pause();
                // prepare next wave
                scenario.nextWave();
                console.log("You have some time to improve your base.");
                setTimeout(() => {

                    // add a tower
                    let towerData = this.game.towersBook.towers[2];
                    let tower = new Tower(towerData.id, 11, 3, towerData.fireRate, towerData.damages, towerData.range);
                    this.game.map.towers.push(tower);


                    scenario.startWave();
                },5000);
            }

            // if the game is over
            // victory
            if (scenario.isOver && unitsAlive.length === 0) {
                this.game.end(1);
            }
            // defeat
            if (this.game.baseHealth <= 0) {
                this.game.end(0);
            }
        }

        // do next update
        // FIXME the loop period needs to become dynamic if the methode update() is longer than 5ms
        setTimeout(() => {
            this.update();
        }, 5);
    }
}
