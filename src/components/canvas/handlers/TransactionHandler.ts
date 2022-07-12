import {fabric} from 'fabric';
import throttle from 'lodash/throttle';

import Handler from './Handler';
import {NodeObject} from '../objects/Node';
import {LinkObject} from '../objects/Link';
import {FabricCanvas, FabricImage, FabricObject} from "../objects/helper";
import deepCompare from "../utils/deepCompare";
import _ from 'lodash';


export type TransactionType =
    | 'add'
    | 'remove'
    | 'moved'
    | 'changed'
    | 'textExited'
    | 'scaled'
    | 'rotated'
    | 'skewed'
    | 'group'
    | 'ungroup'
    | 'paste'
    | 'bringForward'
    | 'bringToFront'
    | 'sendBackwards'
    | 'sendToBack'
    | 'crop'
    | 'redo'
    | 'undo';

enum ChangeType {
    same,
    total,      // totally different
    replace,    // some objects been replaced
    del,        // some objects been deleted
    insert,      // some objects been added
    reorder,      // some objects been re-ordered
}

interface CompareObj {
    index: number,
    obj: FabricObject
}

interface Change {
    old: { [id: string]: CompareObj };
    now: { [id: string]: CompareObj };
}

interface Selection {
    ids?: string[];
    selection?: fabric.ActiveSelection;
}

export interface TransactionEvent {
    type: TransactionType;
    allObjectsJson?: string;
    changes: Map<ChangeType, Change>;
    oldSelection: Selection;
    nowSelection: Selection;

    // for crop operation
    cropRect?: fabric.Rect;

    // for group operation
    groupSelection?: fabric.ActiveSelection;
}

function revertChange(c: Change): Change {
    return {
        old: Object.assign({}, c.now),
        now: Object.assign({}, c.old)
    }
}

function revert(t: Map<ChangeType, Change>): Map<ChangeType, Change> {
    let result = new Map<ChangeType, Change>();

    t.forEach((value, key) => {
        switch (key) {
            case ChangeType.insert:
                result.set(ChangeType.del, revertChange(value));
                break;
            case ChangeType.del:
                result.set(ChangeType.insert, revertChange(value));
                break;
            default:
                result.set(key, revertChange(value));
                break;
        }
    });

    return result;
}

interface StateDict {
    [id: string]: {
        index: number,
        obj: FabricObject
    }
}

class TransactionHandler {
    handler: Handler;
    redos: TransactionEvent[] = [];
    undos: TransactionEvent[] = [];
    active: boolean = false;
    state!: { selection: Selection, objects: StateDict };

    constructor(handler: Handler) {
        this.handler = handler;
        this.initialize();
    }

    /**
     * Initialize transaction handler
     *
     */
    public initialize = () => {
        this.state = this.getCurrentState();
    };


    private getSelectedObject = (canvas: FabricCanvas): { ids?: string[], selection?: fabric.ActiveSelection } => {
        const object = canvas.getActiveObject();
        if (object && object.type === "activeSelection") {
            let activeSelection = object as fabric.ActiveSelection;
            return {
                ids: activeSelection.getObjects().map(obj => {
                    // @ts-ignore
                    return obj.id
                }),

                selection: Object.assign({}, activeSelection)
            };
        } else if (object) {
            return {
                // @ts-ignore
                ids: [object.id],
                selection: undefined
            }
        } else {
            return {
                ids: undefined,
                selection: undefined
            }
        }
    }

