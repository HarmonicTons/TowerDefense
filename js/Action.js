const PubSub = require('pubsub-js');

class Action {
    constructor(scene, id, name, description, operation, triggersEvent) {
        this.scene = scene;
        this.name = name;
        this.id = id;
        this.description = description;
        let doOperation = (eventName, eventData) => operation.call(scene, eventData);
        this.triggers = triggersEvent.map(triggerEvent => PubSub.subscribe(triggerEvent, doOperation));
    }

    deactivate() {
        this.triggers.forEach(trigger => PubSub.unsubscribe(trigger));
    }
}

module.exports = Action;
