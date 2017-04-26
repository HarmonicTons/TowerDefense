class InputListener {
    constructor(game, elem) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            console.log('Key pressed: ' + e.key);
            if (e.key === 'm') {
                this.game.switchMonitoring();
            }

            else if (e.key === 'n') {
                this.game.endBreak();
            }
        }

        elem.onclick = () => {
            //
        }

        elem.onmousemove = (e) => {
            this.game.setMouseCoordinates(e.layerX, e.layerY);
        }
    }
}

module.exports = InputListener;
