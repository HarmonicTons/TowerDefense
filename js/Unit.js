class Unit {
    constructor (id, x, y, speed, hp, pathIndex) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hp = hp;
        this.maxHp = hp;
        this.pathIndex = pathIndex;
    }

    get isAlive() {
        return this.hp > 0;
    }


    /**
     * @static loadUnitsFile - Load a units book
     *
     * @param  {string} unitsFile path to the json file
     * @return {Promise}         state promise
     */
    static loadUnitsFile(unitsFile) {
        return Unit.openUnitsFile(unitsFile)
            .catch(error => {
                console.error(error);
                return Promise.reject(`Couldn't open the units file ${unitsFile}.`);
            });
    }

    /**
     * Open a units file
     * 
     * @param {string} unitsFile path to the file
     * @return {Promise}         promise of the units data
     */
    // this is a mimick for local tests only to avoid cross-origin protections
    static openUnitsFile(unitsFile) {
        let unitsFileName = unitsFile.split('/').slice(-1)[0];
        let unitsBook = unitsBooks.find(m => m.file === unitsFileName);
        if (!unitsBook) return Promise.reject("No such file.");
        return Promise.resolve(unitsBook);
    }

    /*
    openUnitsFile(unitsFile) {
        return helpers.loadJSON(unitsFile);
    }
    */

    takeDamage(damages) {
        this.hp -= damages;
        if (this.hp <= 0) {
            this.die();
        }
    }


    /**
     * kill - Kill the unit
     *
     */
    kill() {
        this.hp = 0;
    }


    /**
     * die - Fire the unit death animation
     *
     */
    die() {
        //console.log("oh no");
    }
}
