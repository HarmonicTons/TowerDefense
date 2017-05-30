const Game = require('./js/Game.js');
const debug = require('./js/debug.js');
const socket = io();



// get url params
let params = {};
location.search.slice(1).split("&").map(o => {
    let [a, b] = o.split("=");
    params[a] = b;
});

if (!params.id) {
    throw 'Game must have an ID.';
}

// log into the game
socket.emit('new user', {
    game: params.id,
    name: 'fire'
});

// when someone else logs in
socket.on('new user', d => {
    console.log("New User: " + d.name)
})




document.addEventListener('DOMContentLoaded', main, false);

function main() {
    debug.log("TOWER DEFENSE");

    let canvas = document.getElementById("viewCanvas");
    let mapFile = '/maps/map01.json';
    let scenarioFile = '/scenarii/scen03.json';
    let unitsFile = '/units/units01.json';
    let towersFile = '/towers/towers01.json';

    let game = new Game(canvas, mapFile, scenarioFile, unitsFile, towersFile);
}
