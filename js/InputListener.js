const debug = require('./debug.js');
const PubSub = require('pubsub-js');

class InputListener {
    constructor(game, elem) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            debug.log('Key pressed: ' + e.key);
            if (e.key === 'm') {
                this.game.toggleMonitoring();
            }
            if (e.key === 'r') {
                this.game.toggleTowersRangeDisplay();
            }

            PubSub.publish('onkeypress-' + e.key, e.key);
        }


        window.onkeyup = e => {
            // escape is not detected by on onkeypress event
            if (e.key === 'Escape') {
                PubSub.publish('onkeypress-Escape', 'Escape');
            }
        }

        elem.onclick = (e) => {
            this.game.mapClick(e.offsetX, e.offsetY);
        }

        elem.onmousemove = (e) => {
            this.game.setMouseCoordinates(e.offsetX, e.offsetY);
        }

    }
}

module.exports = InputListener;
