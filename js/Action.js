const PubSub = require('pubsub-js');

class Action {
    constructor(scene, id, name, operation, triggersEvent = []) {
        this.scene = scene;
        this.name = name;
        this.id = id;
        this.operation = operation;
        this.triggersEvent = triggersEvent;

        this.activate();
    }


    /**
     * deactivate - Deactivate the action
     *
     */
    deactivate() {
        this.triggers.forEach(trigger => PubSub.unsubscribe(trigger));
    }


    /**
     * activate - Activate the action
     *        
     */
    activate() {
        let scene = this.scene;
        let doOperation = (eventName, eventData) => this.operation.call(scene, eventData);
        this.triggers = this.triggersEvent.map(triggerEvent => PubSub.subscribe(triggerEvent, doOperation));
    }
}

module.exports = Action;
