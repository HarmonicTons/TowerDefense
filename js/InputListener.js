const debug = require('./debug.js');
const PubSub = require('pubsub-js');

class InputListener {
    constructor(game, elem) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            debug.log('Key pressed: ' + e.key);
            if (e.key === 'm') {
                this.game.switchMonitoring();
            }

            PubSub.publish('onkeypress-' + e.key);
        }

        elem.onclick = (e) => {
            this.game.mapClick(e.layerX, e.layerY);
        }

        elem.onmousemove = (e) => {
            this.game.setMouseCoordinates(e.layerX, e.layerY);
        }
    }
}

module.exports = InputListener;
