/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);

class Timer {
    constructor() {
        this._startAt = Date.now();
        this._pauses = [];
    }


    /**
     * get now - current time in ms
     *
     * @return {number}  time in ms
     */
    get now() {
        let current = Date.now();
        let pausesDuration = this._pauses.reduce((d,p) => d + (p.endAt || Date.now()) - p.startAt, 0);
        return current - this._startAt - pausesDuration;
    }


    /**
     * get isPaused - Indicate if the timer is currently paused
     *
     * @return {boolean}  true if the timer is paused
     */
    get isPaused() {
        return this._pauses.length > 0 && typeof this._pauses.slice(-1)[0].endAt === 'undefined';
    }

    /**
     * pause - Pause the timer until .continue() is used
     *
     * @return {number}  time in ms before pause start
     */
    pause() {
        if (this.isPaused) {
            debug.warn('The current timer is already paused.');
            return this.now;
        }
        this._pauses.push({
            startAt: Date.now()
        });
        return this.now;
    }


    /**
     * continue - Continue the timer that was paused with .pause()
     *
     * @return {number}  time after the continue
     */
    continue() {
        if (!this.isPaused) {
            debug.warn('The current timer is not paused.');
            return this.now;
        }
        this._pauses.slice(-1)[0].endAt = Date.now();
        return this.now;
    }

    /**
     * Return the timer value in a string "00:00'000"
     * @return {string} timer string
     */
    get timeString() {
        let time = this.now;
        let timeMin = ('00' + Math.floor(time / 1000 / 60)).slice(-2);
        let timeSec = ('00' + Math.floor((time - timeMin) / 1000)).slice(-2);
        let timeMs = ('000' + (time - timeMin - timeSec)).slice(-3);
        return `${timeMin}:${timeSec}'${timeMs}`;
    }

    /**
     * Reset the timer
     * @return {number} lifetime of the the timer before the reset
     */
    reset() {
        let lastStart = this._startAt;
        this._startAt = Date.now();
        this._pauses = [];
        return this._startAt - lastStart;
    }
}

module.exports = Timer;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
    loadJSON: function(filePath) {
        return new Promise(function(resolve, reject) {
            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/jsonp");
            xobj.open('GET', filePath, true);
            xobj.onreadystatechange = function() {
                if (xobj.status === 200) {
                    if (xobj.readyState === 4) {
                        let data = JSON.parse(xobj.responseText);
                        resolve(data);
                    }
                } else {
                    reject({
                        'error': xobj.status
                    });
                }
            };
            xobj.send(null);
        });
    }
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const helpers = __webpack_require__(1);
const debug = __webpack_require__(4);

class Map {
    constructor(game, mapFile) {
        this.game = game;
        this.units = [];
        this.towers = [];
    }

    /**
     * Open a map file and set the map data
     * @param {string} mapFile path to the file
     * @return {Promise} state promise
     */
    loadMapFile(mapFile) {
        return this.openMapFile(mapFile)
            .catch(error => {
                debug.error(error);
                return Promise.reject(`Couldn't open the scenario file ${scenarioFile}.`);
            })
            .then(mapData => {
                this.setMapData(mapData);
            });
    }

    /**
     * Open a map file
     * @param {string} mapFile path to the file
     * @return {Promise} promise of the map data
     */
    openMapFile(mapFile) {
        return helpers.loadJSON(mapFile);
    }

    /**
     * Set the map data
     * @param {object} mapData map data
     */
    setMapData(mapData) {
        this.name = mapData.name;
        this.width = mapData.width;
        this.height = mapData.height;
        this.data = mapData.data;
        this.tiles = mapData.tiles;
        this.unitPath = mapData.unitPath;
    }

    /**
     * Get the map index of the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @return {number} map index
     */
    indexAt(x, y) {
        return x + y * this.width;
    }

    /**
     * Get the tile id at the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @return {number} tile id
     */
    tileAt(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
        let index = this.indexAt(x, y);
        return this.data[index];
    }


    /**
     * @static distance - Distance between two points
     *
     * @param  {object} u1 point 1
     * @param  {object} u2 point 2
     * @return {number}    distance
     */
    static distance(u1, u2) {
        return Math.sqrt((u1.x - u2.x) * (u1.x - u2.x) + (u1.y - u2.y) * (u1.y - u2.y));
    }
}

module.exports = Map;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Mouse = __webpack_require__(7);
const Renderer = __webpack_require__(8);
const Map = __webpack_require__(2);
const Updater = __webpack_require__(13);
const Scene = __webpack_require__(10);
const InputListener = __webpack_require__(6);
const Timer = __webpack_require__(0);
const Unit = __webpack_require__(12);
const Tower = __webpack_require__(11);

