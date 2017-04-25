document.addEventListener('DOMContentLoaded', main, false);

function main() {
    let canvas = document.getElementById("viewCanvas");
    let mapFile = './maps/map01.json';
    let scenarioFile = './scenarii/scen01.json';
    let unitsFile = './units/units01.json';
    let towersFile = './units/towers01.json';

    let game = new Game(canvas, mapFile, scenarioFile, unitsFile, towersFile);
}