    private getCurrentState = (): { selection: Selection, objects: StateDict } => {
        const {ids, selection} = this.getSelectedObject(this.handler.canvas);

        const objects = this.handler.getCanvasObjects().reduce(function (map: StateDict, obj: FabricObject, idx) {
            if (obj.id !== undefined) {
                // @ts-ignore
                const {videoElement, canvas, _objects, _element, _originalElement, element, instance, player, ...y} = obj.setupState();

                // @ts-ignore
                y.transformMatrix = obj.calcTransformMatrix();

                // @ts-ignore
                let {omittedGroup, omittedLabel, omittedErrorFlag} = {};

                if (obj.hasOwnProperty("group")) {
                    // @ts-ignore
                    const {_objects, canvas, ...y} = obj["group"];
                    omittedGroup = y;
                }

                if (obj.hasOwnProperty("label")) {
                    // @ts-ignore
                    const {_objects, canvas, group, ...y} = obj["label"];
                    omittedLabel = y;
                }

                if (obj.hasOwnProperty("errorFlag")) {
                    // @ts-ignore
                    const {_objects, canvas, group, ...y} = obj["errorFlag"];
                    omittedErrorFlag = y;
                }

                if (obj.superType === 'element' && obj.element && obj.element.style) {
                    // @ts-ignore
                    y.elementStyle = obj.element.style.cssText;
                }

                // @ts-ignore
                const {group, label, errorFlag, ...z} = y;
                let clone = _.cloneDeep(z);
                if (omittedGroup) {
                    // @ts-ignore
                    clone.group = omittedGroup;
                }
                if (omittedLabel) {
                    // @ts-ignore
                    clone.label = omittedLabel;
                }
                if (omittedErrorFlag) {
                    // @ts-ignore
                    clone.errorFlag = omittedErrorFlag;
                }

                // @ts-ignore
                map[obj["id"]] = {
                    index: idx,
                    // @ts-ignore
                    obj: clone
                }
            }
            return map;
        }, {});

        return {
            selection: {
                ids,
                selection
            },
            objects
        }
    }

    /**
     * only for cropImage to call to save state
     * @param cropRect
     * @param cropObject
     */
    public saveCropImage = (cropRect: fabric.Rect, cropObject: FabricImage) => {
        if (!this.handler.keyEvent?.transaction) {
            return;
        }

        if (this.active) {
            return;
        }

        const currentState = this.getCurrentState();
        this.redos = [];
        const changes = compare(this.state.objects, currentState.objects, "crop");
        if (ChangeType.total in changes) {
            this.undos.push({
                type: "crop",
                allObjectsJson: JSON.stringify(this.handler.getCanvasObjects()),
                changes,
                oldSelection: this.state.selection,
                nowSelection: currentState.selection,
                cropRect: Object.assign({}, cropRect),
            });
        } else if (changes.size > 0) {
            this.undos.push({
                type: "crop",
                changes,
                oldSelection: this.state.selection,
                nowSelection: currentState.selection,
                cropRect: Object.assign({}, cropRect),
            });
        }

        this.state = currentState;
    }

    /**
     * Save transaction
     *
     * @param {TransactionType} type
     */
    public save = (type: TransactionType) => {
        if (!this.handler.keyEvent?.transaction) {
            return;
        }

        if (this.active) {
            return;
        }

        const currentState = this.getCurrentState();
        this.redos = [];
        const changes = compare(this.state.objects, currentState.objects, type);
        if (ChangeType.total in changes) {
            this.undos.push({
                type,
                allObjectsJson: JSON.stringify(this.handler.getCanvasObjects()),
                changes,
                oldSelection: this.state.selection,
                nowSelection: currentState.selection,
            });
        } else if (changes.size > 0) {
            this.undos.push({
                type,
                changes,
                oldSelection: this.state.selection,
                nowSelection: currentState.selection,
            });
        }
        this.state = currentState;
    };

    /**
     * Undo transaction
     *
     */
    public undo = throttle(() => {
        const undo = this.undos.pop();
        if (!undo) {
            return;
        }

        this.redos.push({
            type: undo.type,
            allObjectsJson: undo.allObjectsJson,
            changes: revert(undo.changes),
            oldSelection: undo.nowSelection,
            nowSelection: undo.oldSelection,
            cropRect: undo.cropRect,
        });
        this.replay(undo, true);
    }, 100);

    public canUndo = () => {
        return this.undos.length > 0;
    }

    /**
     * Redo transaction
     *
     */
    public redo = throttle(() => {
        const redo = this.redos.pop();
        if (!redo) {
            return;
        }

        this.undos.push({
            type: redo.type,
            allObjectsJson: redo.allObjectsJson,
            changes: revert(redo.changes),
            oldSelection: redo.nowSelection,
            nowSelection: redo.oldSelection,
            cropRect: redo.cropRect,
        });

        this.replay(redo, false);
    }, 100);

    public canRedo = () => {
        return this.redos.length > 0;
    }

    /**
     * Replay transaction
     *
     * @param {TransactionEvent} transaction
     * @param isUndo
     */