class Game {
    constructor(canvas, mapFile, scenarioFile, unitsFile, towersFile) {
        this.canvas = canvas;
        this.mouse = new Mouse(this);
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.updater = new Updater(this);
        this.scene = new Scene(this);
        this.inputListener = new InputListener(this, canvas);
        this.renderer.setView(576, 384);
        this.unitsBook = {};
        this.towersBook = {};

        this.globalTimer = new Timer();

        Promise.all([
            this.loadUnitsBook(unitsFile),
            this.loadTowersBook(towersFile)
        ]).then(() => Promise.all([
            this.loadTowers(),
            this.loadScenarioFile(scenarioFile),
            this.loadMap(mapFile)
        ])).then(() => {

            this.addTower(2,5,5);

            // start the motor
            this.renderer.render();
            this.updater.update();

            // start the scene
            this.scene.start();
        });
    }

    loadScenarioFile(scenarioFile) {
        return this.scene.loadScenario(scenarioFile)
            .then(() => this.renderer.loadScenarioUnits());
    }

    /**
     * loadUnitsBook - Load the units book
     *
     * @param  {type} unitsFile path to json file
     * @return {Promise} state promise, resolved when the units book is loaded
     */
    loadUnitsBook(unitsFile) {
        return Unit.loadUnitsFile(unitsFile).then(unitsBook => {
            this.unitsBook = unitsBook;
        });
    }


    /**
     * loadTowersBook - Load the towers book
     *
     * @param  {type} towersFile path to the json file
     * @return {Promise} state promise, resolved when the towers book is loaded
     */
    loadTowersBook(towersFile) {
        return Tower.loadTowersFile(towersFile).then(towersBook => {
            this.towersBook = towersBook;
        });
    }


    /**
     * spawnNewUnit - Spawn an unit on the map at the spawn point
     *
     * @param  {number} id unit id
     */
    spawnNewUnit(id) {
        let spawnPoint = this.map.unitPath[0];
        this.addUnit(id, spawnPoint.x, spawnPoint.y);
    }

    addUnit(id, x, y) {
        let unitData = this.unitsBook.units.find(u => u.id === id);
        let unit = new Unit(id, x, y, unitData.speed, unitData.hp, 0);
        this.map.units.push(unit);
    }

    addTower(id, x, y) {
        let towerData = this.towersBook.towers.find(t => t.id === id);
        let tower = new Tower(id, x, y, towerData.fireRate, towerData.damages, towerData.range);
        this.map.towers.push(tower);
    }

    unitsAlive() {
        return this.map.units.filter(u => u.isAlive);
    }


    /**
     * loadTowers - Load the tower sprites
     *
     * @return {Promise} state promise, resolved when the towers sprites are loaded
     */
    loadTowers() {
        return this.renderer.loadTowers();
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
     * setMouseCoordinates - Set mouse position
     *
     * @param  {number} x
     * @param  {number} y
     */
    setMouseCoordinates(x, y) {
        this.mouse.screenCoordinates.x = x;
        this.mouse.screenCoordinates.y = y;
    }

    gridCoordinates(x,y) {
        return this.renderer.gridCoordinates(x,y);
    }


    /**
     * end - End the game
     *
     * @param  {boolean} isVictory true if the player won
     */
    end(isVictory) {
        if (isVictory) {
            debug.log("YOU WON");
        } else {
            debug.log("GAMEOVER");
        }

        //this.renderer.stop();
        this.updater.stop();
    }


    endBreak() {
        this.scene.startNextWave();
    }

    /**
     * Switch wether or not the monitoring is displayed
     */
    switchMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }
}

module.exports = Game;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = {
    get time() {
        let currentDate = new Date();
        let yea = currentDate.getFullYear();
        let mon = currentDate.getMonth();
        let day = currentDate.getDay();
        let hou = currentDate.getHours();
        let min = currentDate.getMinutes();
        let sec = currentDate.getSeconds();
        let mil = currentDate.getMilliseconds();

        return `${yea}/${mon}/${day} ${hou}:${min}:${sec}:${mil}`;
    },

    log: function(msg) {
        console.log(`%c[${this.time}] %c${msg}`, "color: #AAA", "color: #111");
    },

    warn: function(msg) {
        console.warn(`[${this.time}] ${msg}`);
    },

    error: function(msg) {
        console.error(`[${this.time}] ${msg}`);
    }
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(3);
const debug = __webpack_require__(4);

document.addEventListener('DOMContentLoaded', main, false);

function main() {
    debug.log("TOWER DEFENSE");

    let canvas = document.getElementById("viewCanvas");
    let mapFile = './maps/map01.json';
    let scenarioFile = './scenarii/scen01.json';
    let unitsFile = './units/units01.json';
    let towersFile = './towers/towers01.json';

    let game = new Game(canvas, mapFile, scenarioFile, unitsFile, towersFile);
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);

class InputListener {
    constructor(game, elem) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            debug.log('Key pressed: ' + e.key);
            if (e.key === 'm') {
                this.game.switchMonitoring();
            }

            else if (e.key === 'n') {
                this.game.endBreak();
            }
        }

        elem.onclick = () => {
            //
        }

        elem.onmousemove = (e) => {
            this.game.setMouseCoordinates(e.layerX, e.layerY);
        }
    }
}

