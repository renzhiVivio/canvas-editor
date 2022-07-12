import {fabric} from 'fabric';
import {FabricObject, InteractionMode} from '../objects/helper';
import Handler from './Handler';

type IReturnType = { selectable?: boolean; evented?: boolean } | boolean;

class InteractionHandler {
    handler: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
        if (this.handler.editable) {
            this.selection();
        }
    }

    /**
     * Change selection mode
     * @param {(obj: FabricObject) => IReturnType} [callback]
     */
    public selection = (callback?: (obj: FabricObject) => IReturnType) => {
        if (this.handler.interactionMode === 'selection') {
            return;
        }

        this.handler.interactionMode = 'selection';
        if (typeof this.handler.canvasOption?.selection === 'undefined') {
            this.handler.canvas.selection = true;
        } else {
            this.handler.canvas.selection = this.handler.canvasOption.selection;
        }
        this.handler.canvas.defaultCursor = 'default';
        this.handler.workarea.hoverCursor = 'default';
        this.handler.getCanvasObjects().forEach(obj => {
            if (callback) {
                this.interactionCallback(obj, callback);
            } else {
                // When typeof selection is ActiveSelection, ignoring selectable, because link position left: 0, top: 0
                if (obj.superType === 'link' || obj.superType === 'port') {
                    obj.selectable = false;
                    obj.evented = true;
                    obj.hoverCursor = 'pointer';
                    return;
                }
                if (this.handler.editable) {
                    obj.hoverCursor = 'move';
                } else {
                    obj.hoverCursor = 'pointer';
                }
                obj.selectable = true;
                obj.evented = true;
            }
        });
        this.handler.canvas.renderAll();
        this.handler.onInteraction?.('selection');
    };

    /**
     * Change grab mode
     * @param {(obj: FabricObject) => IReturnType} [callback]
     */
    public grab = (callback?: (obj: FabricObject) => IReturnType) => {
        if (this.handler.interactionMode === 'grab') {
            return;
        }
        this.handler.interactionMode = 'grab';
        this.handler.canvas.selection = false;
        this.handler.canvas.defaultCursor = 'grab';
        this.handler.workarea.hoverCursor = 'grab';
        this.handler.getCanvasObjects().forEach(obj => {
            if (callback) {
                this.interactionCallback(obj, callback);
            } else {
                obj.selectable = false;
                obj.evented = !this.handler.editable;
            }
        });
        this.handler.canvas.renderAll();
        this.handler.onInteraction?.('grab');
    };

    /**
     * Change drawing mode
     * @param {InteractionMode} [type]
     * @param {(obj: FabricObject) => IReturnType} [callback]
     */
    public drawing = (type?: InteractionMode, callback?: (obj: FabricObject) => IReturnType) => {
        if (this.isDrawingMode()) {
            return;
        }
        if (type) {
            this.handler.interactionMode = type;
        }
        this.handler.canvas.selection = false;
        this.handler.canvas.defaultCursor = 'pointer';
        this.handler.workarea.hoverCursor = 'pointer';
        this.handler.getCanvasObjects().forEach(obj => {
            if (callback) {
                this.interactionCallback(obj, callback);
            } else {
                obj.selectable = false;
                obj.evented = !this.handler.editable;
            }
        });
        this.handler.canvas.renderAll();
        this.handler.onInteraction?.(this.handler.interactionMode);
    };

    public linking = (callback?: (obj: FabricObject) => IReturnType) => {
        if (this.isDrawingMode()) {
            return;
        }
        this.handler.interactionMode = 'link';
        this.handler.canvas.selection = false;
        this.handler.canvas.defaultCursor = 'default';
        this.handler.workarea.hoverCursor = 'default';
        this.handler.getCanvasObjects().forEach(obj => {
            if (callback) {
                this.interactionCallback(obj, callback);
            } else {
                if (obj.superType === 'node' || obj.superType === 'port') {
                    obj.hoverCursor = 'pointer';
                    obj.selectable = false;
                    obj.evented = true;
                    return;
                }
                obj.selectable = false;
                obj.evented = !this.handler.editable;
            }
        });
        this.handler.canvas.renderAll();
        this.handler.onInteraction?.('link');
    };

    /**
     * Moving objects in grap mode
     * @param {MouseEvent} e
     */
    public moving = (e: MouseEvent) => {
        if (this.isDrawingMode()) {
            return;
        }
        const trans = this.handler.canvas.viewportTransform;
        if(trans ){
            const delta = new fabric.Point(e.movementX, e.movementY);
            this.handler.canvas.relativePan(delta);
            this.handler.canvas.requestRenderAll();
            this.handler.objects.forEach(obj => {
                if (obj.superType === 'element') {
                    const {id} = obj;
                    const el = this.handler.elementHandler.findById(id!);
                    // update the element
                    this.handler.elementHandler.setPosition(el!, obj);
                }
            });
        }
    };

    /**
     * Whether is drawing mode
     * @returns
     */
    public isDrawingMode = () => {
        return (
            this.handler.interactionMode === 'link' ||
            this.handler.interactionMode === 'arrow' ||
            this.handler.interactionMode === 'line' ||
            this.handler.interactionMode === 'polygon'
        );
    };

    /**
     * Interaction callback
     *
     * @param {FabricObject} obj
     * @param {(obj: FabricObject) => void} [callback]
     */
    private interactionCallback = (obj: FabricObject, callback?: (obj: FabricObject) => void) => {
        if (callback) {
            callback(obj);
        }
    };
}

export default InteractionHandler;
