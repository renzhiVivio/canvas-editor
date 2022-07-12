import {fabric} from 'fabric';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';
import {FabricElement, toObject} from "./helper";

export interface VideoJSObject extends FabricElement {
    setSource: (source: string | File) => void;
    setFile: (file: File) => void;
    setSrc: (src: string) => void;
    file?: File;
    src?: string;
    videoElement?: HTMLVideoElement;
    player?: any;
}

const VideoJS = fabric.util.createClass(fabric.Rect, {
        type: 'videojs',
        superType: 'image',
        hasRotatingPoint: false,
        initialize(source: string | File, options: any) {
            options = options || {};
            this.callSuper('initialize', options);
            if (source instanceof File) {
                this.set({
                    file: source,
                    src: null,
                });
            } else {
                this.set({
                    file: null,
                    src: source,
                });
            }
            this.set({
                fill: 'rgba(255, 255, 255, 0)',
                stroke: 'rgba(255, 255, 255, 0)',
            });
            const {id, scaleX, scaleY, width, height, angle, src, autoplay, muted, loop} = this;
            this.element = fabric.util.makeElement('video', {
                id: `${id.replaceAll('-', '_')}_video`,
                style: `transform: rotate(${angle}deg) scale(${scaleX}, ${scaleY});
            display:none`,
                width,
                height,
                controls: '',
                autoplay,
                muted,
                loop,
                preload: 'none',
                src,
            }) as HTMLVideoElement;
            this.main = document.getElementById('canvas-container-div');
            this.main.parentNode.appendChild(this.element);
        },

        setSource(source: any) {
            if (source instanceof File) {
                this.setFile(source);
            } else {
                this.setSrc(source);
            }
        },

        setFile(file: File) {
            this.set({
                file,
                src: null,
            });
            const reader = new FileReader();
            reader.onload = () => {
                this.player.setSrc(reader.result);
            };
            reader.readAsDataURL(file);
        },

        setSrc(src: string) {
            this.set({
                file: null,
                src,
            });
            this.player.setSrc(src);
        },


        toObject(propertiesToInclude: string[]) {
            return toObject(this, propertiesToInclude, {
                src: this.get('src'),
                file: this.get('file'),
                container: this.get('container'),
                editable: this.get('editable'),
            });
        },

        _render(ctx: CanvasRenderingContext2D) {
            this.callSuper('_render', ctx);
        },
    })
;

VideoJS.fromObject = (options: VideoJSObject, callback: (obj: VideoJSObject) => any) => {
    return callback(new VideoJS(options.src || options.file, options));
};

VideoJS.createFabricImage = (source: string | File, options: any) => {
    const obj = new VideoJS(source, options);
    const video1El = document.getElementById(`${obj!.id!.replaceAll('-', '_')}_video`) as HTMLVideoElement;
    return new fabric.Image(video1El, options);
}

// @ts-ignore
window.fabric.VideoJS = VideoJS;

export default VideoJS;
