import {fabric} from 'fabric';
import {FabricElement, toObject} from "./helper";

export interface IframeObject extends FabricElement {
    setSource: (source: string) => void;
    setSrc: (src: string) => void;
    src: string;
    iframeElement: HTMLIFrameElement;
}

const Iframe = fabric.util.createClass(fabric.Rect, {
    type: 'iframe',
    superType: 'element',
    initialize(src: string = '', options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        this.set({
            src,
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(255, 255, 255, 0)',
        });
        this.setControlsVisibility({mtr: false});
    },
    setSource(source: any) {
        this.setSrc(source);
    },
    setSrc(src: string) {
        this.set({
            src,
        });
        this.iframeElement.src = src.replace("wathch?v=", "v/");
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            src: this.get('src'),
            container: this.get('container'),
            editable: this.get('editable'),
        });
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const {id, scaleX, scaleY, width, height, angle, src} = this;
            const zoom = this.canvas.getZoom();
            this.setCoords();
            const left = this.aCoords.tl.x;
            const top = this.aCoords.tl.y;
            const padLeft = (width * scaleX * zoom - width) / 2;
            const padTop = (height * scaleY * zoom - height) / 2;
            this.iframeElement = fabric.util.makeElement('iframe', {
                id,
                src,
                width: '100%',
                height: '100%',
                target: '_parent'
            });
            this.element = fabric.util.wrapElement(this.iframeElement, 'div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left + padLeft}px;
                        top: ${top + padTop}px;
                        position: absolute;`,
            }) as HTMLDivElement;
            const container = document.getElementById(this.container);
            container?.appendChild(this.element);
        }
    },
});

Iframe.fromObject = (options: IframeObject, callback: (obj: IframeObject) => any) => {
    return callback(new Iframe(options.src, options));
};

// @ts-ignore
window.fabric.Iframe = Iframe;

export default Iframe;
