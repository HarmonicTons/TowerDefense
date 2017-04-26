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
}
