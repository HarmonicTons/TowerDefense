class Updater {
    constructor(game) {
        this.game = game;

        this.upsTimer = new Timer();
        this.ups = 0;
        this.updates = 0;
        this.lastUpdateDuration = [];
    }

    update() {
        let map = this.game.map;

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
        let timestamp = this.game.globalTimer.now;
        //move units
        let units = map.units;
        units.forEach(unit => {
            if (!unit.isAlive) return;
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
                    unit.hp = 0;
                }
            }
        });

        //tower fires
        let towers = map.towers;
        towers.forEach(tower => {

            // do the thing

        });


        //spawn new units
        let unitsToSpawn = this.game.scenario.unitsToSpawn(timestamp);
        let spawnPoint = map.unitPath[0];
        unitsToSpawn.forEach(u => {
            let unit = new Unit(u.id, spawnPoint.x, spawnPoint.y, u.speed, u.hp, 0);
            map.units.push(unit);
            u.spawned = true;
        });

        // do next update
        setTimeout(() => {
            this.update();
        }, 5);
    }
}
