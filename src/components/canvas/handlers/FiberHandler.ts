import {fabric} from 'fabric';
import CustomHandler from './CustomHandler';

class FiberHandler extends CustomHandler {
    protected initialize() {
        this.handler.canvas.on('mouse:down', this.mousedown);
    }

    private mousedown(opt: fabric.IEvent) {
        const {subTargets} = opt;
        if (subTargets?.length) {
            const target = subTargets[0];
            if (target.type === 'container') {
            } else if (target.type === 'coreContainer') {
            }
        }
    }

    public destroy = () => {
        this.handler.canvas.off('mouse:down', this.mousedown);
    }
}

export default FiberHandler;