module.exports = InputListener;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

class Mouse {
    constructor(game) {
        this.game = game;

        this.screenCoordinates = {
            x: 0,
            y: 0
        }
    }

    get gridCoordinates() {
        let sc = this.screenCoordinates;
        let preciseGridCoordinates = this.game.gridCoordinates(sc.x, sc.y);
        let fx = Math.floor(preciseGridCoordinates.x);
        let fy = Math.floor(preciseGridCoordinates.y);
        return {
            x: fx,
            y: fy
        };
    }
}

module.exports = Mouse;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Timer = __webpack_require__(0);
const View = __webpack_require__(14);

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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Timer = __webpack_require__(0);
const helpers = __webpack_require__(1);

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


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Scenario = __webpack_require__(9);

class Scene {
    constructor(game) {
        this.game = game;
        this.scenario = new Scenario(this);
        this._statusNames = ["in wave", "in break"];
        this.statusIndex = 0;
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
        if (this.statusIndex === 1 ) {
            debug.warn("The game is already in break phase.");
            return;
        }
        debug.log("Break phase.");
        this.statusIndex = 1;
    }

    startNextWave() {
        if (this.statusIndex === 0 ) {
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
}

module.exports = Scene;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Timer = __webpack_require__(0);
const helpers = __webpack_require__(1);

class Tower {
    constructor(id, x, y, fireRate, damages, range) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.fireRate = fireRate;
        this.damages = damages;
        this.range = range;
        this.timer = new Timer();
    }

    static loadTowersFile(towersFile) {
        return Tower.openTowersFile(towersFile)
            .catch(error => {
                debug.error(error);
                return Promise.reject(`Couldn't open the units file ${towersFile}.`);
            });
    }

    /**
     * Open a units file
     * @param {string} towersFile path to the file
     * @return {Promise} promise of the units data
     */
    static openTowersFile(towersFile) {
        return helpers.loadJSON(towersFile);
    }
}

module.exports = Tower;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const helpers = __webpack_require__(1);

class Unit {
    constructor (id, x, y, speed, hp, pathIndex) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hp = hp;
        this.maxHp = hp;
        this.pathIndex = pathIndex;
    }

    get isAlive() {
        return this.hp > 0;
    }


    /**
     * @static loadUnitsFile - Load a units book
     *
     * @param  {string} unitsFile path to the json file
     * @return {Promise}         state promise
     */
    static loadUnitsFile(unitsFile) {
        return Unit.openUnitsFile(unitsFile)
            .catch(error => {
                debug.error(error);
                return Promise.reject(`Couldn't open the units file ${unitsFile}.`);
            });
    }

    /**
     * Open a units file
     *
     * @param {string} unitsFile path to the file
     * @return {Promise}         promise of the units data
     */
    static openUnitsFile(unitsFile) {
        return helpers.loadJSON(unitsFile);
    }

    takeDamage(damages) {
        this.hp -= damages;
        if (this.hp <= 0) {
            this.die();
        }
    }


    /**
     * kill - Kill the unit
     *
     */
    kill() {
        this.hp = 0;
    }


    /**
     * die - Fire the unit death animation
     *
     */
    die() {
        //debug.log("oh no");
    }
}

module.exports = Unit;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(4);
const Timer = __webpack_require__(0);
const Map = __webpack_require__(2);

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


/***/ }),
/* 14 */
/***/ (function(module, exports) {

class View {
    constructor(renderer, canvas, x = 0, y = 0, zoom = 1) {
        this.renderer = renderer;
        this.canvas = canvas;
        this.cameraPosition = {
            x: x,
            y: y
        };
        this.zoom = zoom;

        this.defaultTileSize = 32;
    }

    get width() {
        return this.canvas.width;
    }
    set width(w) {
        this.canvas.width = w;
    }

    get height() {
        return this.canvas.height;
    }
    set height(h) {
        this.canvas.height = h;
    }

    get tileSize() {
        return this.defaultTileSize * this.zoom;
    }

    /**
     * Get the screen coordinates from the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @return {object}  screen coordinates
     */
    screenCoordinates(x, y) {
        return {
            x: (x - this.cameraPosition.x) * this.tileSize,
            y: (y - this.cameraPosition.y) * this.tileSize,
        }
    }

    /**
     * gridCoordinates - Get the grid coordinates from the screen coordinates
     *
     * @param  {number} x horizontal screen coordinates
     * @param  {number} y vertical screen coordinates
     * @return {object}   grid coordinates
     */
    gridCoordinates(x, y) {
        return {
            x: x / this.tileSize + this.cameraPosition.x,
            y: y / this.tileSize + this.cameraPosition.y,
        }
    }
}

module.exports = View;


/***/ })
/******/ ]);