class InputListener {
    constructor(game, elem) {
        this.game = game;
        this.elem = elem;

        window.onkeypress = e => {
            if (e.key === 'm') {
                this.game.switchMonitoring();
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
