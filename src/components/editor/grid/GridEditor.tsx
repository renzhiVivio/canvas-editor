import React, {useEffect, useRef, useState} from 'react';
import {useDrop} from 'react-dnd';
import Canvas, {CanvasInstance} from "../../canvas/Canvas";
import {WidgetType} from "../../../types";
import {v4 as uuidv4} from 'uuid';
import {FabricObject, InteractionMode} from "../../canvas/objects/helper";
import {DraggableIconItem} from "../../DraggableIcon";
import {Divider, Menu, MenuItem} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {getCanvasInteractionMode, setInteractionMode} from "../../../slices/canvasSlice";
import FooterToolbar from './FooterToolbar';
import PreviewWindow from './PreviewWindow';
import './index.css'
import ListItemIcon from "@mui/material/ListItemIcon";
import {Check} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import {TransactionEvent} from "../../canvas/handlers/TransactionHandler";

function GridEditor(props: { interactionMode: InteractionMode, editWidth: number, editHeight: number }) {
    const dispatch = useAppDispatch();
    const interactionMode = useAppSelector(getCanvasInteractionMode);

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const [selectedObjects, setSelectedObjects] = useState<FabricObject[] | undefined>(undefined);
    const [enableEditButton, setEnableEditButton] = useState(false);
    const [isBarChart, setIsBarChart] = useState(true);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [canCrop, setCanCrop] = useState(false);
    const [canFilter, setCanFilter] = useState(false);
    const [canChangeSrc, setCanChangeSrc] = useState(false);
    const [canEditText, setCanEditText] = useState(false);
    const [canIconPicker, setCanIconPicker] = useState(false);
    const [canEditSvg, setCanEditSvg] = useState(false);

    const canvasRef = useRef<CanvasInstance>();
    const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>;

    const handleMenuClose = () => {
        setContextMenu(null);
    };


    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        if (props.interactionMode === 'polygon' && canvasRef.current?.handler.pointArray) {
            canvasRef.current?.handler.drawingHandler.polygon.generate(canvasRef.current?.handler.pointArray);
            setContextMenu(null);
        } else {

            setContextMenu(
                contextMenu == null ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                } : null
            );
        }
    };

    const [, drop] = useDrop(
        () => ({

            accept: [WidgetType.Rect, WidgetType.Circle, 
            WidgetType.Triangle, WidgetType.Cube, 
            WidgetType.Image, WidgetType.Gif, WidgetType.Video, 
            WidgetType.Element, WidgetType.Animation, 
            WidgetType.VideoJS, WidgetType.Chart, WidgetType.Iframe, 
            WidgetType.Textbox, WidgetType.Node, WidgetType.IText, WidgetType.Svg],

            drop: (item: DraggableIconItem, monitor) => {
                canvasRef?.current?.handler.interactionHandler.selection();
                dispatch(setInteractionMode('selection'));

                let rect = containerRef.current?.getBoundingClientRect();
                let offset = monitor.getClientOffset();
                switch (item.type) {
                    case WidgetType.Rect:
                    case WidgetType.Triangle:
                    case WidgetType.Circle:
                    case WidgetType.Cube:
                    case WidgetType.Gif:
                    case WidgetType.Image:
                    case WidgetType.Video:
                    case WidgetType.Element:
                    case WidgetType.Animation:
                    case WidgetType.VideoJS:
                    case WidgetType.Chart:
                    case WidgetType.Iframe:
                    case WidgetType.Textbox:
                    case WidgetType.Node:
                    case WidgetType.IText:
                    case WidgetType.Svg:
                        addObject(item.type, (offset?.x ?? 0) - rect.left, (offset?.y ?? 0) - rect.top);
                        break;
                }
            }
        }),
        []
    )

    // 控制视图大小
    const [zoomRatio, setZoomRatio] = useState<number>(1);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [objects, setObjects] = useState<FabricObject[]>([]);

    function onZoom(zoom: any) {
        setZoomRatio(zoom);
    }

    // 预览
    function onChangePreview(showPreview: boolean) {
        if (showPreview) {
            canvasRef.current?.canvas.discardActiveObject();
            let data = canvasRef.current?.handler.exportJSON().filter(obj => {
                // 注意网格不需要渲染
                return obj.id && obj.id !== 'grid' && obj.id !== 'workarea';
            });
            console.log(data);
            if (data) {
                setObjects(data)
            } else {
                setObjects([])
            }
        }
        setShowPreview(showPreview);
        setEnableEditButton(false);
        setCanUndo(false);
        setCanRedo(false);
        setCanCrop(false);
    }


    function addObject(type: WidgetType, originLeft: number, originTop: number) {
        let option = {
            id: uuidv4(),
            superType: 'circle',
            left: originLeft,
            top: originTop,
            selectable: true,
        };

        if (type === WidgetType.Circle) {
            option = {
                ...option,
                ...{
                    type: 'circle',
                    radius: 100,
                    fill: 'rgba(255,0,255)'
                }
            }
        } else if (type === WidgetType.Rect) {
            option = {
                ...option,
                ...{
                    type: 'rect',
                    width: 200,
                    height: 200,
                    fill: 'rgba(128,0,128)',
                }
            }
        } else if (type === WidgetType.Triangle) {
            option = {
                ...option,
                ...{
                    type: 'triangle',
                    width: 200,
                    height: 200,
                    fill: 'pink'
                }
            }
        } else if (type === WidgetType.Cube) {
            option = {
                ...option,
                ...{
                    type: 'cube',
                    width: 200,
                    height: 200,
                }
            }
        } else if (type === WidgetType.Image) {
            option = {
                ...option,
                ...{
                    type: 'image',
                    superType: 'image',
                    src: 'sun.jpeg',
                    width: 320,     // useless
                    height: 176,    // useless
                }
            }
        } else if (type === WidgetType.Gif) {
            option = {
                ...option,
                ...{
                    type: 'gif',
                    src: 'smiling.gif',
                    width: 200,
                    height: 200,
                }
            }
        } else if (type === WidgetType.Video) {
            option = {
                ...option,
                ...{
                    type: 'video',
                    superType: 'element',
                    src: "http://github.com/mediaelement/mediaelement-files/blob/master/big_buck_bunny.mp4?raw=true",
                    width: 375,
                    height: 211,
                    autoplay: false,
                    muted: false,
                    loop: false,
                }
            }
        } else if (type === WidgetType.Node){

            option = {
                ...option,
                ...{
                    type: 'node',
                    superType: 'node',
                    width: 300,
                    height: 200,
                }
            }

        } else if (type === WidgetType.VideoJS) {
            option = {
                ...option,
                ...{
                    type: 'videojs',
                    superType: 'image',
                    src: "http://github.com/mediaelement/mediaelement-files/blob/master/big_buck_bunny.mp4?raw=true",
                    width: 475,
                    height: 311,
                    autoplay: false,
                    muted: true,
                    loop: false,
                }
            }
        } else if (type === WidgetType.Element) {
            option = {
                ...option,
                ...{
                    type: 'element',
                    superType: 'element',
                    width: 480,
                    height: 270,
                }
            }
        } else if (type === WidgetType.Svg) {
            option = {
                ...option,
                ...{
                    type: 'svg',
                    superType: 'element',
                    width: 100,
                    height: 100,
                }
            }
        } else if (type === WidgetType.Iframe) {
            option = {
                ...option,
                ...{
                    type: 'iframe',
                    superType: 'element',
                    width: 480,
                    height: 270,
                    // src: 'https://www.youtube.com/embed/PfI8fAR84_k'
                    src: 'https://www.google.com/search?igu=1'
                }
            }
        } else if (type === WidgetType.Textbox) {
            option = {
                ...option,
                ...{
                    type: 'textbox',
                    width: 240,
                    height: 80,
                    text: "",
                }
            }
        }  else if (type === WidgetType.IText) {
            option = {
                ...option,
                ...{
                    type: 'i-text',
                    // text: "fa-solid fa-location-dot",
                    text: "\uf3c5",
                    fontFamily: "Font Awesome 6 Free",
                    fontWeight: 900,
                    fontSize: 60,
                    width: 60,
                    height: 60,
                    editable: false,
                    superType:'',
                }
            }
        } else if (type === WidgetType.Animation) {
            option = {
                ...option,
                ...{
                    type: 'triangle',
                    fill: 'rgba(0,0,0)',
                    width: 200,
                    height: 200,
                    animation: {
                        autoplay: true,
                        offset: 50,
                        opacity: 0,
                        bounce: 'vertical',
                        shake: 'horizontal',
                        scale: 2.0,
                        loop: true,
                        fill: 'rgba(255,0,0)',
                        stroke: 'rgba(0,255,0)',
                        type: 'fade',
                        duration: 1500,
                    }
                }
            }
        } else if (type === WidgetType.Chart) {
            const data = [];
            for (let i = 0; i <= 100; i++) {
                let theta = (i / 100) * 360;
                let r = 5 * (1 + Math.sin((theta / 180) * Math.PI));
                data.push([r, theta]);
            }
            const chartOption = {
                legend: {
                    data: ['sth']
                },
                polar: {},
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                angleAxis: {
                    type: 'value',
                    startAngle: 0
                },
                radiusAxis: {},
                series: [
                    {
                        coordinateSystem: 'polar',
                        name: 'sth',
                        type: 'line',
                        data: data
                    }
                ]
            };

            option = {
                ...option,
                ...{
                    type: 'chart',
                    superType: 'element',
                    width: 500,
                    height: 500,
                    chartOption,
                }
            }
        }
        canvasRef.current?.handler?.add(option, false, false);
    }

    function onAdd(target: FabricObject) {
        canvasRef.current?.handler.gridHandler.setCoords(target);
        setCanUndo(true);
        setCanRedo(canvasRef.current?.handler.transactionHandler.canRedo() ?? false);
    }

    function onSelect(target?: FabricObject[]) {
        setSelectedObjects(target);
        setEnableEditButton(target?.length === 1 && target[0].type === 'element');
        setCanCrop(target?.length === 1 && target[0].type === 'image');
        setCanFilter(target?.length === 1 && target[0].type === 'image');
        setCanChangeSrc(target?.length === 1 && target[0].type === 'iframe');
        setCanEditText(target?.length === 1 && target[0].type === 'textbox');
        setCanIconPicker(target?.length === 1 && target[0].type === 'i-text');
        setCanEditSvg(target?.length === 1 && target[0].type === 'svg');
    }

    function onInteraction(interactionMode: InteractionMode) {
        dispatch(setInteractionMode(interactionMode));  // sync redux data with canvas status
    }

    function onTransaction(t: TransactionEvent) {
        setCanRedo(canvasRef.current?.handler.transactionHandler.canRedo() ?? false);
        setCanUndo(canvasRef.current?.handler.transactionHandler.canUndo() ?? false);
    }

    function onModified() {
        setCanUndo(true);
        setCanRedo(canvasRef.current?.handler.transactionHandler.canRedo() ?? false);
    }

    function onContext(el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) {
    }

    function finishDrawing() {
        canvasRef.current?.handler.drawingHandler.line.finish();
        canvasRef.current?.handler.drawingHandler.polygon.finish();
        canvasRef.current?.handler.drawingHandler.arrow.finish();
    }

    useEffect(() => {
        // console.log(canvasRef.current?.handler.canvas.getZoom());
        if (props.interactionMode === 'polygon') {
            finishDrawing();
            canvasRef.current?.handler.drawingHandler.polygon.init();
        } else if (props.interactionMode === 'line') {
            finishDrawing();
            canvasRef.current?.handler.drawingHandler.line.init();
        } else if (props.interactionMode === 'arrow') {
            finishDrawing();
            canvasRef.current?.handler.drawingHandler.arrow.init();
        }

    }, [props.interactionMode]);


    function switchInteractionMode() {

        if (canvasRef?.current?.handler.interactionHandler.isDrawingMode()) {
            return;
        }

        if (interactionMode === 'selection') {
            canvasRef?.current?.handler.interactionHandler.grab();
            dispatch(setInteractionMode('grab'));
        } else {
            canvasRef?.current?.handler.interactionHandler.selection();
            dispatch(setInteractionMode('selection'));

        }

        handleMenuClose();
    }

    function copyObjects() {
        canvasRef.current?.handler.copy();
        handleMenuClose();
    }

    function pasteObjects(e: React.MouseEvent) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (contextMenu != null) {
            canvasRef.current?.handler.paste(contextMenu.mouseX - rect.left, contextMenu.mouseY - rect.top);
        } else {
            canvasRef.current?.handler.paste(e.clientX - rect.left, e.clientY - rect.top);
        }
        handleMenuClose();
    }

    function deleteObject() {
        canvasRef.current?.handler.remove(canvasRef.current?.handler.canvas.getActiveObject())
        handleMenuClose();
    }

    function deleteAllObjects() {
        canvasRef.current?.handler.clear()
        handleMenuClose();
    }

    function alignLeft() {
        canvasRef.current?.handler.alignmentHandler.left();
        handleMenuClose();
    }

    function alignTop() {
        canvasRef.current?.handler.alignmentHandler.top();
        handleMenuClose();
    }

    function toFront() {
        canvasRef.current?.handler.bringToFront();
        handleMenuClose();
    }

    function toBack() {
        canvasRef.current?.handler.sendToBack();
        handleMenuClose();
    }

    function forwardObject() {
        canvasRef.current?.handler.bringForward();
        handleMenuClose();
    }

    function backwardsObject() {
        canvasRef.current?.handler.sendBackwards();
        handleMenuClose();
    }

    function selectAnimation(event: React.MouseEvent) {
        let t = selectedObjects?.[0];
        // @ts-ignore
        t.animation.type = event.target.outerText;
        handleMenuClose();
    }

    function getChartOption() {
        setIsBarChart(!isBarChart);

        if (isBarChart) {
            return {
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '5%',
                    left: 'center'
                },
                series: [
                    {
                        name: 'Access From',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '40',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            {value: 1048, name: 'Search Engine'},
                            {value: 735, name: 'Direct'},
                            {value: 580, name: 'Email'},
                            {value: 484, name: 'Union Ads'},
                            {value: 300, name: 'Video Ads'}
                        ]
                    }
                ]
            }
        } else {
            const data = [];

            for (let i = 0; i <= 100; i++) {
                let theta = (i / 100) * 360;
                let r = 5 * (1 + Math.sin((theta / 180) * Math.PI));
                data.push([r, theta]);
            }

            return {
                legend: {
                    data: ['sth']
                },
                polar: {},
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                angleAxis: {
                    type: 'value',
                    startAngle: 0
                },
                radiusAxis: {},
                series: [
                    {
                        coordinateSystem: 'polar',
                        name: 'sth',
                        type: 'line',
                        data: data
                    }
                ]
            }
        }
    }

    function changeChart() {
        let obj = selectedObjects?.[0];
        if (obj == null) return;

        obj.setChartOption(getChartOption());
        handleMenuClose();
    }

    function group() {
        canvasRef.current?.handler.toGroup();
        handleMenuClose();
    }

    function ungroup() {
        canvasRef.current?.handler.toActiveSelection();
        handleMenuClose();
    }

    return (
        <>
            {!showPreview ?
                <>
                    <div ref={containerRef} style={{position: 'relative'}} onContextMenu={handleContextMenu}>
                        <div ref={drop}
                             style={{position: 'absolute', overflow: 'hidden', top: 0, left: 0, width: props.editWidth, height: props.editHeight}}
                             id='canvas-container-div'>
                            <Menu
                                id="context-menu"
                                anchorReference="anchorPosition"
                                anchorPosition={
                                    contextMenu !== null
                                        ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                                        : undefined
                                }
                                open={contextMenu != null}
                                onClose={handleMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem onClick={copyObjects} disabled={(selectedObjects?.length ?? 0) <= 0}>Copy</MenuItem>
                                <MenuItem onClick={pasteObjects} disabled={!canvasRef.current?.handler.hasObjectsInClipboard()}>Paste</MenuItem>
                                <Divider/>
                                <MenuItem onClick={alignLeft} disabled={(selectedObjects?.length ?? 0) <= 1}>Align Left</MenuItem>
                                <MenuItem onClick={alignTop} disabled={(selectedObjects?.length ?? 0) <= 1}>Align Top</MenuItem>
                                <Divider/>
                                <MenuItem onClick={group} disabled={(selectedObjects?.length ?? 0) <= 1}>Group</MenuItem>
                                <MenuItem onClick={ungroup} disabled={(selectedObjects?.length ?? 0) > 1}>Ungroup</MenuItem>
                                <Divider/>
                                <MenuItem onClick={toFront}
                                          disabled={(selectedObjects?.length ?? 0) <= 0 || selectedObjects?.some((o) => o.superType === 'element')}>ToFront</MenuItem>
                                <MenuItem onClick={toBack}
                                          disabled={(selectedObjects?.length ?? 0) <= 0 || selectedObjects?.some((o) => o.superType === 'element')}>ToBack</MenuItem>
                                <MenuItem onClick={forwardObject}
                                          disabled={(selectedObjects?.length ?? 0) <= 0 || selectedObjects?.some((o) => o.superType === 'element')}>Forward</MenuItem>
                                <MenuItem onClick={backwardsObject}
                                          disabled={(selectedObjects?.length ?? 0) <= 0 || selectedObjects?.some((o) => o.superType === 'element')}>Backwards</MenuItem>
                                <Divider/>
                                <MenuItem onClick={deleteObject}>Delete
                                    Object</MenuItem>
                                <MenuItem onClick={deleteAllObjects} disabled={(canvasRef?.current?.handler?.getCanvasObjects().length ?? 0) <= 0}>Delete
                                    All</MenuItem>
                                {
                                    selectedObjects?.length === 1 && selectedObjects?.[0].animation != null ?
                                    <Divider />:null}
                                {
                                    selectedObjects?.length === 1 && selectedObjects?.[0].animation != null ?
                                           
                                        ['fade', 'bounce', 'shake', 'scaling', 'rotation', 'flash'].map((text) => {
                                            if (selectedObjects?.[0].animation?.type === text) {
                                                return <MenuItem key={text}>
                                                    <ListItemIcon>
                                                        <Check/>
                                                    </ListItemIcon>
                                                    {text}
                                                </MenuItem>;
                                            } else {
                                                return <MenuItem onClick={selectAnimation} key={text}>
                                                    <ListItemText inset>{text}</ListItemText>
                                                </MenuItem>;
                                            }
                                        })
                                            
                                        : null
                                }
                                {
                                    selectedObjects?.length === 1 && selectedObjects?.[0].type === 'chart' ?
                                        <MenuItem onClick={changeChart}>Change Chart</MenuItem> : null
                                }
                                <Divider/>
                                <MenuItem onClick={switchInteractionMode}>{interactionMode === 'selection' ? 'Grab' : 'Selection'}</MenuItem>
                            </Menu>
                            <Canvas
                                ref={canvasRef}
                                minZoom={100}
                                maxZoom={150}
                                canvasOption={{
                                    width: props.editWidth,
                                    height: props.editHeight,
                                    backgroundColor: '#f3f3f3',
                                }}
                                editable={true}
                                responsive={true}
                                workareaOption={{
                                    width: props.editWidth,
                                    height: props.editHeight,
                                    backgroundColor: '#fff',
                                }}
                                activeSelectionOption={{
                                    hasBorders: true,
                                    hasControls: true,
                                    perPixelTargetFind: false,
                                }}
                                zoomEnabled={true}
                                guidelineOption={{
                                    enabled: true
                                }}
                                gridOption={{
                                    enabled: true,
                                    snapToGrid: true,
                                    grid: 10,
                                    lineColor: '#ebebeb',
                                    borderColor: '#cbcbcb',
                                }}
                                onAdd={onAdd}
                                onModified={onModified}
                                onSelect={onSelect}
                                onTransaction={onTransaction}
                                onContext={onContext}
                                onZoom={onZoom}
                                onInteraction={onInteraction}
                                onLoad={handler => {
                                    // console.log(objects);
                                    handler.importJSON(objects);
                                    handler.transactionHandler.initialize();
                                }}

                            />
                        </div>
                    </div>
                </>
                : <>
                    <div style={{position: 'relative'}}>
                        <PreviewWindow objects={objects} previewWidth={props.editWidth} previewHeight={props.editHeight}/>
                    </div>
                </>
            }
            <div className="footer-toolbar">
                <FooterToolbar
                    canvasRef={canvasRef}
                    preview={showPreview}
                    onChangePreview={onChangePreview}
                    zoomRatio={zoomRatio}
                    setZoomRatio={setZoomRatio}
                    canEditCode={enableEditButton}
                    canRedo={canRedo}
                    canUndo={canUndo}
                    canCrop={canCrop}
                    canFilter={canFilter}
                    selectedObjects={selectedObjects}
                    setCanUndo={setCanUndo}
                    canChangeSrc={canChangeSrc}
                    canEditText={canEditText}
                    canIconPicker={canIconPicker}
                    canEditSvg={canEditSvg}
                />
            </div>

        </>
    );
}

export default GridEditor;