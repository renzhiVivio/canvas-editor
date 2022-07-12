import Handler from './Handler';

class CustomHandler {
    handler: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
        this.initialize();
    }

    protected initialize() {
    }
}

export default CustomHandler;