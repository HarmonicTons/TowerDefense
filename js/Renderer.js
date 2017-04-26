const debug = require('./debug.js');
const Timer = require('./Timer.js');
const View = require('./View.js');

class Renderer {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // disallow image smoothing
        this.context.imageSmoothingEnabled = false;

        this.tiles = [];

        this.view = new View(this, canvas);

        this.displayMonitoring = true;

        this.timer = new Timer();
        this.frames = 0;
        this.fps = 0;

        this.lastFramesDuration = [];
        this.stoped = false;
    }


    /**
     * stop - Stop the renderer
     *
     */
    stop() {
        debug.log("Stoping render.");
        this.stoped = true;
    }

    /**
     * Render the current frame
     */
    render() {
        if (this.stoped) return;
        this.frames++;
        let dt = this.timer.reset();
        if (this.frames % 100 === 0) {
            let avg_dt = this.lastFramesDuration.reduce((s, dt) => s + dt, 0) / this.lastFramesDuration.length;
            this.fps = 1000 / avg_dt;
            this.lastFramesDuration = [];
        } else {
            this.lastFramesDuration.push(dt);
        }

        // clear canvas
        this.context.clearRect(0, 0, this.view.width, this.view.height);

        this.drawTiles();
        this.drawUnits();
        this.drawTowers();
        this.drawHealthBars();
        this.drawMouseCursor();

        // draw monitoring
        if (this.displayMonitoring) {
            this.drawMonitoring();
        }

        // draw next frame
        requestAnimationFrame(() => {
            this.render();
        });
    }


    /**
     * drawMouseThingy - Draw the mouse cursor
     *
     */
    drawMouseCursor() {
        let sc = this.game.mouse.screenCoordinates;
        let gridCoordinates = this.view.gridCoordinates(sc.x, sc.y);
        let fx = Math.floor(gridCoordinates.x);
        let fy = Math.floor(gridCoordinates.y);
        let sc2 = this.view.screenCoordinates(fx, fy);
        let ts = this.view.tileSize;
        this.context.fillStyle = 'rgba(0,0,255,0.1)';
        this.context.fillRect(sc2.x, sc2.y, ts, ts);
    }


    /**
     * drawTiles - Draw every tiles of the map
     *
     */
    drawTiles() {
        let map = this.game.map;
        // draw every tile of the map
        for (let x = 0; x < map.width; x++) {
            for (let y = 0; y < map.height; y++) {
                let tileId = map.tileAt(x, y);
                let image = this.tiles.find(t => t.id === tileId).image;

                if (!image) continue;
                let sc = this.view.screenCoordinates(x, y);
                let ts = this.view.tileSize;
                this.context.drawImage(image, sc.x, sc.y, ts, ts);
            }
        }
    }


    /**
     * drawUnits - Draw every unit on the map
     *
     */
    drawUnits() {
        this.game.map.units.forEach(unit => {
            if (!unit.isAlive) return;
            let image = this.units.find(u => u.id === unit.id).image;

            if (!image) return;
            let sc = this.view.screenCoordinates(unit.x, unit.y);
            let ts = this.view.tileSize;
            this.context.drawImage(image, sc.x, sc.y, ts, ts);
        });
    }


    /**
     * drawHealthBars - Draw the health bars of the units
     *
     */
    drawHealthBars() {
        this.game.map.units.forEach(unit => {
            if (!unit.isAlive) return;

            let sc = this.view.screenCoordinates(unit.x, unit.y);
            let ts = this.view.tileSize;

            let fullBarSize = this.view.tileSize * 3 / 4;
            let barSize = Math.ceil(fullBarSize * unit.hp / unit.maxHp);
            this.context.fillStyle = "black";
            this.context.fillRect(sc.x + ts * 1 / 8, sc.y - ts * 1 / 4, fullBarSize, 5);
            this.context.fillStyle = "red";
            this.context.fillRect(sc.x + ts * 1 / 8, sc.y - ts * 1 / 4, barSize, 5);
        });
    }


    /**
     * drawTowers - Draw every tower on the map
     *
     */
    drawTowers() {
        this.game.map.towers.forEach(tower => {
            let image = this.towers.find(t => t.id === tower.id).image;

            if (!image) return;
            let sc = this.view.screenCoordinates(tower.x, tower.y);
            let ts = this.view.tileSize;
            this.context.drawImage(image, sc.x, sc.y, ts, ts);

            // range display
            this.context.beginPath();
            this.context.arc(sc.x + ts / 2, sc.y + ts / 2, ts * tower.range, 0, 2 * Math.PI);
            this.context.fillStyle = 'rgba(255,0,0,0.1)';
            this.context.fill();
        });
    }

    /**
     * Draw monitoring data
     */
    drawMonitoring() {
        this.context.font = "10px Arial";
        this.context.fillStyle = "black";
        this.context.fillText("Map : " + this.game.map.name, this.view.width - 100, 10, 100);
        this.context.fillText("Time : " + this.game.globalTimer.timeString, this.view.width - 100, 20, 100);
        this.context.fillText("FPS : " + this.fps.toFixed(1), this.view.width - 100, 30, 100);
        this.context.fillText("UPS : " + this.game.updater.ups.toFixed(1), this.view.width - 100, 40, 100);
        this.context.fillText("Mouse : " + this.game.mouse.gridCoordinates.x + "," + this.game.mouse.gridCoordinates.y, this.view.width - 100, 50, 100);
    }

    /**
     * Set a new view
     * @param {number} width
     * @param {number} height
     */
    setView(width, height) {
        this.view.width = width;
        this.view.height = height;
    }

    /**
     * loadTowers - Load the images of the tower present in the tower book
     *
     * @return {Promise} state promise
     */
    loadTowers() {
        this.towers = [];
        let towersBook = this.game.towersBook;
        let imagesPaths = towersBook.towers.map(tower => {
            return './images/towers/' + tower.image;
        });

        debug.log(`${imagesPaths.length} towers textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.towers.push({
                    id: towersBook.towers[index].id,
                    image: images[index]
                });
            });
        }).then(() => {
            debug.log(`All towers textures have been loaded.`);
        });
    }

    /**
     * Load all the units textures for the current scenario
     *
     * @return {Promise} state promise
     */
    loadScenarioUnits() {
        this.units = [];
        let unitsInScenario = [];
        let scene = this.game.scene;
        scene.scenario.waves.forEach(w => {
            w.forEach(d => {
                if (!unitsInScenario.includes(d.id)) {
                    unitsInScenario.push(d.id);
                }
            });
        });
        let unitsBook = this.game.unitsBook;
        let imagesPaths = unitsInScenario.map(id => {
            let unitData = unitsBook.units.find(u => u.id === id);
            if (!unitData) {
                debug.warn(`Unknown unit: ${id}`)
                return './images/units/default.png';
            }
            return './images/units/' + unitData.image;
        });

        debug.log(`${imagesPaths.length} units textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.units.push({
                    id: unitsInScenario[index],
                    image: images[index]
                });
            });
        }).then(() => {
            debug.log(`All units textures have been loaded.`);
        });
    }

    /**
     * Load all the tiles textures for the current map
     *
     * @return {Promise} state promise
     */
    loadMapTiles() {
        this.tiles = [];
        let tiles = this.game.map.tiles;
        let imagesPaths = tiles.map(tile => './images/tiles/' + tile.fileName);

        debug.log(`${imagesPaths.length} tiles textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.tiles.push({
                    id: tiles[index].id,
                    image: images[index]
                });
            });
        }).then(() => {
            debug.log(`All tiles textures have been loaded.`);
        });
    }


    /**
     * Load several images
     *
     * @param {string[]} imagesPaths files paths
     * @return {Promise} promise of the images
     */
    loadImages(imagesPaths) {
        return Promise.all(imagesPaths.map(this.loadImage));
    }

    /**
     * Load an image from its file path
     *
     * @param {string} imagePath file path
     * @return {Promise} promise of the image
     */
    loadImage(imagePath) {
        debug.log(`Loading ${imagePath}...`);
        let img = new Image();
        img.src = imagePath;

        return new Promise(function(resolve, reject) {
            img.onload = function() {
                debug.log(`${imagePath} loaded.`);
                resolve(img);
            };
            img.onerror = function() {
                debug.warn(`${imagePath} not found.`);
                resolve();
            }
        });
    }

    gridCoordinates(x,y) {
        return this.view.gridCoordinates(x,y);
    }
}

module.exports = Renderer;
