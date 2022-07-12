import {fabric} from 'fabric';
import {FabricElement, FabricObject, toObject} from './helper';

export interface Code {
    svg: string;
}

export interface SvgObject extends FabricElement {
    setSource: (source: Code) => void;
    setCode: (code: Code) => void;
    code: Code;
}

const initialCode: Code = {
    svg: '',
};

const Svg = fabric.util.createClass(fabric.Rect, {
	type: 'svg',
	superType: 'element',
	hasRotatingPoint: false,
	initialize(code = initialCode, options: any) {
		options = options || {};
		this.callSuper('initialize', options);
		this.set({
			code,
			fill: 'rgba(255, 255, 255, 0)',
			stroke: 'rgba(255, 255, 255, 0)',
		});
		this.setControlsVisibility({mtr: false});
	},
	setSource(source: any) {
		this.setCode(source);
	},
	setCode(code = initialCode) {
		this.set({
			code,
		});
		const { id } = this;
		const { svg } = code;
        this.element.innerHTML = svg;
    },
    setFile(file: File) {
        this.set({
            file,
        });
        const reader = new FileReader();
        reader.onload = () => {
            this.setCode(reader.result);
        };
        reader.readAsDataURL(file);
    },
    toObject(propertiesToInclude: string[]) {
        return toObject(this, propertiesToInclude, {
            code: this.get('code'),
            container: this.get('container'),
            editable: this.get('editable'),
        });
    },

    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const {id, scaleX, scaleY, width, height, angle, editable, code} = this;
            const zoom = this.canvas.getZoom();
            this.setCoords();
            const left = this.aCoords.tl.x;
            const top = this.aCoords.tl.y;
            const padLeft = (width * scaleX * zoom - width) / 2;
            const padTop = (height * scaleY * zoom - height) / 2;
            this.element = fabric.util.makeElement('div', {
                id: `${id}_container`,
                style: `transform: rotate(${angle}deg) scale(${scaleX * zoom}, ${scaleY * zoom});
                        width: ${width}px;
                        height: ${height}px;
                        left: ${left + padLeft}px;
                        top: ${top + padTop}px;
                        position: absolute;
                        user-select: ${editable ? 'none' : 'auto'};
                        pointer-events: ${editable ? 'none' : 'auto'};`,
			}) as HTMLDivElement;
			const { svg } = code;

			const container = document.getElementById(this.container);
			container?.appendChild(this.element);
			this.element.innerHTML = svg;
		}
	},
});

Svg.fromObject = (options: SvgObject, callback: (obj: SvgObject) => any) => {
	return callback(new Svg(options.code, options));
};

// @ts-ignore
window.fabric.Svg = Svg;

export default Svg;
