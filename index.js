const Game = require('./js/Game.js');
const debug = require('./js/debug.js');

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
