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

    stop() {
        console.log("Stoping render.");
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

        this.context.clearRect(0, 0, this.view.width, this.view.height);

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
        // draw every units on the map
        map.units.forEach(unit => {
            if (!unit.isAlive) return;
            let image = this.units.find(u => u.id === unit.id).image;

            if (!image) return;
            let sc = this.view.screenCoordinates(unit.x, unit.y);
            let ts = this.view.tileSize;
            this.context.drawImage(image, sc.x, sc.y, ts, ts);
        });

        // draw every tower on the map
        map.towers.forEach(tower => {
            let image = this.towers.find(t => t.id === tower.id).image;

            if (!image) return;
            let sc = this.view.screenCoordinates(tower.x, tower.y);
            let ts = this.view.tileSize;
            this.context.drawImage(image, sc.x, sc.y, ts, ts);

            // range display
            this.context.beginPath();
            this.context.arc(sc.x + ts / 2, sc.y + ts / 2, ts * tower.range, 0, 2 * Math.PI);
            this.context.fillStyle= 'rgba(255,0,0,0.1)';
            this.context.fill();
        });

        // draw hp bar
        map.units.forEach(unit => {
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
     * Draw monitoring data
     */
    drawMonitoring() {
        this.context.font = "10px Arial";
        this.context.fillStyle = "black";
        this.context.fillText("Map : " + this.game.map.name, this.view.width - 100, 10, 100);
        this.context.fillText("Time : " + this.game.globalTimer.timeString, this.view.width - 100, 20, 100);
        this.context.fillText("FPS : " + this.fps.toFixed(1), this.view.width - 100, 30, 100);
        this.context.fillText("UPS : " + this.game.updater.ups.toFixed(1), this.view.width - 100, 40, 100);
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

    loadTowers() {
        this.towers = [];
        let towersBook = this.game.towersBook;
        let imagesPaths = towersBook.towers.map(tower => {
            return './images/towers/' + tower.image;
        });

        console.log(`${imagesPaths.length} towers textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.towers.push({
                    id: towersBook.towers[index].id,
                    image: images[index]
                });
            });
        }).then(() => {
            console.log(this.towers)
            console.log(`All units textures have been loaded.`);
        });
    }

    /**
     * Load all the units textures for the current scenario
     * @return {Promise} state promise
     */
    loadScenarioUnits() {
        this.units = [];
        let unitsInScenario = [];
        this.game.scenario.waves.forEach(w => {
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
                console.warn(`Unknown unit: ${id}`)
                return './images/units/default.png';
            }
            return './images/units/' + unitData.image;
        });

        console.log(`${imagesPaths.length} units textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.units.push({
                    id: unitsInScenario[index],
                    image: images[index]
                });
            });
        }).then(() => {
            console.log(`All units textures have been loaded.`);
        });
    }

    /**
     * Load all the tiles textures for the current map
     * @return {Promise} state promise
     */
    loadMapTiles() {
        this.tiles = [];
        let tiles = this.game.map.tiles;
        let imagesPaths = tiles.map(tile => './images/tiles/' + tile.fileName);

        console.log(`${imagesPaths.length} tiles textures to load.`);
        return this.loadImages(imagesPaths).then(images => {
            images.forEach((image, index) => {
                this.tiles.push({
                    id: tiles[index].id,
                    image: images[index]
                });
            });
        }).then(() => {
            console.log(`All tiles textures have been loaded.`);
        });
    }


    /**
     * Load several images
     * @param {string[]} imagesPaths files paths
     * @return {Promise} promise of the images
     */
    loadImages(imagesPaths) {
        return Promise.all(imagesPaths.map(this.loadImage));
    }

    /**
     * Load an image from its file path
     * @param {string} imagePath file path
     * @return {Promise} promise of the image
     */
    loadImage(imagePath) {
        console.log(`Loading ${imagePath}...`);
        let img = new Image();
        img.src = imagePath;

        return new Promise(function(resolve, reject) {
            img.onload = function() {
                console.log(`${imagePath} loaded.`);
                resolve(img);
            };
            img.onerror = function() {
                console.warn(`${imagePath} not found.`);
                resolve();
            }
        });
    }
}
