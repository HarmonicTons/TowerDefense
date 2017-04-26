class Map {
    constructor(game, mapFile) {
        this.game = game;

        this.units = [];
    }

    loadMapFile(mapFile) {
        return this.openMapFile(mapFile).then(mapData => {
            this.initMapData(mapData);
        });
    }

    // this is a mimick for local tests only to avoid cross-origin protections
    openMapFile(mapFile) {
        let mapFileName = mapFile.split('/').slice(-1)[0];
        let mapData = maps.find(m => m.file === mapFileName);
        if (!mapData) return Promise.reject("No such file.");
        return Promise.resolve(mapData);
    }

    /*
    openMapFile(mapFile) {
        return helpers.loadJSON(mapFile);
    }
    */

    initMapData(mapData) {
        this.name = mapData.name;
        this.width = mapData.width;
        this.height = mapData.height;
        this.data = mapData.data;
        this.tiles = mapData.tiles;
    }

    indexAt(x, y) {
        return x + y * this.width;
    }

    tileAt(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
        let index = this.indexAt(x, y);
        return this.data[index];
    }
}
