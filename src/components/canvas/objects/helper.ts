import {fabric} from "fabric";
import {IFilter} from "../handlers/ImageHandler";

export interface FabricCanvasOption {
    wrapperEl?: HTMLElement;
}

export type FabricImage = FabricObject &
    fabric.Image & {
    /**
     * Image URL
     * @type {string}
     */
    src?: string;
    /**
     * Image File or Blob
     * @type {File}
     */
    file?: File;
    /**
     * Image Filter
     * @type {IFilter[]}
     */
    filters?: IFilter[];
    _element?: any;
};

export interface FabricElement extends FabricObject<fabric.Rect> {
    /**
     * Wrapped Element
     * @type {HTMLDivElement}
     */
    container: HTMLDivElement;
    /**
     * Target Element
     * @type {HTMLDivElement}
     */
    element: HTMLDivElement;
    /**
     * Source of Element Object
     */
    setSource: (source: any) => void;
}

export type FabricCanvas<T extends any = fabric.Canvas> = T & FabricCanvasOption;

export interface FabricEvent<T extends any = Event> extends Omit<fabric.IEvent, 'e'> {
    e: T;
    target?: FabricObject;
    subTargets?: FabricObject[];
    button?: number;
    isClick?: boolean;
    pointer?: fabric.Point;
    absolutePointer?: fabric.Point;
    transform?: { corner: string; original: FabricObject; originX: string; originY: string; width: number };
}

export type FabricObject<T extends any = fabric.Object> = T & FabricObjectOption;

export type InteractionMode = 'selection' | 'grab' | 'polygon' | 'line' | 'arrow' | 'link' | 'crop';

export type FabricObjectOption<T extends any = fabric.IObjectOptions> = T & {
    /**
     * Object id
     * @type {string}
     */
    id?: string;
    /**
     * Parent object id
     * @type {string}
     */
    parentId?: string;
    /**
     * Original opacity
     * @type {number}
     */
    originOpacity?: number;
    /**
     * Original top position
     * @type {number}
     */
    originTop?: number;
    /**
     * Original left position
     * @type {number}
     */
    originLeft?: number;
    /**
     * Original scale X
     * @type {number}
     */
    originScaleX?: number;
    /**
     * Original scale Y
     * @type {number}
     */
    originScaleY?: number;
    /**
     * Original angle
     * @type {number}
     */
    originAngle?: number;
    /**
     * Original fill color
     *
     * @type {(string | fabric.Pattern | fabric.Gradient)}
     */
    originFill?: string | fabric.Pattern | fabric.Gradient;
    /**
     * Original stroke color
     * @type {string}
     */
    originStroke?: string;
    /**
     * Original rotation
     *
     * @type {number}
     */
    originRotation?: number;
    /**
     * Object editable
     * @type {boolean}
     */
    editable?: boolean;
    /**
     * Object Super type
     * @type {string}
     */
    superType?: string;
    /**
     * @description
     * @type {string}
     */
    description?: string;
    /**
     * Animation property
     * @type {AnimationProperty}
     */
    animation?: AnimationProperty;
    /**
     * Tooltip property
     * @type {TooltipProperty}
     */
    tooltip?: TooltipProperty;
    /**
     * Link property
     * @type {LinkProperty}
     */
    link?: LinkProperty;
    /**
     * Is running animation
     * @type {boolean}
     */
    animating?: boolean;
    /**
     * Object class
     * @type {string}
     */
    class?: string;
    /**
     * Is possible delete
     * @type {boolean}
     */
    deletable?: boolean;
    /**
     * Is enable double click
     * @type {boolean}
     */
    dblclick?: boolean;
    /**
     * Is possible clone
     * @type {boolean}
     */
    cloneable?: boolean;
    /**
     * Is locked object
     * @type {boolean}
     */
    locked?: boolean;
    /**
     * This property replaces "angle"
     *
     * @type {number}
     */
    rotation?: number;
    /**
     * Whether it can be clicked
     *
     * @type {boolean}
     */
    clickable?: boolean;
    [key: string]: any;
};

export type AnimationType = 'fade' | 'bounce' | 'shake' | 'scaling' | 'rotation' | 'flash' | 'custom' | 'none';

export interface AnimationProperty {
    delay?: number;
    duration?: number;
    autoplay?: boolean;
    loop?: boolean | number;
    type: AnimationType;
    offset?: number;
    opacity?: number;
    bounce?: 'vertical' | 'horizontal';
    shake?: 'vertical' | 'horizontal';
    scale?: number;
    angle?: number;
    fill?: string | fabric.Pattern;
    stroke?: string;
}

export interface LinkProperty {
    enabled?: boolean;
    type?: string;
    state?: string;

    [key: string]: any;
}

export interface TooltipProperty {
    enabled?: boolean;
    type?: string;
    template?: string;
}

export type FabricGroup = FabricObject<fabric.Group> & {
    /**
     * Object that config group
     * @type {FabricObject[]}
     */
    objects?: FabricObject[];
};

/**
 * toObject util
 * @param {*} obj
 * @param {string[]} propertiesToInclude
 * @param {{ [key: string]: any }} [properties]
 */
export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) =>
    fabric.util.object.extend(
        obj.callSuper('toObject'),
        propertiesToInclude.reduce(
            (prev, property) =>
                Object.assign(prev, {
                    [property]: obj.get(property),
                }),
            Object.assign({}, properties),
        ),
    );

export function getPixelsByAngle(x: number, y: number, width: number, height: number, angle: number) {
    if (angle === 0) {
        return [
            [x, y],
            [x + width, y],
            [x + width, y + height],
            [x, y + height]
        ]
    }

    const radians = angle * Math.PI / 180;
    return [
        //upper left
        [x + width / 2 + width / -2 * Math.cos(radians) - height / -2 * Math.sin(radians), y + height / 2 + width / -2 * Math.sin(radians) + height / -2 * Math.cos(radians)],
        //upper right
        [x + width / 2 + width / 2 * Math.cos(radians) - height / -2 * Math.sin(radians), y + height / 2 + width / 2 * Math.sin(radians) + height / -2 * Math.cos(radians)],
        //bottom right
        [x + width / 2 + width / 2 * Math.cos(radians) - height / 2 * Math.sin(radians), y + height / 2 + width / 2 * Math.sin(radians) + height / 2 * Math.cos(radians)],
        //bottom left
        [x + width / 2 + width / -2 * Math.cos(radians) - height / 2 * Math.sin(radians), y + height / 2 + width / -2 * Math.sin(radians) + height / 2 * Math.cos(radians)],
    ];
}