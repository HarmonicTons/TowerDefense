class Timer {
    constructor() {
        this._startAt = Date.now();
    }

    get now() {
        let current = Date.now();
        return current - this._startAt;
    }

    /**
     * Return the timer value in a string "00:00'000"
     * @return {string} timer string
     */
    get timeString() {
        let time = this.now;
        let timeMin = ('00' + Math.floor(time / 1000 / 60)).slice(-2);
        let timeSec = ('00' + Math.floor((time - timeMin) / 1000)).slice(-2);
        let timeMs = ('000' + (time - timeMin - timeSec)).slice(-3);
        return `${timeMin}:${timeSec}'${timeMs}`;
    }

    /**
     * Reset the timer
     * @return {number} lifetime of the the timer before the reset
     */
    reset() {
        let lastStart = this._startAt;
        this._startAt = Date.now();
        return this._startAt - lastStart;
    }
}
