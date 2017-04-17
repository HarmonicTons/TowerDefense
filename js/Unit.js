class Unit {
    constructor (id, x, y, speed, hp, pathIndex) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hp = hp;
        this.pathIndex = pathIndex;
    }

    get isAlive() {
        return this.hp > 0;
    }
}
