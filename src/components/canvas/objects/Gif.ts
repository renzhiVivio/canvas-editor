import {fabric} from 'fabric';
import 'gifler';
import {FabricElement, toObject} from "./helper";

export interface GifObject extends FabricElement {
    src?: string;
    setSrc: (src: string) => void;
}

const Gif = fabric.util.createClass(fabric.Object, {
    type: 'gif',
    superType: 'image',
    gifCanvas: null,
    isStarted: false,
    initialize(options: any) {
        options = options || {};
        this.setSrc(options.src);
        this.callSuper('initialize', options);
        this.gifCanvas = document.createElement('canvas');
    },
    setSrc(src: string) {
        this.set({
            src,
        });
    },
    drawFrame(ctx: CanvasRenderingContext2D, frame: any) {
        // update canvas that we are using for fabric.js
        ctx.drawImage(frame.buffer, -this.width / 2, -this.height / 2, this.width, this.height);
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            src: this.get('src'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.isStarted) {
            this.isStarted = true;
            window
                // @ts-ignore
                .gifler(this.src)
                .frames(this.gifCanvas, (_c: CanvasRenderingContext2D, frame: any) => {
                    this.isStarted = true;
                    this.drawFrame(ctx, frame);
                });
        }
    },
});

Gif.fromObject = (options: GifObject, callback: (obj: GifObject) => any) => {
    return callback(new Gif(options));
};

// @ts-ignore
window.fabric.Gif = Gif;

export default Gif;
