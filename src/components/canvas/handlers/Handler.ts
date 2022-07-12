import {FabricCanvas, FabricElement, FabricGroup, FabricImage, FabricObject, FabricObjectOption, InteractionMode} from "../objects/helper";
import CustomHandler from "./CustomHandler";
import {CanvasOption, FabricObjects, GridOption, GuidelineOption, HandlerOptions, KeyEvent} from "./helper";
import * as defaults from '../defaults';
import React from "react";
import {fabric} from "fabric";
import CanvasObject from "../CanvasObject";
import ElementHandler from "./ElementHandler";
import _, {union} from 'lodash';
import InteractionHandler from "./InteractionHandler";
import PortHandler from "./PortHandler";
import LinkHandler, {LinkOption} from "./LinkHandler";
import GridHandler from "./GridHandler";
import {v4 as uuidv4} from 'uuid';
import {filterObject} from "../../../utils/projectUtils";
import EventHandler from "./EventHandler";
import {WorkareaObject, WorkareaOption} from "../helper";
import WorkareaHandler from "./WorkareaHandler";
import ImageHandler from "./ImageHandler";
import ZoomHandler from "./ZoomHandler";
import GuidelineHandler from "./GuidelineHandler";
import AnimationHandler from "./AnimationHandler";
import AlignmentHandler from "./AlignmentHandler";
import CropHandler from "./CropHandler";
import DrawingHandler from "./DrawingHandler";
import ContextmenuHandler from "./ContextmenuHandler";
import ShortcutHandler from "./ShortcutHandler";
import {LinkObject} from "../objects/Link";
import TransactionHandler, {TransactionEvent} from "./TransactionHandler";
import {NodeObject} from "../objects/Node";
import {PortObject} from "../objects/Port";
import TooltipHandler from "./TooltipHandler";
import NodeHandler from "./NodeHandler";
import ChartHandler from "./ChartHandler";
import {Gif} from "../objects";
import Video from "../objects/Video";
import VideoJS from "../objects/VideoJS";

/**
 * Main handler for Canvas
 * @class Handler
 * @implements {HandlerOptions}
 */
class Handler implements HandlerOptions {
    public id!: string;
    public canvas!: FabricCanvas;
    public workarea!: WorkareaObject;
    public container!: HTMLDivElement;
    public editable!: boolean;
    public interactionMode!: InteractionMode;
    public minZoom!: number;
    public maxZoom!: number;
    public propertiesToInclude?: string[] = defaults.propertiesToInclude;
    public workareaOption?: WorkareaOption = defaults.workareaOption;
    public canvasOption?: CanvasOption = defaults.canvasOption;
    public gridOption?: GridOption = defaults.gridOption;
    public objectOption?: FabricObjectOption = defaults.objectOption;
    public guidelineOption?: GuidelineOption = defaults.guidelineOption;
    public keyEvent?: KeyEvent = defaults.keyEvent;
    public activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>> = defaults.activeSelectionOption;
    public fabricObjects?: FabricObjects = CanvasObject;
    public zoomEnabled?: boolean;
    public width?: number;
    public height?: number;

    public onAdd?: (object: FabricObject) => void;
    public onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any>;
    public onTooltip?: (el: HTMLDivElement, target?: FabricObject) => Promise<any>;
    public onZoom?: (zoomRatio: number) => void;
    public onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    public onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    public onModified?: (target: FabricObject) => void;
    public onSelect?: (target?: FabricObject[]) => void;
    public onRemove?: (target: FabricObject) => void;
    public onTransaction?: (transaction: TransactionEvent) => void;
    public onInteraction?: (interactionMode: InteractionMode) => void;
    public onLoad?: (handler: Handler, canvas?: fabric.Canvas) => void;

    public imageHandler!: ImageHandler;
    public chartHandler!: ChartHandler;
    public elementHandler!: ElementHandler;
    public cropHandler!: CropHandler;
    public animationHandler!: AnimationHandler;
    public contextmenuHandler!: ContextmenuHandler;
    public tooltipHandler!: TooltipHandler;
    public zoomHandler!: ZoomHandler;
    public workareaHandler!: WorkareaHandler;
    public interactionHandler!: InteractionHandler;
    public transactionHandler!: TransactionHandler;
    public gridHandler!: GridHandler;
    public portHandler!: PortHandler;
    public linkHandler!: LinkHandler;
    public nodeHandler!: NodeHandler;
    public alignmentHandler!: AlignmentHandler;
    public guidelineHandler!: GuidelineHandler;
    public eventHandler!: EventHandler;
    public drawingHandler!: DrawingHandler;
    public shortcutHandler!: ShortcutHandler;
    public handlers: { [key: string]: CustomHandler } = {};

    public objectMap: Record<string, FabricObject> = {};
    public objects!: FabricObject[];
    public activeLine?: any;
    public activeShape?: any;
    public zoom = 1;
    public prevTarget?: FabricObject;
    public target?: FabricObject;
    public pointArray?: any[];
    public lineArray?: any[];
    public isCut = false;

    private isRequestAnimFrame = false;
    private requestFrame: any;
    /**
     * Copied object
     *
     * @private
     * @type {*}
     */
    private clipboard: any;

    constructor(options: HandlerOptions) {
        this.initialize(options);
    }

    /**
     * Initialize handler
     *
     * @author salgum1114
     * @param {HandlerOptions} options
     */
    public initialize(options: HandlerOptions) {
        this.initOption(options);
        this.initCallback(options);
        this.initHandler();
    }

    /**
     * Init class fields
     * @param {HandlerOptions} options
     */
    public initOption = (options: HandlerOptions) => {
        this.id = options.id!;
        this.canvas = options.canvas!;
        this.container = options.container!;
        this.editable = options.editable!;
        this.interactionMode = options.interactionMode!;
        this.minZoom = options.minZoom!;
        this.maxZoom = options.maxZoom!;
        this.zoomEnabled = options.zoomEnabled;
        this.width = options.width;
        this.height = options.height;
        this.objects = [];
        options.propertiesToInclude && this.setPropertiesToInclude(options.propertiesToInclude);
        options.workareaOption && this.setWorkareaOption(options.workareaOption);
        options.canvasOption && this.setCanvasOption(options.canvasOption);
        options.gridOption && this.setGridOption(options.gridOption);
        options.objectOption && this.setObjectOption(options.objectOption);
        options.fabricObjects && this.setFabricObjects(options.fabricObjects);
        options.guidelineOption && this.setGuidelineOption(options.guidelineOption);
        options.activeSelectionOption && this.setActiveSelectionOption(options.activeSelectionOption);
        options.keyEvent && this.setKeyEvent(options.keyEvent);
    };

    /**
     * Initialize callback
     * @param {HandlerOptions} options
     */
    public initCallback = (options: HandlerOptions) => {
        this.onAdd = options.onAdd;
        this.onTooltip = options.onTooltip;
        this.onZoom = options.onZoom;
        this.onContext = options.onContext;
        this.onClick = options.onClick;
        this.onModified = options.onModified;
        this.onDblClick = options.onDblClick;
        this.onSelect = options.onSelect;
        this.onRemove = options.onRemove;
        this.onTransaction = options.onTransaction;
        this.onInteraction = options.onInteraction;
        this.onLoad = options.onLoad;
    };

