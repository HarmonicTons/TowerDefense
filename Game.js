class Game {
    constructor(canvas, mapFile) {
        this.canvas = canvas;
        this.renderer = new Renderer(this, canvas);
        this.map = new Map(this);
        this.renderer.setView(600,400);

        this.loadMap(mapFile).then(() => {
            this.renderer.render();
        });

    }

    loadMap(mapFile) {
        return this.map.loadMapFile(mapFile).then(() => {
            return this.renderer.loadMapTiles();
        });
    }
}
