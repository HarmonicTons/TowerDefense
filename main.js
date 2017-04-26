document.addEventListener('DOMContentLoaded', main, false);


let graphisms = [
    {
        name: 'Grass32',
        filePath: './images/tiles/grass.png'
    }
];

function main() {
    console.log("main");

    let canvas = document.getElementById("viewCanvas");
    let mapFile = './maps/map01.json';

    let game = new Game(canvas, mapFile);

}
