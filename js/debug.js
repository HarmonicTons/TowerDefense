module.exports = {
    get time() {
        let currentDate = new Date();
        let yea = currentDate.getFullYear();
        let mon = currentDate.getMonth();
        let day = currentDate.getDay();
        let hou = currentDate.getHours();
        let min = currentDate.getMinutes();
        let sec = currentDate.getSeconds();
        let mil = currentDate.getMilliseconds();

        return `${yea}/${mon}/${day} ${hou}:${min}:${sec}:${mil}`;
    },

    log: function(msg) {
        console.log(`%c[${this.time}] %c${msg}`, "color: #AAA", "color: #111");
    },

    warn: function(msg) {
        console.warn(`[${this.time}] ${msg}`);
    },

    error: function(msg) {
        console.error(`[${this.time}] ${msg}`);
    }
}
