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

    screenCoordinates(x,y) {
        return {
            x: (x - this.cameraPosition.x) * this.tileSize,
            y: (y - this.cameraPosition.y) * this.tileSize,
        }
    }
}
