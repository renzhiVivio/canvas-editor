import {FabricCanvas, FabricObject, FabricObjectOption, InteractionMode} from "../objects/helper";
import CustomHandler from "./CustomHandler";
import Handler from "./Handler";

export type HandlerOptions = HandlerOption & HandlerCallback;

export interface HandlerCallback {
    /**
     * When has been added object in Canvas, Called function
     *
     */
    onAdd?: (object: FabricObject) => void;
    /**
     * Return contextmenu element
     *
     */
    onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any> | any;
    /**
     * Return tooltip element
     *
     */
    onTooltip?: (el: HTMLDivElement, target?: FabricObject) => Promise<any> | any;
    /**
     * When zoom, Called function
     */
    onZoom?: (zoomRatio: number) => void;
    /**
     * When clicked object, Called function
     *
     */
    onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    /**
     * When double clicked object, Called function
     *
     */
    onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    /**
     * When modified object, Called function
     */
    onModified?: (target: FabricObject) => void;
    /**
     * When select object, Called function
     *
     */
    onSelect?: (target?: FabricObject[]) => void;
    /**
     * When has been removed object in Canvas, Called function
     *
     */
    onRemove?: (target: FabricObject) => void;
    /**
     * When canvas has been loaded
     *
     */
    onLoad?: (handler: Handler, canvas?: fabric.Canvas) => void;
}

export interface HandlerOption {
    /**
     * Canvas id
     * @type {string}
     */
    id?: string;
    /**
     * Canvas object
     * @type {FabricCanvas}
     */
    canvas?: FabricCanvas;
    /**
     * Canvas parent element
     * @type {HTMLDivElement}
     */
    container?: HTMLDivElement;
    /**
     * Canvas editable
     * @type {boolean}
     */
    editable?: boolean;
    /**
     * Canvas interaction mode
     * @type {InteractionMode}
     */
    interactionMode?: InteractionMode;
    /**
     * Persist properties for object
     * @type {string[]}
     */
    propertiesToInclude?: string[];
    /**
     * Minimum zoom ratio
     * @type {number}
     */
    minZoom?: number;
    /**
     * Maximum zoom ratio
     * @type {number}
     */
    maxZoom?: number;
    /**
     * Canvas option
     * @type {CanvasOption}
     */
    canvasOption?: CanvasOption;
    /**
     * Grid option
     * @type {GridOption}
     */
    gridOption?: GridOption;
    /**
     * Default option for Fabric Object
     * @type {FabricObjectOption}
     */
    objectOption?: FabricObjectOption;
    /**
     * Guideline option
     * @type {GuidelineOption}
     */
    guidelineOption?: GuidelineOption;
    /**
     * Whether to use zoom
     * @type {boolean}
     */
    zoomEnabled?: boolean;
    /**
     * ActiveSelection option
     * @type {Partial<FabricObjectOption<fabric.ActiveSelection>>}
     */
    activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>>;
    /**
     * Canvas width
     * @type {number}
     */
    width?: number;
    /**
     * Canvas height
     * @type {number}
     */
    height?: number;
    /**
     * Keyboard event in Canvas
     * @type {KeyEvent}
     */
    keyEvent?: KeyEvent;
    /**
     * Append custom objects
     * @type {{ [key: string]: any }}
     */
    fabricObjects?: FabricObjects;
    handlers?: { [key: string]: CustomHandler };

    [key: string]: any;
}

export type FabricObjects = {
    [key: string]: {
        create: (...args: any) => FabricObject;
    };
};

export interface KeyEvent {
    /**
     * Arrow key
     * @type {boolean}
     */
    move?: boolean;
    /**
     * Ctrl + A
     * @type {boolean}
     */
    all?: boolean;
    /**
     * Ctrl + C
     * @type {boolean}
     */
    copy?: boolean;
    /**
     * Ctrl + P
     * @type {boolean}
     */
    paste?: boolean;
    /**
     * Escape
     * @type {boolean}
     */
    esc?: boolean;
    /**
     * Delete or Backspace
     * @type {boolean}
     */
    del?: boolean;
    /**
     * When have copied object, whether should copy object option on clipboard
     * @type {boolean}
     */
    clipboard?: boolean;
    /**
     * Ctrl + Z, Ctrl + Y
     * @type {boolean}
     */
    transaction?: boolean;
    /**
     * Plus, Minus
     *
     * @type {boolean}
     */
    zoom?: boolean;
    /**
     * Ctrl + X
     *
     * @type {boolean}
     */
    cut?: boolean;
    grab?: boolean;
}

export interface CanvasOption extends fabric.ICanvasOptions {
    /**
     * Unique id of Canvas
     * @type {string}
     */
    id?: string;
}

export interface GridOption {
    /**
     * Whether should be enabled
     * @type {boolean}
     */
    enabled?: boolean;
    /**
     * Grid interval
     * @type {number}
     */
    grid?: number;
    /**
     * When had moved object, whether should adjust position on grid interval
     * @type {boolean}
     */
    snapToGrid?: boolean;
    /**
     * Grid line color
     *
     * @type {string}
     */
    lineColor?: string;
    /**
     * Grid border color
     *
     * @type {string}
     */
    borderColor?: string;
}

export interface GuidelineOption {
    /**
     * When have moved object, whether should show guideline
     * @type {boolean}
     */
    enabled?: boolean;
}