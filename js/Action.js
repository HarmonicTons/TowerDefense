class Action {
    constructor(id, name, description, operation) {
        this.name = name;
        this.id = id;
        this.description = description;
        this.operation = operation;
    }

    do() {
        return this.operation();
    }
}

module.exports = Action;