    public replay = (transaction: TransactionEvent, isUndo: boolean) => {
        if (transaction.changes.has(ChangeType.total)) {
            this.replayAll(transaction);
            return;
        }

        this.active = true;
        this.handler.canvas.discardActiveObject();
        this.handler.canvas.renderOnAddRemove = false;

        if (transaction.type === 'group' && !isUndo) {

            let activeObjects: fabric.Object[] = [];
            let value = transaction.changes.get(ChangeType.insert);
            for (const oid in value?.now) {
                const findObj = this.handler.findById(oid);
                if (findObj) {
                    activeObjects.push(findObj);
                }
            }

            const activeSelection = new fabric.ActiveSelection(activeObjects, {
                canvas: this.handler.canvas,
                ...this.handler.activeSelectionOption,
            });

            let group = activeSelection.toGroup();

            value = transaction.changes.get(ChangeType.del);

            for (const oid in value?.old) {
                group.set({
                    id: oid,
                    name: 'New group',
                    type: 'group',
                    ...this.handler.objectOption,
                });
            }

        } else {


            if (transaction.changes.has(ChangeType.insert)) {
                const value = transaction.changes.get(ChangeType.insert);

                for (const oid in value?.now) {
                    this.handler.removeById(oid)
                }
            }

            if (transaction.changes.has(ChangeType.del)) {
                const value = transaction.changes.get(ChangeType.del);
                if (value) {
                    // sort, lower index will be inserted first
                    let items = Object.values(value.old);
                    items.sort(function (first: CompareObj, second: CompareObj) {
                        return first.index - second.index;
                    });

                    let nonVisibleIndex = undefined;
                    for (const obj of items) {
                        nonVisibleIndex = this.handler.insertObjectAtIndex(obj.obj, obj.index, nonVisibleIndex);
                    }
                }
            }
            if (transaction.changes.has(ChangeType.replace)) {
                const value = transaction.changes.get(ChangeType.replace);
                for (const oid in value?.old) {
                    let found = this.handler.findById(oid);
                    let replacedBy = value?.old[oid].obj;
                    if (found && replacedBy) {
                        found.set(replacedBy._stateProperties);

                        if (transaction.type === 'crop') {
                            this.handler.cropHandler.handleUndoRedo(found as FabricImage, replacedBy, transaction.cropRect!, isUndo);
                        }
                        if (found.type === 'image') {
                            if (replacedBy.filters) {
                                found.filters = _.cloneDeep(replacedBy.filters);
                                found.applyFilters();
                            } else {
                                found.filters = [];
                                found.applyFilters();
                            }
                        }else if (found.type === 'svg') {
                            found.setCode(_.cloneDeep(replacedBy.code));
                            found.set("width", replacedBy.width);
                            found.set("height", replacedBy.height);
                        }else if (found.type === 'element') {
                            found.setCode(_.cloneDeep(replacedBy.code));
                        }else if (found.type === 'iframe') {
                            found.setSrc(replacedBy.src);
                        }
                        // @ts-ignore
                        fabric.util.applyTransformToObject(found, replacedBy.transformMatrix);

                        if (found.superType === 'element') {
                            this.handler.transformElement(found, replacedBy);
                        }
                    }
                }
            }

            if (transaction.changes.has(ChangeType.reorder)) {
                const value = transaction.changes.get(ChangeType.reorder);

                let nonVisibleIndex = undefined;
                for (const oid in value?.old) {
                    const obj = value?.old[oid];
                    if (obj) {
                        nonVisibleIndex = this.handler.moveObjectToIndex(obj.obj, obj.index, nonVisibleIndex);
                    }
                }
            }
        }
        this.active = false;
        this.handler.canvas.renderOnAddRemove = true;
        this.handler.objects = this.handler.getCanvasObjects();
        this.setActiveObject(transaction);
        this.handler.canvas.renderAll();
        this.state = this.getCurrentState();
        if (this.handler.onTransaction) {
            this.handler.onTransaction(transaction);
        }
    }

