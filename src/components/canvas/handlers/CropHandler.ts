import {fabric} from 'fabric';

import Handler from './Handler';
import {FabricImage, FabricObject} from "../objects/helper";

class CropHandler {
    handler: Handler;
    cropRect?: fabric.Rect;
    cropObject?: FabricImage;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * Validate crop type
     *
     * @returns
     */
    public validType = () => {
        const activeObject = this.handler.canvas.getActiveObject();
        if (!activeObject) {
            return false;
        }
        return activeObject.type === 'image';
    };

    /**
     * Start crop image
     *
     */
    public start = () => {
        if (this.validType()) {
            this.handler.interactionMode = 'crop';
            this.cropObject = this.handler.canvas.getActiveObject() as FabricImage;
            const {left, top} = this.cropObject;
            this.cropRect = new fabric.Rect({
                width: this.cropObject.width,
                height: this.cropObject.height,
                scaleX: this.cropObject.scaleX,
                scaleY: this.cropObject.scaleY,
                originX: 'left',
                originY: 'top',
                left,
                top,
                fill: 'rgba(0, 0, 0, 0.2)',
            });
            this.cropRect.setControlsVisibility({mtr: false});
            this.handler.canvas.add(this.cropRect);
            this.handler.canvas.setActiveObject(this.cropRect);
            this.cropObject.selectable = false;
            this.cropObject.evented = false;
            this.handler.canvas.renderAll();
        }
    };

    /**
     * Finish crop image
     *
     */
    public finish = () => {
        if (this.cropRect && this.cropObject) {
            this.crop(this.cropRect, this.cropObject);
            this.handler.transactionHandler.saveCropImage(this.cropRect, this.cropObject);
        }
        this.cancel();
    };

    public crop(cropRect: fabric.Rect, cropObject: FabricImage) {
        const {left, top, width, height, scaleX, scaleY} = cropRect;
        const croppedImg = cropObject.toDataURL({
            left: (left ?? 0) - (cropObject.left ?? 0),
            top: (top ?? 0) - (cropObject.top ?? 0),
            width: (width ?? 0) * (scaleX ?? 1),
            height: (height ?? 0) * (scaleY ?? 1),
        });
        this.handler.setImage(cropObject, croppedImg);
    }

    /**
     * Cancel crop
     *
     */
    public cancel = () => {
        this.handler.interactionMode = 'selection';
        if (this.cropObject) {
            this.cropObject.selectable = true;
            this.cropObject.evented = true;
            this.handler.canvas.setActiveObject(this.cropObject);
        }
        if (this.cropRect) {
            this.handler.canvas.remove(this.cropRect);
        }
        this.cropRect = undefined;
        this.cropObject = undefined;
        this.handler.canvas.renderAll();
    };

    /**
     * Resize crop
     *
     * @param {FabricEvent} opt
     */
    public resize = (opt: fabric.IEvent) => {
        const {
            target,
            // @ts-ignore
            transform: {original, corner},
        } = opt;

        if (!target || !this.cropObject) {
            return;
        }

        const {left, top, width, height, scaleX, scaleY} = target;
        const {
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
            scaleX: cropScaleX,
            scaleY: cropScaleY,
        } = this.cropObject;

        if (!cropLeft || !cropTop || !cropHeight || !cropWidth || !cropScaleX || !cropScaleY || !left || !top || !height || !width || !scaleX || !scaleY) {
            return;
        }

        if (corner === 'tl') {
            if (Math.round(cropLeft) > Math.round(left)) {
                // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - (originRight - targetRight) / cropWidth;
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) {
                // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - (originBottom - targetBottom) / cropHeight;
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'bl') {
            if (Math.round(cropLeft) > Math.round(left)) {
                // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - (originRight - targetRight) / cropWidth;
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop + cropHeight * cropScaleY) < Math.round(top + height * scaleY)) {
                // bottom
                const diffTopRatio = 1 - (original.top - cropTop) / cropHeight;
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'tr') {
            if (Math.round(cropLeft + cropWidth * cropScaleX) < Math.round(left + width * scaleX)) {
                // right
                const diffLeftRatio = 1 - (original.left - cropLeft) / cropWidth;
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) {
                // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - (originBottom - targetBottom) / cropHeight;
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'br') {
            if (Math.round(cropLeft + cropWidth * cropScaleX) < Math.round(left + width * scaleX)) {
                // right
                const diffLeftRatio = 1 - (original.left - cropLeft) / cropWidth;
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop + cropHeight * cropScaleY) < Math.round(top + height * scaleY)) {
                // bottom
                const diffTopRatio = 1 - (original.top - cropTop) / cropHeight;
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'ml') {
            if (Math.round(cropLeft) > Math.round(left)) {
                // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - (originRight - targetRight) / cropWidth;
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
        } else if (corner === 'mt') {
            if (Math.round(cropTop) > Math.round(top)) {
                // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - (originBottom - targetBottom) / cropHeight;
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'mb') {
            if (Math.round(cropTop + cropHeight * cropScaleY) < Math.round(top + height * scaleY)) {
                // bottom
                const diffTopRatio = 1 - (original.top - cropTop) / cropHeight;
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'mr') {
            if (Math.round(cropLeft + cropWidth * cropScaleX) < Math.round(left + width * scaleX)) {
                // right
                const diffLeftRatio = 1 - (original.left - cropLeft) / cropWidth;
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
        }
    };

    /**
     * Resize crop
     *
     * @param {FabricEvent} opt
     */
    public moving = (opt: fabric.IEvent) => {
        const {target} = opt;
        if (!target) {
            return;
        }

        const {left, top, width, height, scaleX, scaleY} = target;

        if (!left || !top || !height || !width || !scaleX || !scaleY) {
            return;
        }

        if (!this.cropObject) {
            return;
        }

        const {
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
        } = this.cropObject.getBoundingRect();

        const movedTop = () => {
            if (Math.round(cropTop) >= Math.round(top)) {
                target.set({
                    top: cropTop,
                });
            } else if (Math.round(cropTop + cropHeight) <= Math.round(top + height * scaleY)) {
                target.set({
                    top: cropTop + cropHeight - height * scaleY,
                });
            }
        };
        if (Math.round(cropLeft) >= Math.round(left)) {
            target.set({
                left: Math.max(left, cropLeft),
            });
            movedTop();
        } else if (Math.round(cropLeft + cropWidth) <= Math.round(left + width * scaleX)) {
            target.set({
                left: cropLeft + cropWidth - width * scaleX,
            });
            movedTop();
        } else if (Math.round(cropTop) >= Math.round(top)) {
            target.set({
                top: cropTop,
            });
        } else if (Math.round(cropTop + cropHeight) <= Math.round(top + height * scaleY)) {
            target.set({
                top: cropTop + cropHeight - height * scaleY,
            });
        }
    };

    public handleUndoRedo(found: FabricImage, replacedBy: FabricObject, rect: fabric.Rect, isUndo: boolean) {
        if (isUndo) {
            found.src = replacedBy.src;
            this.handler.setImage(found as FabricImage, found.src);
        } else {
            this.crop(rect, found as FabricImage);
        }
    }
}

export default CropHandler;
