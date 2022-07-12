import {FabricImage} from "./objects/helper";

export interface WorkareaOption {
    /**
     * Image URL
     * @type {string}
     */
    src?: string;
    /**
     * Image File or Blbo
     * @type {File}
     */
    file?: File;
    /**
     * Workarea Width
     * @type {number}
     */
    width?: number;
    /**
     * Workarea Height
     * @type {number}
     */
    height?: number;
    /**
     * Workarea Background Color
     * @type {string}
     */
    backgroundColor?: string;
    /**
     * Workarea Layout Type
     * @type {WorkareaLayout}
     */
    layout?: WorkareaLayout;
}

export type WorkareaObject = FabricImage & {
    /**
     * Workarea Layout Type
     * @type {WorkareaLayout}
     */
    layout?: WorkareaLayout;
    /**
     * Workarea Image Element
     * @type {HTMLImageElement}
     */
    _element?: HTMLImageElement;
    /**
     * Whether exist the element
     * @type {boolean}
     */
    isElement?: boolean;
    /**
     * Stored width in workarea
     * @type {number}
     */
    workareaWidth?: number;
    /**
     * Stored height in workarea
     * @type {number}
     */
    workareaHeight?: number;
};

export type WorkareaLayout = 'fixed' | 'responsive' | 'fullscreen';