    private setActiveObject = (transaction: TransactionEvent) => {
        if (transaction.oldSelection.ids) {
            if (transaction.oldSelection.ids.length > 1) {
                // multi selection
                const objs = transaction.oldSelection.ids.map(s => {
                    return this.handler.findById(s);
                }).filter((o) => o !== undefined);

                if (objs) {
                    // @ts-ignore
                    let selection = new fabric.ActiveSelection(objs, {
                            canvas: this.handler.canvas,
                            ...this.handler.activeSelectionOption,
                        }
                    );
                    this.handler.canvas.setActiveObject(selection);
                } else {
                    this.handler.canvas.discardActiveObject();
                }

            } else {
                // single object
                const obj = this.handler.findById(transaction.oldSelection.ids[0]);
                if (obj) {
                    this.handler.canvas.setActiveObject(obj);
                } else {
                    this.handler.canvas.discardActiveObject();
                }
            }
        } else {
            this.handler.canvas.discardActiveObject();
        }
    }

    public replayAll = (transaction: TransactionEvent) => {

        const objects = JSON.parse(transaction.allObjectsJson ?? "[]") as FabricObject[];
        this.active = true;
        this.handler.canvas.renderOnAddRemove = false;
        this.handler.clear();
        this.handler.canvas.discardActiveObject();

        fabric.util.enlivenObjects(
            objects,
            (enlivenObjects: FabricObject[]) => {
                enlivenObjects.forEach(obj => {
                    const targetIndex = this.handler.canvas._objects.length;
                    if (obj.superType === 'node') {
                        this.handler.canvas.insertAt(obj, targetIndex, false);
                        this.handler.portHandler.create(obj as NodeObject);
                    } else if (obj.superType === 'link') {
                        const link = obj as LinkObject;
                        this.handler.objects = this.handler.getCanvasObjects();
                        this.handler.linkHandler.create({
                            type: 'curvedLink',
                            fromNodeId: link.fromNode?.id,
                            fromPortId: link.fromPort?.id,
                            toNodeId: link.toNode?.id,
                            toPortId: link.toPort?.id,
                        });
                    } else {
                        this.handler.canvas.insertAt(obj, targetIndex, false);
                    }
                });
                this.handler.canvas.renderOnAddRemove = true;
                this.active = false;
                this.handler.canvas.renderAll();
                this.handler.objects = this.handler.getCanvasObjects();
                this.state = this.getCurrentState();

                if (this.handler.onTransaction) {
                    this.handler.onTransaction(transaction);
                }
            },
            "",
        );
    };
}

function compare(aState: StateDict, bState: StateDict, type: TransactionType): Map<ChangeType, Change> {
    let comparedKeys: string[] = [];

    let result = new Map<ChangeType, Change>();
    let totalDifferent = new Map<ChangeType, Change>();
    totalDifferent.set(ChangeType.total, {old: {}, now: {}});

    for (const key in aState) {
        const aObj = aState[key];
        comparedKeys.push(key);
        if (key in bState) {
            // compare index first
            const bObj = bState[key];
            if (aObj.index === bObj.index) {
                if ((type === 'textExited' && aObj.obj.text === bObj.obj.text) || deepCompare(aObj, bObj)) {
                    // same
                    continue;
                } else {
                    if (!result.has(ChangeType.replace)) {
                        result.set(ChangeType.replace, {
                            old: {},
                            now: {}
                        })
                    }
                    let change = result.get(ChangeType.replace) ?? {old: {}, now: {}};
                    change.old[key] = _.cloneDeep(aObj);
                    change.now[key] = _.cloneDeep(bObj);
                }
            } else {

                if (!result.has(ChangeType.reorder)) {
                    result.set(ChangeType.reorder, {
                        old: {},
                        now: {}
                    })
                }
                let change = result.get(ChangeType.reorder) ?? {old: {}, now: {}};
                change.old[key] = _.cloneDeep(aObj);
                change.now[key] = _.cloneDeep(bObj);
            }
        } else {

            if (!result.has(ChangeType.del)) {
                result.set(ChangeType.del, {
                    old: {},
                    now: {}
                })
            }

            let change = result.get(ChangeType.del) ?? {old: {}, now: {}};
            change.old[key] = _.cloneDeep(aObj);
        }
    }


    for (let bKey of Object.keys(bState)) {
        // in b but not in a
        if (comparedKeys.indexOf(bKey) < 0) {

            if (!result.has(ChangeType.insert)) {
                result.set(ChangeType.insert, {
                    old: {},
                    now: {}
                })
            }
            let change = result.get(ChangeType.insert) ?? {old: {}, now: {}};
            change.now[bKey] = _.cloneDeep(bState[bKey]);
        }
    }

    return result;
}

export default TransactionHandler;
