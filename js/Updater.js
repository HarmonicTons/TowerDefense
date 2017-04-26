const debug = require('./debug.js');
const Timer = require('./Timer.js');
const Map = require('./Map.js');

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
        debug.log("Stoping update.");
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
        let scene = this.game.scene;

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
                    debug.log("BOOM!");
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

        //if the wave is over
        scene.update();

        // do next update
        // FIXME the loop period needs to become dynamic if the methode update() is longer than 5ms
        setTimeout(() => {
            this.update();
        }, 5);
    }
}

module.exports = Updater;
