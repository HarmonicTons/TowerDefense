class Renderer {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // disallow image smoothing
        this.context.imageSmoothingEnabled = false;

        this.tiles = [];

        this.view = new View(this, canvas);
    }

    render() {
        let map = this.game.map;

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
        requestAnimationFrame(() => {
            this.render();
        });
    }

    setView(width, height) {
        this.view.width = width;
        this.view.height = height;
    }

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
