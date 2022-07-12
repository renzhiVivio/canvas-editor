import {fabric} from 'fabric';
import 'mediaelement';
import 'mediaelement/build/mediaelementplayer.min.css';
import {FabricElement, toObject} from "./helper";

export interface VideoObject extends FabricElement {
    setSource: (source: string | File) => void;
    setFile: (file: File) => void;
    setSrc: (src: string) => void;
    file?: File;
    src?: string;
    videoElement?: HTMLVideoElement;
    player?: any;
}

interface PlayerAttr {
    autoplay?: string,
    muted?: string,
    loop?: string
}

const Video = fabric.util.createClass(fabric.Rect, {
    type: 'video',
    superType: 'element',
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
        this.setControlsVisibility({mtr: false});
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

    releaseElement() {
        this.videoElement.remove();
        this.element.remove();
    },

    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.element) {
            const {id, scaleX, scaleY, width, height, angle, editable, src, file, autoplay, muted, loop} = this;
            const zoom = this.canvas.getZoom();
            this.setCoords();
            const left = this.aCoords.tl.x || 0;
            const top = this.aCoords.tl.y || 0;
            const padLeft = (width * scaleX * zoom - width) / 2;
            const padTop = (height * scaleY * zoom - height) / 2;
            let attr = {} as PlayerAttr;
            if (!editable && autoplay) {
                attr.autoplay = ''
            } else {
                /// TODO: test purpose, remove it later
                attr.autoplay = ''
            }

            if (!editable && muted) {
                attr.muted = ''
            }

            if (!editable && loop) {
                attr.loop = ''
            }

            this.videoElement = fabric.util.makeElement('video', {
                id,
                preload: 'none',
                ...attr
            });

            this.element = fabric.util.wrapElement(this.videoElement, 'div', {
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
            const container = document.getElementById(this.container);
            container?.appendChild(this.element);
            // @ts-ignore
            this.player = new MediaElementPlayer(id, {
                features: ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume'],
                pauseOtherPlayers: false,
                videoWidth: '100%',
                videoHeight: '100%',
                success: (_mediaElement: any, _originalNode: any) => {
                    //

                },
            });
            this.player.setPlayerSize(width, height);
            if (src) {
                this.setSrc(src);
            } else if (file) {
                this.setFile(file);
            }
        }
    },
});

Video.fromObject = (options: VideoObject, callback: (obj: VideoObject) => any) => {
    return callback(new Video(options.src || options.file, options));
};

// @ts-ignore
window.fabric.Video = Video;

export default Video;