    /**
     * Initialize handlers
     *
     */
    public initHandler = () => {
        this.workareaHandler = new WorkareaHandler(this);
        this.imageHandler = new ImageHandler(this);
        this.chartHandler = new ChartHandler(this);
        this.elementHandler = new ElementHandler(this);
        this.cropHandler = new CropHandler(this);
        this.animationHandler = new AnimationHandler(this);
        this.contextmenuHandler = new ContextmenuHandler(this);
        this.tooltipHandler = new TooltipHandler(this);
        this.zoomHandler = new ZoomHandler(this);
        this.interactionHandler = new InteractionHandler(this);
        this.transactionHandler = new TransactionHandler(this);
        this.gridHandler = new GridHandler(this);
        this.portHandler = new PortHandler(this);
        this.linkHandler = new LinkHandler(this);
        this.nodeHandler = new NodeHandler(this);
        this.alignmentHandler = new AlignmentHandler(this);
        this.guidelineHandler = new GuidelineHandler(this);
        this.eventHandler = new EventHandler(this);
        this.drawingHandler = new DrawingHandler(this);
        this.shortcutHandler = new ShortcutHandler(this);
    };

    /**
     *
     * Get canvas objects, will skip workarea, grid, and port
     *
     * @returns {FabricObject[]}
     */
    public getCanvasObjects = (): FabricObject[] => {
        const objects = this.canvas.getObjects().filter((obj: FabricObject) => {
            if (obj.id === 'workarea') {
                return false;
            } else if (obj.id === 'grid') {
                return false;
            } else if (obj.superType === 'port') {
                return false;
            } else if (!obj.id) {
                return false;
            }
            return true;
        }) as FabricObject[];
        if (objects.length) {
            objects.forEach(obj => {
                    if (obj.id) {
                        this.objectMap[obj.id] = obj;
                    }
                }
            );
        } else {
            this.objectMap = {};
        }
        return objects;
    };

