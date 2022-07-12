import {fabric} from 'fabric';
import {FabricElement, toObject} from './helper';

export interface Code {
    html: string;
    css: string;
    js: string;
    importJs: string;
    importCss: string;
    active: boolean;
    funName: string;
}

export interface ElementObject extends FabricElement {
    setSource: (source: Code) => void;
    setCode: (code: Code) => void;
    code: Code;
}

const initialCode: Code = {
    html: '',
    css: '',
    js: '',
    importJs: '',
    importCss: '',
    active: false,
    funName: '',
};

const Element = fabric.util.createClass(fabric.Rect, {
	type: 'element',
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
		const { css, js, html, importJs, importCss, active, funName } = code;
		this.importScriptEl.src = importJs;
		this.importStyleEl.href = importCss;
		this.styleEl.innerHTML = css;
		if(active){
			if(funName===''){
				this.scriptEl.innerHTML = `function forceRenderAndRun_${id.replaceAll('-','_')}() { ${js} } setTimeout(()=>{
				 	forceRenderAndRun_${id.replaceAll('-','_')}()
				},window.performance.timing['loaded'])`;
			}else{
				this.scriptEl.innerHTML = `${js}\r\n setTimeout(()=>{
				 	${funName}
				},window.performance.timing.loadEventEnd - window.performance.timing.domLoading)`;
			}
		}else this.scriptEl.innerHTML = js;
        this.element.innerHTML = html;
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
            // const left = this.calcCoords().tl.x;
            // const top = this.calcCoords().tl.y;
            // 这里的calcCoords()用不了，没找到原因，经对比this.calcCoords().tl.x = this.left
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
			const { html, css, js, importJs, importCss, active, funName } = code;
			// 引用单个外部js文件
			this.importScriptEl = document.createElement('script');
			this.importScriptEl.id = `${id}_externel_script`;
			this.importScriptEl.type = 'text/javascript';
			this.importScriptEl.src = importJs;
			document.head.appendChild(this.importScriptEl);

			// 引用单个外部css文件
			this.importStyleEl = document.createElement('link');
			this.importStyleEl.id = `${id}_externel_style`;
			this.importStyleEl.rel = 'stylesheet';
			this.importStyleEl.href = importCss;
			document.head.appendChild(this.importStyleEl);

			this.styleEl = document.createElement('style');
			this.styleEl.id = `${id}_style`;
			this.styleEl.type = 'text/css';
			this.styleEl.innerHTML = css;
			document.head.appendChild(this.styleEl);

			this.scriptEl = document.createElement('script');
			this.scriptEl.id = `${id}_script`;
			this.scriptEl.type = 'text/javascript';
			if(active){
				if(funName===''){
					this.scriptEl.innerHTML = `function forceRenderAndRun_${id.replaceAll('-','_')}() { ${js} } setTimeout(()=>{
					 	forceRenderAndRun_${id.replaceAll('-','_')}()
					},window.performance.timing['loaded'])`;
				}else{
					// 此处
					this.scriptEl.innerHTML = `${js}\r\n setTimeout(()=>{
					 	${funName}
					},window.performance.timing.loadEventEnd - window.performance.timing.domLoading)`;
				}
			}else this.scriptEl.innerHTML = js;
			document.documentElement.appendChild(this.scriptEl);

            const container = document.getElementById(this.container);
            container?.appendChild(this.element);
            this.element.innerHTML = html;
        }
    },
});

Element.fromObject = (options: ElementObject, callback: (obj: ElementObject) => any) => {
    return callback(new Element(options.code, options));
};

// @ts-ignore
window.fabric.Element = Element;

export default Element;