    /**
     * Set key pair
     * @param {keyof FabricObject} key
     * @param {*} value
     * @returns
     */
    public set = (key: keyof FabricObject, value: any) => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }
        if (activeObject.type === 'svg' && (key === 'fill' || key === 'stroke')) {
            (activeObject as FabricGroup)._objects.forEach(obj => obj.set(key, value));
        }
        activeObject.set(key, value);
        activeObject.setCoords();
        this.canvas.requestRenderAll();
        const {id, superType, type, player, width, height} = activeObject as any;
        if (superType === 'element') {
            if (key === 'visible') {
                if (value) {
                    activeObject.element.style.display = 'block';
                } else {
                    activeObject.element.style.display = 'none';
                }
            }
            const el = this.elementHandler.findById(id)!;
            // update the element
            this.elementHandler.setScaleOrAngle(el, activeObject);
            this.elementHandler.setSize(el, activeObject);
            this.elementHandler.setPosition(el, activeObject);
            if ((type === 'video' || type === 'videojs') && player) {
                player.setPlayerSize(width, height);
            }
        }
        const {onModified} = this;
        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * Set option
     * @param {Partial<FabricObject>} option
     * @returns
     */
    public setObject = (option: Partial<FabricObject>) => {
        const activeObject = this.canvas.getActiveObject() as any;
        if (!activeObject) {
            return;
        }
        Object.keys(option).forEach(key => {
            if (option[key] !== activeObject[key]) {
                activeObject.set(key, option[key]);
                activeObject.setCoords();
            }
        });
        this.canvas.requestRenderAll();
        const {id, superType, type, player, width, height} = activeObject;
        if (superType === 'element') {
            if ('visible' in option) {
                if (option.visible) {
                    activeObject.element.style.display = 'block';
                } else {
                    activeObject.element.style.display = 'none';
                }
            }
            const el = this.elementHandler.findById(id)!;
            // update the element
            this.elementHandler.setScaleOrAngle(el, activeObject);
            this.elementHandler.setSize(el, activeObject);
            this.elementHandler.setPosition(el, activeObject);
            if ((type === 'video' || type === 'videojs') && player) {
                player.setPlayerSize(width, height);
            }
        }
        const {onModified} = this;
        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * Set key pair by object
     * @param {FabricObject} obj
     * @param {string} key
     * @param {*} value
     * @returns
     */
    public setByObject = (obj: any, key: string, value: any) => {
        if (!obj) {
            return;
        }
        if (obj.type === 'svg') {
            if (key === 'fill') {
                obj.setFill(value);
            } else if (key === 'stroke') {
                obj.setStroke(value);
            }
        }
        obj.set(key, value);
        obj.setCoords();
        this.canvas.renderAll();
        const {id, superType, type, player, width, height} = obj as any;
        if (superType === 'element') {
            if (key === 'visible') {
                if (value) {
                    obj.element.style.display = 'block';
                } else {
                    obj.element.style.display = 'none';
                }
            }
            const el = this.elementHandler.findById(id)!;
            // update the element
            this.elementHandler.setScaleOrAngle(el, obj);
            this.elementHandler.setSize(el, obj);
            this.elementHandler.setPosition(el, obj);
            if ((type === 'video' || type === 'videojs') && player) {
                player.setPlayerSize(width, height);
            }
        }
        const {onModified} = this;
        if (onModified) {
            onModified(obj);
        }
    };

    /**
     * Set key pair by id
     * @param {string} id
     * @param {string} key
     * @param {*} value
     */
    public setById = (id: string, key: string, value: any) => {
        const findObject = this.findById(id);
        this.setByObject(findObject, key, value);
    };

    /**
     * Set partial by object
     * @param {FabricObject} obj
     * @param {FabricObjectOption} option
     * @returns
     */
    public setByPartial = (obj: FabricObject, option: FabricObjectOption) => {
        if (!obj) {
            return;
        }
        if (obj.type === 'svg') {
            if (option.fill) {
                obj.setFill(option.fill);
            } else if (option.stroke) {
                obj.setStroke(option.stroke);
            }
        }
        obj.set(option);
        obj.setCoords();
        this.canvas.renderAll();
        const {id, superType, type, player, width, height} = obj as any;
        if (superType === 'element') {
            if ('visible' in option) {
                if (option.visible) {
                    obj.element.style.display = 'block';
                } else {
                    obj.element.style.display = 'none';
                }
            }
            const el = this.elementHandler.findById(id)!;
            // update the element
            this.elementHandler.setScaleOrAngle(el, obj);
            this.elementHandler.setSize(el, obj);
            this.elementHandler.setPosition(el, obj);
            if ((type === 'video' || type === 'videojs') && player) {
                player.setPlayerSize(width, height);
            }
        }
    };

    /**
     * Set shadow
     * @param {fabric.Shadow} option
     * @returns
     */
    public setShadow = (option: fabric.IShadowOptions) => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }
        activeObject.set('shadow', new fabric.Shadow(option));
        this.canvas.requestRenderAll();
        const {onModified} = this;
        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * Set the image
     * @param {FabricImage} obj
     * @param {(File | string)} [source]
     * @param callback
     * @returns
     */
    public setImage = (obj: FabricImage, source?: File | string, callback?: () => void) => {
        if (!source) {
            this.loadImage(obj, undefined, callback);
            obj.set('file', undefined);
            obj.set('src', undefined);
            return;
        }
        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = () => {
                this.loadImage(obj, reader.result as string, callback);
                obj.set('file', source);
                obj.set('src', undefined);
            };
            reader.readAsDataURL(source);
        } else {
            this.loadImage(obj, source, callback);
            obj.set('file', undefined);
            obj.set('src', source);
        }
    };

    /**
     * Set image by id
     * @param {string} id
     * @param {*} source
     */
    public setImageById = (id: string, source: any) => {
        const findObject = this.findById(id) as FabricImage;
        this.setImage(findObject, source);
    };

    /**
     * Set visible
     * @param {boolean} [visible]
     * @returns
     */
    public setVisible = (visible?: boolean) => {
        const activeObject = this.canvas.getActiveObject() as FabricElement;
        if (!activeObject) {
            return;
        }
        if (activeObject.superType === 'element') {
            if (visible) {
                activeObject.element.style.display = 'block';
            } else {
                activeObject.element.style.display = 'none';
            }
        }
        activeObject.set({
            visible,
        });
        this.canvas.renderAll();
    };

    /**
     * Set the position on Object
     *
     * @param {FabricObject} obj
     * @param {boolean} [centered]
     */
    public centerObject = (obj: FabricObject, centered?: boolean) => {
        if (centered) {
            this.canvas.centerObject(obj);
            obj.setCoords();
        } else {
            this.setByPartial(obj, {
                left:
                    obj.left! / this.canvas.getZoom() -
                    obj.width! / 2 -
                    this.canvas.viewportTransform![4] / this.canvas.getZoom(),
                top:
                    obj.top! / this.canvas.getZoom() -
                    obj.height! / 2 -
                    this.canvas.viewportTransform![5] / this.canvas.getZoom(),
            });
        }
    };

    /**
     * Add object
     * @param {FabricObjectOption} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    public add = (obj: FabricObjectOption, centered = true, loaded = false) => {
        const {editable, onAdd, gridOption, objectOption} = this;
        const option: any = {
            hasControls: editable,
            hasBorders: editable,
            selectable: editable,
            lockMovementX: !editable,
            lockMovementY: !editable,
            hoverCursor: !editable ? 'default' : 'move',
            // hoverCursor: 'move',
        };
        if (obj.type === 'i-text') {
            option.editable = false;
        } else {
            option.editable = editable;
        }
        // if (editable && this.workarea.layout === 'fullscreen') {
        //     option.scaleX = this.workarea.scaleX;
        //     option.scaleY = this.workarea.scaleY;
        // }
        let newOption = Object.assign(
            {},
            filterObject(objectOption),
            filterObject(obj),
            filterObject({
                container: this.container.id,
                editable,
            }),
            filterObject(option),
        );
        // Individually create canvas object
        // if (obj.superType === 'link') {
        //     return this.linkHandler.create(newOption, loaded);
        // }
        let createdObj: FabricObject;
        if (obj.type === 'image') {
            if (!this.transactionHandler.active && !loaded) {
                createdObj = this.addImage(newOption, () => {
                    this.transactionHandler.save('add');
                });
            } else {
                createdObj = this.addImage(newOption);
            }

        } else if (obj.type === 'gif') {
            createdObj = this.addGif(newOption);

        } else if (obj.type === 'video') {
            createdObj = this.addVideo(newOption);

        } else if (obj.type === 'videojs') {
            createdObj = this.addVideoJS(newOption);

        } else if (obj.type === 'element') {
            // react-design-editor里面有这些参数，没找到是哪里添加上去的，所以这里手动添加
            newOption = {
                ...newOption,
                ...{
                    "stroke": "rgba(255, 255, 255, 0)",
                    "resource": {},
                    "link": {
                        "enabled": false,
                        "type": "resource",
                        "state": "new",
                        "dashboard": {}
                    },
                    "tooltip": {
                        "enabled": true,
                        "type": "resource",
                        "template": "<div>{{message.name}}</div>"
                    },
                    "animation": {
                        "type": "none",
                        "loop": true,
                        "autoplay": true,
                        "duration": 1000
                    },
                    "userProperty": {},
                    "trigger": {
                        "enabled": false,
                        "type": "alarm",
                        "script": "return message.value > 0;",
                        "effect": "style"
                    },
                }
            }
            createdObj = this.fabricObjects?.[obj.type].create(newOption)!;
        } else if (obj.type === 'group') {
            const objects = this.addGroup(newOption, centered, loaded);
            const groupOption = Object.assign({}, filterObject(newOption), filterObject({objects, name: 'New Group'}));
            createdObj = this.fabricObjects?.[obj.type].create(groupOption)!;
        } else {
            createdObj = this.fabricObjects?.[obj.type!].create(newOption)!;
        }
        this.canvas.add(createdObj!);

        this.objects = this.getCanvasObjects();
        if (!editable && !(obj.superType === 'element')) {
            createdObj.on('mousedown', this.eventHandler.object.mousedown);
        }
        if (createdObj.dblclick) {
            createdObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
        }

        if (obj.superType !== 'drawing' && obj.superType !== 'link' && editable && !loaded) {
            this.centerObject(createdObj, centered);
        }
        if (this.objects.some(object => object.type === 'gif' || object.type === 'videojs')) {
            this.startRequestAnimFrame();
        } else {
            this.stopRequestAnimFrame();
        }
        if (createdObj.superType === 'node') {
            // this.portHandler.create(createdObj as NodeObject);
            // if (createdObj.iconButton) {
            //     this.canvas.add(createdObj.iconButton);
            // }
        }
        if (!editable && createdObj.animation && createdObj.animation.autoplay) {
            this.animationHandler.play(createdObj.id!);
        }

        // if( !editable && createdObj.type==='videojs'){
        //     const video1El = document.getElementById(`video_${createdObj.id}`) as HTMLVideoElement;
        //     video1El.play();
        // }
        if (createdObj.superType === 'node') {
            createdObj.set('shadow', {
                color: createdObj.stroke,
            } as fabric.Shadow);
        }
        if (gridOption?.enabled) {
            this.gridHandler.setCoords(createdObj);
        }

        this.canvas.setActiveObject(createdObj);
        this.canvas.renderAll();

        if (!loaded && obj.type !== 'image') {
            this.transactionHandler.save('add');
        }

        if (onAdd && editable && !loaded) {
            onAdd(createdObj);
        }
        return createdObj;
    };

    /**
     * Add group object
     *
     * @param {FabricGroup} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    public addGroup = (obj: FabricGroup, centered = true, loaded = false) => {
        return obj.objects?.map(child => {
            return this.add(child, centered, loaded);
        });
    };

    /**
     * Add iamge object
     * @param {FabricImage} obj
     * @param callback
     * @returns
     */
    public addImage = (obj: FabricImage, callback?: () => void) => {
        const {objectOption} = this;
        const {filters = [], ...otherOption} = obj;
        const image = new Image();
        if (obj.src) {
            image.src = obj.src;
        }
        const createdObj = new fabric.Image(image, {
            ...objectOption,
            ...otherOption,
        }) as FabricImage;
        createdObj.set({
            filters: this.imageHandler.createFilters(filters),
        });
        this.setImage(createdObj, obj.src || obj.file, callback);
        return createdObj;
    };

    /**
     * author: Tom
     * @param obj
     */
    private addGif = (obj: FabricImage) => {
        const {objectOption} = this;
        const {filters = [], ...otherOption} = obj;
        const image = new Image();
        if (obj.src) {
            image.src = obj.src;
        }
        const createdObj = new Gif({
            ...objectOption,
            ...otherOption,
        }) as FabricImage;
        createdObj.set({
            filters: this.imageHandler.createFilters(filters),
        });
        this.setImage(createdObj, obj.src || obj.file);
        return createdObj;
    }

    private addVideo = (obj: FabricObject) => {
        const {objectOption} = this;
        const {...otherOption} = obj;
        return new Video(obj.src, {
            ...objectOption,
            ...otherOption,
        });
    }

    private addVideoJS = (obj: FabricObject) => {
        const {objectOption} = this;
        const {...otherOption} = obj;
        return VideoJS.createFabricImage(obj.src, {
            ...objectOption,
            ...otherOption,
        });
    }

    public insertObjectAtIndex = (obj: FabricObject, offsetIndex: number, nonVisibleIndex?: number): number => {
        if (!nonVisibleIndex) {
            nonVisibleIndex = 0;
            this.canvas.getObjects().forEach((o, idx) => {
                if (Handler.isNoneVisibleObject(o)) {
                    nonVisibleIndex = idx > (nonVisibleIndex ?? 0) ? idx : nonVisibleIndex;
                }
            });
        }
        delete obj.group;
        const created = this.add(obj, false, false);
        if (obj.superType === 'element') {
            this.transformElement(created, obj);
        }
        created.setOptions(obj._stateProperties);
        // @ts-ignore
        fabric.util.applyTransformToObject(created, obj.transformMatrix);

        this.canvas.moveTo(created, nonVisibleIndex + offsetIndex + 1);

        return nonVisibleIndex;
    }

    public transformElement(origin: FabricObject, target: FabricObject) {

        const {id} = target;
        let element = document.getElementById(`${id}_container`);
        if (!element) {
            return;
        }
        element.setAttribute('style', target.elementStyle);
    }


    public moveObjectToIndex = (obj: FabricObject, offsetIndex: number, nonVisibleIndex?: number): number => {
        if (!nonVisibleIndex) {
            nonVisibleIndex = 0;
            this.canvas.getObjects().forEach((o, idx) => {
                if (Handler.isNoneVisibleObject(o)) {
                    nonVisibleIndex = idx > (nonVisibleIndex ?? 0) ? idx : nonVisibleIndex;
                }
            });
        }

        let fObj = this.findById(obj.id);
        if (fObj) {
            this.canvas.moveTo(fObj, nonVisibleIndex + offsetIndex + 1);
        }
        return nonVisibleIndex;
    }

    /**
     * extracted from remove()
     * @author Tom
     * @private
     */

    private _removeAnObject(obj: FabricObject) {

        if (obj.type === 'video') {
            obj.releaseElement();
        }

        if (obj.superType === 'element') {
            this.elementHandler.removeById(obj.id!);

        } else if (obj.superType === 'link') {

            this.linkHandler.remove(obj as LinkObject);

        } else if (obj.superType === 'node') {

            if (obj.toPort) {
                if (obj.toPort.links.length) {
                    obj.toPort.links.forEach((link: any) => {
                        this.linkHandler.remove(link, 'from');
                    });
                }
                this.canvas.remove(obj.toPort);
            }

            if (obj.fromPort && obj.fromPort.length) {
                obj.fromPort.forEach((port: any) => {
                    if (port.links.length) {
                        port.links.forEach((link: any) => {
                            this.linkHandler.remove(link, 'to');
                        });
                    }
                    this.canvas.remove(port);
                });
            }
        }

        this.canvas.remove(obj);
    }

    /**
     * Remove object
     * @param {FabricObject} target
     * @returns {any}
     */
    public remove = (target?: FabricObject) => {
        const activeObject = target || (this.canvas.getActiveObject() as any);
        if (activeObject.id === 'workarea') return;
        if (this.prevTarget && this.prevTarget.superType === 'link') {
            this.linkHandler.remove(this.prevTarget as LinkObject);
            this.transactionHandler.save('remove');
            return;
        }

        if (!activeObject) {
            return;
        }

        if (typeof activeObject.deletable !== 'undefined' && !activeObject.deletable) {
            return;
        }

        if (activeObject.type !== 'activeSelection') {

            this.canvas.discardActiveObject();

            this._removeAnObject(activeObject);

            if (activeObject.superType === 'element') {
                if (activeObject.type === 'videojs') {
                    let main = document.getElementById('canvas-container-div');
                    let currentElement = document.getElementById(`${activeObject.id.replaceAll('-', '_')}_video`)
                    if (currentElement) main?.parentNode?.removeChild(currentElement);
                }
                this.elementHandler.removeById(activeObject.id);
            }
            if (activeObject.superType === 'link') {
                this.linkHandler.remove(activeObject);
            } else if (activeObject.superType === 'node') {
                if (activeObject.toPort) {
                    if (activeObject.toPort.links.length) {
                        activeObject.toPort.links.forEach((link: any) => {
                            this.linkHandler.remove(link, 'from');
                        });
                    }
                    this.canvas.remove(activeObject.toPort);
                }
                if (activeObject.fromPort && activeObject.fromPort.length) {
                    activeObject.fromPort.forEach((port: any) => {
                        if (port.links.length) {
                            port.links.forEach((link: any) => {
                                this.linkHandler.remove(link, 'to');
                            });
                        }
                        this.canvas.remove(port);
                    });
                }
            }
            this.canvas.remove(activeObject);
        } else {

            const {_objects: activeObjects} = activeObject;

            const existDeleted = activeObjects.some(
                (obj: any) => typeof obj.deletable !== 'undefined' && !obj.deletable,
            );

            if (existDeleted) {
                return;
            }

            this.canvas.discardActiveObject();

            activeObjects.forEach((obj: any) => {
                this._removeAnObject(obj);
            });
        }

        this.transactionHandler.save('remove');

        this.objects = this.getCanvasObjects();
        const {onRemove} = this;
        if (onRemove) {
            onRemove(activeObject);
        }
    };

    /**
     * Remove object by id
     * @param {string} id
     */
    public removeById = (id: string) => {
        const findObject = this.findById(id);
        if (findObject) {
            this.remove(findObject);
        }
    };

    /**
     * Delete at origin object list
     * @param {string} id
     */
    public removeOriginById = (id: string) => {
        const object = this.findOriginByIdWithIndex(id);
        if (object.index && object.index > 0) {
            this.objects.splice(object.index, 1);
        }
    };

    /**
     * Duplicate object
     * @returns
     */
    public duplicate = () => {
        const {
            onAdd,
            propertiesToInclude,
            // @ts-ignore
            gridOption: {grid = 10},
        } = this;
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }
        if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
            return;
        }
        activeObject.clone((clonedObj: FabricObject) => {
            this.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + grid,
                top: clonedObj.top + grid,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                const activeSelection = clonedObj as fabric.ActiveSelection;
                activeSelection.canvas = this.canvas;
                activeSelection.forEachObject((obj: any) => {
                    obj.set('id', uuidv4());
                    if (obj.superType === 'node') {
                        obj.set('shadow', {
                            color: obj.stroke,
                        } as fabric.Shadow);
                    }
                    this.canvas.add(obj);
                    this.objects = this.getCanvasObjects();
                    if (obj.dblclick) {
                        obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                    }
                });
                if (onAdd) {
                    onAdd(activeSelection);
                }
                activeSelection.setCoords();
            } else {
                if (activeObject.id === clonedObj.id) {
                    clonedObj.set('id', uuidv4());
                }
                if (clonedObj.superType === 'node') {
                    clonedObj.set('shadow', {
                        color: clonedObj.stroke,
                    } as fabric.Shadow);
                }
                this.canvas.add(clonedObj);
                this.objects = this.getCanvasObjects();
                if (clonedObj.dblclick) {
                    clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                if (onAdd) {
                    onAdd(clonedObj);
                }
            }
            this.canvas.setActiveObject(clonedObj);
            this.portHandler.create(clonedObj as NodeObject);
            this.canvas.requestRenderAll();
        }, propertiesToInclude);
    };

    /**
     * Duplicate object by id
     * @param {string} id
     * @returns
     */
    public duplicateById = (id: string) => {
        const {
            onAdd,
            propertiesToInclude,
            // @ts-ignore
            gridOption: {grid = 10},
        } = this;
        const findObject = this.findById(id);
        if (findObject) {
            if (typeof findObject.cloneable !== 'undefined' && !findObject.cloneable) {
                return false;
            }
            findObject.clone((cloned: FabricObject) => {
                cloned.set({
                    left: cloned.left + grid,
                    top: cloned.top + grid,
                    id: uuidv4(),
                    evented: true,
                });
                this.canvas.add(cloned);
                this.objects = this.getCanvasObjects();
                if (onAdd) {
                    onAdd(cloned);
                }
                if (cloned.dblclick) {
                    cloned.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                this.canvas.setActiveObject(cloned);
                this.portHandler.create(cloned as NodeObject);
                this.canvas.requestRenderAll();
            }, propertiesToInclude);
        }
        return true;
    };

    /**
     * Cut object
     *
     */
    public cut = () => {
        this.copy();
        this.remove();
        this.isCut = true;
    };

    /**
     * Copy to clipboard
     *
     * @param {*} value
     */
    public copyToClipboard = (value: any) => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = value;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.canvas.wrapperEl?.focus();
    };

    /**
     * Copy object
     *
     * @returns
     */
    public copy = () => {
        const {propertiesToInclude} = this;
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject && activeObject.superType === 'link') {
            return false;
        }
        if (activeObject) {
            if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
                return false;
            }
            if (activeObject.type === 'activeSelection') {
                const activeSelection = activeObject as fabric.ActiveSelection;
                if (activeSelection.getObjects().some((obj: any) => obj.superType === 'node')) {
                    if (this.keyEvent?.clipboard) {
                        const links = [] as any[];
                        const objects = activeSelection.getObjects().map((obj: any, index: number) => {
                            if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
                                return null;
                            }
                            if (obj.fromPort.length) {
                                obj.fromPort.forEach((port: any) => {
                                    if (port.links.length) {
                                        port.links.forEach((link: any) => {
                                            const linkTarget = {
                                                fromNodeIndex: index,
                                                fromPortId: port.id,
                                                type: 'curvedLink',
                                                superType: 'link',
                                            } as any;
                                            const findIndex = activeSelection
                                                .getObjects()
                                                .findIndex((compObj: any) => compObj.id === link.toNode.id);
                                            if (findIndex >= 0) {
                                                linkTarget.toNodeIndex = findIndex;
                                                links.push(linkTarget);
                                            }
                                        });
                                    }
                                });
                            }
                            return {
                                name: obj.name,
                                description: obj.description,
                                superType: obj.superType,
                                type: obj.type,
                                nodeClazz: obj.nodeClazz,
                                configuration: obj.configuration,
                                properties: {
                                    left: activeObject.left! + activeObject.width! / 2 + obj.left || 0,
                                    top: activeObject.top! + activeObject.height! / 2 + obj.top || 0,
                                    iconName: obj.descriptor.icon,
                                },
                            };
                        });
                        this.copyToClipboard(JSON.stringify(objects.concat(links), null, '\t'));
                        return true;
                    }
                    this.clipboard = activeObject;
                    return true;
                }
            }

            activeObject.clone((cloned: FabricObject) => {
                if (this.keyEvent?.clipboard) {
                    if (cloned.superType === 'node') {
                        const node = {
                            name: cloned.name,
                            description: cloned.description,
                            superType: cloned.superType,
                            type: cloned.type,
                            nodeClazz: cloned.nodeClazz,
                            configuration: cloned.configuration,
                            properties: {
                                left: cloned.left || 0,
                                top: cloned.top || 0,
                                iconName: cloned.descriptor.icon,
                            },
                        };
                        const objects = [node];
                        this.copyToClipboard(JSON.stringify(objects, null, '\t'));
                    } else {
                        this.copyToClipboard(JSON.stringify(cloned.toObject(propertiesToInclude), null, '\t'));
                    }
                } else {
                    this.clipboard = cloned;
                    if (activeObject.type === 'videojs') {
                        this.clipboard = activeObject;
                    }
                }
            }, propertiesToInclude);
        }
        return true;
    };

    /**
     * Paste object
     *
     * @returns
     */
    public paste = (targetX?: number, targetY?: number) => {
        const {
            onAdd,
            propertiesToInclude,
            // @ts-ignore
            gridOption: {grid = 10},
            clipboard,
            isCut,
        } = this;
        const padding = isCut ? 0 : grid;
        if (!clipboard) {
            return false;
        }
        if (typeof clipboard.cloneable !== 'undefined' && !clipboard.cloneable) {
            return false;
        }
        this.isCut = false;
        if (clipboard.type === 'activeSelection') {
            if (clipboard.getObjects().some((obj: any) => obj.superType === 'node')) {
                this.canvas.discardActiveObject();
                const objects = [] as any[];
                const linkObjects = [] as LinkOption[];
                clipboard.getObjects().forEach((obj: any) => {
                    if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
                        return;
                    }
                    const clonedObj = obj.duplicate();
                    if (clonedObj.type === 'SwitchNode') {
                        clonedObj.set({
                            left: obj.left + padding + padding,
                            top: obj.top + padding,
                        });
                    } else {
                        clonedObj.set({
                            left: obj.left + padding,
                            top: obj.top + padding,
                        });
                    }
                    if (obj.fromPort.length) {
                        obj.fromPort.forEach((port: PortObject) => {
                            if (port.links?.length) {
                                port.links?.forEach((link: LinkObject) => {
                                    const linkTarget = {
                                        fromNode: clonedObj.id,
                                        fromPort: port.id,
                                    } as any;
                                    const findIndex = clipboard
                                        .getObjects()
                                        .findIndex((compObj: any) => compObj.id === link.toNode?.id);
                                    if (findIndex >= 0) {
                                        linkTarget.toNodeIndex = findIndex;
                                        linkObjects.push(linkTarget);
                                    }
                                });
                            }
                        });
                    }
                    if (clonedObj.dblclick) {
                        clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                    }
                    this.canvas.add(clonedObj);
                    this.objects = this.getCanvasObjects();
                    this.portHandler.create(clonedObj);
                    objects.push(clonedObj);
                });
                if (linkObjects.length) {
                    linkObjects.forEach((linkObject: any) => {
                        const {fromNode, fromPort, toNodeIndex} = linkObject;
                        const toNode = objects[toNodeIndex];
                        const link = {
                            type: 'curvedLink',
                            fromNodeId: fromNode,
                            fromPortId: fromPort,
                            toNodeId: toNode.id,
                            toPortId: toNode.toPort.id,
                        };
                        this.linkHandler.create(link);
                    });
                }
                const activeSelection = new fabric.ActiveSelection(objects, {
                    canvas: this.canvas,
                    ...this.activeSelectionOption,
                });
                if (isCut) {
                    this.clipboard = null;
                } else {
                    this.clipboard = activeSelection;
                }
                this.transactionHandler.save('paste');
                this.canvas.setActiveObject(activeSelection);
                this.canvas.renderAll();
                return true;
            }
        }
        clipboard.clone((clonedObj: any) => {
            this.canvas.discardActiveObject();
            if (clonedObj == null && clipboard.type === 'videojs') {
                clonedObj = clipboard;
            }
            if (clipboard.type !== 'videojs') clonedObj.set({
                left: targetX ?? (clonedObj.left + padding),
                top: targetY ?? (clonedObj.top + padding),
                id: isCut ? clipboard.id : uuidv4(),
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = this.canvas;
                clonedObj.forEachObject((obj: any) => {
                    obj.set('id', isCut ? obj.id : uuidv4());
                    this.canvas.add(obj);
                    if (obj.dblclick) {
                        obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                    }
                });
            } else {
                if (clonedObj.superType === 'node') {
                    clonedObj = clonedObj.duplicate();
                }
                // todo
                if (clonedObj.type === 'videojs') {

                    let pasteOption = this.pasteNewOption(clonedObj, targetX, targetY, isCut, clipboard.id, padding);
                    let newClonedObj = this.addVideoJS(pasteOption);
                    this.canvas.add(newClonedObj);
                }
                if (clipboard.type !== 'videojs') this.canvas.add(clonedObj);
                if (clonedObj.dblclick) {
                    clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
            }
            const newClipboard = clipboard.set({
                top: clonedObj.top,
                left: clonedObj.left,
            });
            if (isCut) {
                this.clipboard = null;
            } else {
                this.clipboard = newClipboard;
            }
            if (clonedObj.superType === 'node') {
                this.portHandler.create(clonedObj);
            }

            this.transactionHandler.save('paste');

            // TODO...
            // After toGroup svg elements not rendered.
            this.objects = this.getCanvasObjects();
            if (onAdd) {
                onAdd(clonedObj);
            }
            clonedObj.setCoords();
            this.canvas.setActiveObject(clonedObj);
            this.canvas.requestRenderAll();
        }, propertiesToInclude);
        return true;
    };

    /**
     * Load the image
     * @param {FabricImage} obj
     * @param {string} src
     * @param callback
     */
    public loadImage = (obj: FabricImage, src?: string, callback?: () => void) => {
        let url = src;
        if (!url) {
            url = './transparentBg.png';
        }
        fabric.util.loadImage(url, source => {
            if (obj.type !== 'image') {
                obj.set(
                    'fill',
                    new fabric.Pattern({
                        source,
                        repeat: 'repeat',
                    }),
                );
                obj.setCoords();
                this.canvas.renderAll();
                return;
            }
            obj.setElement(source);
            obj.setCoords();
            this.canvas.renderAll();

            if (callback) {
                callback()
            }
        });
    };

    /**
     * Find object by object
     * @param {FabricObject} obj
     */
    public find = (obj?: FabricObject) => this.findById(obj?.id);

    /**
     * Find object by id
     * @param {string} id
     * @returns {(FabricObject | null)}
     */
    public findById = (id?: string): FabricObject | undefined => {
        let findObject = undefined;
        const exist = this.objects.some(obj => {
            if (obj.id === id) {
                findObject = obj;
                return true;
            }
            return false;
        });
        if (!exist) {
            console.error('Not found object by id.');
            return undefined;
        }
        return findObject;
    };

    /**
     * Find object in origin list
     * @param {string} id
     * @returns
     */
    public findOriginById = (id: string): FabricObject | null => {
        let findObject: FabricObject | null = null;
        const exist = this.objects.some(obj => {
            if (obj.id === id) {
                findObject = obj;
                return true;
            }
            return false;
        });
        if (!exist) {
            console.warn('Not found object by id.');
            return null;
        }
        return findObject;
    };

    /**
     * Return origin object list
     * @param {string} id
     * @returns
     */
    public findOriginByIdWithIndex = (id: string) => {
        let findObject;
        let index = -1;
        const exist = this.objects.some((obj, i) => {
            if (obj.id === id) {
                findObject = obj;
                index = i;
                return true;
            }
            return false;
        });
        if (!exist) {
            console.warn('Not found object by id.');
            return {};
        }
        return {
            object: findObject,
            index,
        };
    };

    /**
     * Select object
     * @param {FabricObject} obj
     * @param {boolean} [find]
     */
    public select = (obj: FabricObject | undefined, find?: boolean) => {
        let findObject = obj;
        if (find) {
            findObject = this.find(obj);
        }
        if (findObject) {
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(findObject);
            this.canvas.requestRenderAll();
        }
    };

    /**
     * Select by id
     * @param {string} id
     */
    public selectById = (id: string) => {
        const findObject = this.findById(id);
        if (findObject) {
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(findObject);
            this.canvas.requestRenderAll();
        }
    };

    /**
     * Select all
     * @returns
     */
    public selectAll = () => {
        this.canvas.discardActiveObject();
        const filteredObjects = this.canvas.getObjects().filter((obj: any) => {
            if (obj.id === 'workarea') {
                return false;
            } else if (!obj.evented) {
                return false;
            } else if (obj.superType === 'link') {
                return false;
            } else if (obj.superType === 'port') {
                return false;
            } else if (obj.superType === 'element') {
                return false;
            } else if (obj.locked) {
                return false;
            }
            return true;
        });
        if (!filteredObjects.length) {
            return;
        }
        if (filteredObjects.length === 1) {
            this.canvas.setActiveObject(filteredObjects[0]);
            this.canvas.renderAll();
            return;
        }
        const activeSelection = new fabric.ActiveSelection(filteredObjects, {
            canvas: this.canvas,
            ...this.activeSelectionOption,
        });
        this.canvas.setActiveObject(activeSelection);
        this.canvas.renderAll();
    };

    /**
     * Save origin width, height
     * @param {FabricObject} obj
     * @param {number} width
     * @param {number} height
     */
    public originScaleToResize = (obj: FabricObject, width: number, height: number) => {
        if (obj.id === 'workarea') {
            this.setByPartial(obj, {
                workareaWidth: obj.width,
                workareaHeight: obj.height,
            });
        }
        this.setByPartial(obj, {
            scaleX: width / obj.width!,
            scaleY: height / obj.height!,
        });
    };

    /**
     * When set the width, height, Adjust the size
     * @param {number} width
     * @param {number} height
     */
    public scaleToResize = (width: number, height: number) => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        const {id} = activeObject;
        const obj = {
            id,
            scaleX: width / activeObject.width!,
            scaleY: height / activeObject.height!,
        };
        this.setObject(obj);
        activeObject.setCoords();
        this.canvas.requestRenderAll();
    };

    /**
     * Import json
     * @param {*} json
     * @param {(canvas: FabricCanvas) => void} [callback]
     */
    public importJSON = async (json: any, callback?: (canvas: FabricCanvas) => void) => {
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }
        let prevLeft = 0;
        let prevTop = 0;
        this.canvas.setBackgroundColor(this.canvasOption?.backgroundColor!, this.canvas.renderAll.bind(this.canvas));
        const workarea = json.find((obj: FabricObjectOption) => obj.id === 'workarea');
        if (workarea) {
            prevLeft = workarea.left;
            prevTop = workarea.top;
            this.workarea.set(workarea);
            await this.workareaHandler.setImage(workarea.src, true);
            this.workarea.setCoords();

        } else {

            this.canvas.centerObject(this.workarea);
            this.workarea.setCoords();

            prevLeft = this.workarea.left ?? 0;
            prevTop = this.workarea.top ?? 0;
        }

        json.forEach((obj: FabricObjectOption) => {
            if (obj.id === 'workarea') {
                return;
            }
            const canvasWidth = this.canvas.getWidth();
            const canvasHeight = this.canvas.getHeight();
            const {width, height, scaleX, scaleY, layout, left, top} = this.workarea;

            if (layout === 'fullscreen') {
                const leftRatio = canvasWidth / (width! * scaleX!);
                const topRatio = canvasHeight / (height! * scaleY!);
                if (obj.left && obj.top && obj.scaleX && obj.scaleY) {
                    obj.left *= leftRatio;
                    obj.top *= topRatio;
                    obj.scaleX *= leftRatio;
                    obj.scaleY *= topRatio;
                }
            } else {

                const diffLeft = left! - prevLeft;
                const diffTop = top! - prevTop;
                if (obj.left && obj.top) {
                    obj.left += diffLeft;
                    obj.top += diffTop;
                }
            }
            if (obj.superType === 'element') {
                obj.id = uuidv4();
            }
            this.add(obj, false, true);
            this.canvas.renderAll();
        });

        this.objects = this.getCanvasObjects();

        if (callback) {
            callback(this.canvas);
        }

        return Promise.resolve(this.canvas);
    };

    /**
     * Export json
     */
    public exportJSON = () => this.canvas.toObject(this.propertiesToInclude).objects as FabricObject[];

    /**
     * Active selection to group
     * @returns
     */
    public toGroup = (target?: FabricObject) => {
        const activeObject = target || (this.canvas.getActiveObject() as fabric.ActiveSelection);
        if (!activeObject) {
            return null;
        }
        if (activeObject.type !== 'activeSelection') {
            return null;
        }
        const group = activeObject.toGroup() as FabricObject<fabric.Group>;
        group.set({
            id: uuidv4(),
            name: 'New group',
            type: 'group',
            ...this.objectOption,
        });
        this.objects = this.getCanvasObjects();
        this.transactionHandler.save('group');
        if (this.onSelect) {
            this.onSelect([group]);
        }
        this.canvas.renderAll();
        return group;
    };

    /**
     * Group to active selection
     * @returns
     */
    public toActiveSelection = (target?: FabricObject) => {
        const activeObject = target || (this.canvas.getActiveObject() as fabric.Group);
        if (!activeObject) {
            return;
        }
        if (activeObject.type !== 'group') {
            return;
        }
        const activeSelection = activeObject.toActiveSelection();
        this.objects = this.getCanvasObjects();
        this.transactionHandler.save('ungroup');
        if (this.onSelect) {
            this.onSelect(activeSelection);
        }
        this.canvas.renderAll();
        return activeSelection;
    };

    /**
     * Bring forward
     */
    public bringForward = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            this.canvas.bringForward(activeObject);
            this.transactionHandler.save('bringForward');
            const {onModified} = this;
            if (onModified) {
                onModified(activeObject);
            }
        }
    };

    /**
     * Bring to front
     */
    public bringToFront = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }

        if (Handler.isMultiObject(activeObject)) {

            const allObjects = this.canvas.getObjects();

            let groupOfObjects = activeObject._objects;

            // sort the objects by its actual index, order in ascending
            groupOfObjects.sort(function (a: FabricObject, b: FabricObject) {
                // @ts-ignore
                return allObjects.findIndex((each) => each.id === a.id) - allObjects.findIndex((each) => each.id === b.id)
            });

            for (const g of groupOfObjects) {
                this.canvas.bringToFront(g);
            }

        } else {

            this.canvas.bringToFront(activeObject);
        }

        this.transactionHandler.save('bringToFront');
        const {onModified} = this;
        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * move a single object backwards, must be in front of grid
     * return false if no move actually happens
     *
     * @param object
     * @private
     */
    private sendOneObjectBackwards(object: FabricObject): boolean {
        const firstObject = this.canvas.getObjects()[0] as FabricObject;
        if (firstObject.id === object.id) {
            return false;
        }

        // cannot be under grid
        const allObjects = this.canvas.getObjects();
        // @ts-ignore
        const index = allObjects.findIndex((o) => o.id === object.id);
        if (index > 0 && Handler.isNoneVisibleObject(allObjects[index - 1])) {
            return false;
        }

        this.canvas.sendBackwards(object);
        return true;
    }

    private static isNoneVisibleObject(obj: FabricObject) {
        return !obj.id || obj.id === 'grid' || obj.id === 'workarea' || obj.id === 'port';
    }

    /**
     * Send backwards
     * @returns
     */
    public sendBackwards = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) return;

        if (Handler.isMultiObject(activeObject)) {
            // handle multi object
            const allObjects = this.canvas.getObjects();

            let groupOfObjects = activeObject._objects;

            // sort the objects by its actual index, order in ascending
            groupOfObjects.sort(function (a: FabricObject, b: FabricObject) {
                // @ts-ignore
                return allObjects.findIndex((each) => each.id === a.id) - allObjects.findIndex((each) => each.id === b.id)
            });

            for (const g of groupOfObjects) {
                const moved = this.sendOneObjectBackwards(g);
                if (!moved) {
                    return;
                }
            }
        } else {
            // handle single object
            const moved = this.sendOneObjectBackwards(activeObject);
            if (!moved) {
                return;
            }
        }

        this.transactionHandler.save('sendBackwards');
        const {onModified} = this;
        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * send one object to back, but in front of grid
     * return false if no move actually happens
     *
     * @param object
     * @private
     */
    private sendOneObjectToBack(object: FabricObject): boolean {
        // cannot be under grid
        const allObjects = this.canvas.getObjects();

        // @ts-ignore
        let index = allObjects.findIndex((o) => o.id === object.id);
        const originIndex = index;
        // @ts-ignore
        while (index > 0 && allObjects[index - 1].id !== 'grid') {
            index -= 1;
        }

        if (originIndex === index) {
            return false;
        }
        object.moveTo(index);
        return true;
    }

    private static isMultiObject(object: FabricObject) {
        return object._objects && (object._objects.length > 0);
    }

    /**
     * Send to back
     */
    public sendToBack = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) return;

        if (Handler.isMultiObject(activeObject)) {
            // handle multi object
            const allObjects = this.canvas.getObjects();

            let groupOfObjects = activeObject._objects;

            // sort the objects by its actual index, order in descending
            groupOfObjects.sort(function (b: FabricObject, a: FabricObject) {
                // @ts-ignore
                return allObjects.findIndex((each) => each.id === a.id) - allObjects.findIndex((each) => each.id === b.id)
            });

            for (const g of groupOfObjects) {
                this.sendOneObjectToBack(g);
            }
        } else {
            // handle single object
            const moved = this.sendOneObjectToBack(activeObject);
            if (!moved) {
                return;
            }
        }

        this.transactionHandler.save('sendToBack');
        const {onModified} = this;

        if (onModified) {
            onModified(activeObject);
        }
    };

    /**
     * Clear canvas
     * @param {boolean} [includeWorkarea=false]
     */
    public clear = (includeWorkarea = false) => {
        const ids = this.canvas.getObjects().reduce((prev, curr: any) => {
            if (curr.superType === 'element') {
                // @ts-ignore
                prev.push(curr.id);
                return prev;
            }
            return prev;
        }, []);
        this.elementHandler.removeByIds(ids);
        if (includeWorkarea) {
            this.canvas.clear();
            /// TODO: workarea
            // this.workarea = null;
        } else {
            this.canvas.discardActiveObject();
            this.canvas.getObjects().forEach((obj: any) => {
                if (obj.id === 'grid' || obj.id === 'workarea') {
                    return;
                }
                this.canvas.remove(obj);
            });
        }
        this.objects = this.getCanvasObjects();
        this.canvas.renderAll();
    };

    /**
     * Start request animation frame
     */
    public startRequestAnimFrame = () => {
        if (!this.isRequestAnimFrame) {
            this.isRequestAnimFrame = true;
            const render = () => {
                this.canvas.renderAll();
                this.requestFrame = fabric.util.requestAnimFrame(render);
            };
            fabric.util.requestAnimFrame(render);
        }
    };

    /**
     * Stop request animation frame
     */
    public stopRequestAnimFrame = () => {
        this.isRequestAnimFrame = false;
        const cancelRequestAnimFrame = (() =>
            window.cancelAnimationFrame ||
            // || window.webkitCancelRequestAnimationFrame
            // || window.mozCancelRequestAnimationFrame
            // || window.oCancelRequestAnimationFrame
            // || window.msCancelRequestAnimationFrame
            clearTimeout)();
        cancelRequestAnimFrame(this.requestFrame);
    };

    /**
     * Save target object as image
     * @param {FabricObject} targetObject
     * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
     */
    public saveImage = (targetObject: FabricObject, option = {name: 'New Image', format: 'png', quality: 1}) => {
        let dataUrl;
        let target = targetObject;
        if (target) {
            dataUrl = target.toDataURL(option);
        } else {
            target = this.canvas.getActiveObject() as FabricObject;
            if (target) {
                dataUrl = target.toDataURL(option);
            }
        }
        if (dataUrl) {
            const anchorEl = document.createElement('a');
            anchorEl.href = dataUrl;
            anchorEl.download = `${option.name}.png`;
            document.body.appendChild(anchorEl); // required for firefox
            anchorEl.click();
            anchorEl.remove();
        }
    };

    /**
     * Save canvas as image
     * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
     */
    public saveCanvasImage = (option = {name: 'New Image', format: 'png', quality: 1}) => {
        const dataUrl = this.canvas.toDataURL(option);
        if (dataUrl) {
            const anchorEl = document.createElement('a');
            anchorEl.href = dataUrl;
            anchorEl.download = `${option.name}.png`;
            document.body.appendChild(anchorEl); // required for firefox
            anchorEl.click();
            anchorEl.remove();
        }
    };

    /**
     * Sets "angle" of an instance with centered rotation
     *
     * @param {number} angle
     */
    public rotate = (angle: number) => {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.set('rotation', angle);
            activeObject.rotate(angle);
            this.canvas.requestRenderAll();
        }
    };

    /**
     * Destroy canvas
     *
     */
    public destroy = () => {
        this.eventHandler.destroy();
        this.guidelineHandler.destroy();
        this.contextmenuHandler.destory();
        this.tooltipHandler.destroy();
        this.clear(true);
    };

    /**
     * Set canvas option
     *
     * @param {CanvasOption} canvasOption
     */
    public setCanvasOption = (canvasOption: CanvasOption) => {
        this.canvasOption = Object.assign({}, filterObject(this.canvasOption), filterObject(canvasOption));
        // @ts-ignore
        this.canvas.setBackgroundColor(canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        if (typeof canvasOption.width !== 'undefined' && typeof canvasOption.height !== 'undefined') {

            if (this.eventHandler) {
                this.eventHandler.resize(canvasOption.width, canvasOption.height);
            } else {
                this.canvas.setWidth(canvasOption.width).setHeight(canvasOption.height);
            }
        }
        if (typeof canvasOption.selection !== 'undefined') {
            this.canvas.selection = canvasOption.selection;
        }
        if (typeof canvasOption.hoverCursor !== 'undefined') {
            this.canvas.hoverCursor = canvasOption.hoverCursor;
        }
        if (typeof canvasOption.defaultCursor !== 'undefined') {
            this.canvas.defaultCursor = canvasOption.defaultCursor;
        }
        if (typeof canvasOption.preserveObjectStacking !== 'undefined') {
            this.canvas.preserveObjectStacking = canvasOption.preserveObjectStacking;
        }
    };

    /**
     * Set keyboard event
     *
     * @param {KeyEvent} keyEvent
     */
    public setKeyEvent = (keyEvent: KeyEvent) => {
        this.keyEvent = Object.assign({}, filterObject(this.keyEvent), filterObject(keyEvent));
    };

    /**
     * Set fabric objects
     *
     * @param {FabricObjects} fabricObjects
     */
    public setFabricObjects = (fabricObjects: FabricObjects) => {
        this.fabricObjects = Object.assign({}, filterObject(this.fabricObjects), filterObject(fabricObjects));
    };

    /**
     * Set workarea option
     *
     * @param {WorkareaOption} workareaOption
     */
    public setWorkareaOption = (workareaOption: WorkareaOption) => {
        this.workareaOption = Object.assign({}, filterObject(this.workareaOption), filterObject(workareaOption));
        if (this.workarea) {
            this.workarea.set({
                ...workareaOption,
            });
        }
    };

    /**
     * Set guideline option
     *
     * @param {GuidelineOption} guidelineOption
     */
    public setGuidelineOption = (guidelineOption: GuidelineOption) => {
        this.guidelineOption = Object.assign({}, filterObject(this.guidelineOption), filterObject(guidelineOption));
        if (this.guidelineHandler) {
            this.guidelineHandler.initialize();
        }
    };

    /**
     * Set grid option
     *
     * @param {GridOption} gridOption
     */
    public setGridOption = (gridOption: GridOption) => {
        this.gridOption = Object.assign({}, filterObject(this.gridOption), filterObject(gridOption));
    };

    /**
     * Set object option
     *
     * @param {FabricObjectOption} objectOption
     */
    public setObjectOption = (objectOption: FabricObjectOption) => {
        this.objectOption = Object.assign({}, filterObject(this.objectOption), filterObject(objectOption));
    };

    /**
     * Set activeSelection option
     *
     * @param {Partial<FabricObjectOption<fabric.ActiveSelection>>} activeSelectionOption
     */
    public setActiveSelectionOption = (activeSelectionOption: Partial<FabricObjectOption<fabric.ActiveSelection>>) => {
        this.activeSelectionOption = Object.assign({}, filterObject(this.activeSelectionOption), filterObject(activeSelectionOption));
    };

    /**
     * Set propertiesToInclude
     *
     * @param {string[]} propertiesToInclude
     */
    public setPropertiesToInclude = (propertiesToInclude: string[]) => {
        this.propertiesToInclude = union(propertiesToInclude, this.propertiesToInclude);
    };

    /**
     * Register custom handler
     *
     * @param {string} name
     * @param {typeof CustomHandler} handler
     */
    public registerHandler = (name: string, handler: typeof CustomHandler) => {
        this.handlers[name] = new handler(this);
        return this.handlers[name];
    };


    /**
     * To found is there any objects in the private clipboard
     *
     * author: Tom
     *
     */
    public hasObjectsInClipboard = () => {
        return this.clipboard != null;
    }

    /**
     * For some specific widgets which cannot duplicate
     * needs to copy paste all options and add again
     * e.g. videoJS
     *
     * @param clonedObj
     * @param targetX
     * @param targetY
     * @param isCut
     * @param id
     * @param padding
     */
    public pasteNewOption = (clonedObj: FabricObject, targetX: number | undefined, targetY: number | undefined, isCut: boolean, id: string, padding: number) => {
        let newOption = {} as FabricObject;
        let propertyList = ["scaleX",
            "scaleY",
            "rotation",
            "angle",
            "centeredRotation",
            "strokeUniform",
            // "id",
            "superType",
            // "left",
            // "top",
            "selectable",
            "type",
            "src",
            "width",
            "height",
            "autoplay",
            "muted",
            "loop",
            "container",
            "editable",
            "hasControls",
            "hasBorders",
            "lockMovementX",
            "lockMovementY",
            "hoverCursor",]
        Object.keys(clonedObj).forEach(key => {
            if (propertyList.includes(key)) newOption[`${key}`] = clonedObj[key]
        })
        newOption.left = targetX ?? ((clonedObj.left ?? 0) + padding);
        newOption.top = targetY ?? ((clonedObj.top ?? 0) + padding);
        newOption.id = isCut ? id : uuidv4();
        newOption.evented = true;
        return newOption;
    }

    getElementStyle(obj: FabricObject) {
        if (obj.superType !== 'element') {
            return undefined;
        }

        const {element} = obj;
        if (!element) {
            return undefined;
        }

        return element.style;
    }
}

export default Handler;