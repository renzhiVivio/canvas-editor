import React, {useRef, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, FormControlLabel, Stack, Switch} from "@mui/material";
import {CanvasInstance} from "../../canvas/Canvas";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {getCanvasInteractionMode, setInteractionMode} from "../../../slices/canvasSlice";
import AceEditor from '../../ace/AceEditor';
import SvgEditor from '../../svg/SvgEditor';
import './index.css'
import {FabricObject} from "../../canvas/objects/helper";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageFilterProperty from "../properties/ImageFilterProperty";
import TextboxProperty from "../properties/TextboxProperty";
import IconPickerProperty from "../properties/IconPickerProperty";
import { Modal, Input, Form, InputNumber, Row, Col, Upload } from 'antd';

export type ElementCodeType = {
    html: string;
    js: string;
    css: string;
    importJs: string;
    importCss: string;
    active: boolean;
    funName: string;
}

export type SvgCodeType = {
    svg: string;
}


function FooterToolbar(props: {
    canvasRef: React.MutableRefObject<CanvasInstance | undefined>,
    preview: boolean,
    onChangePreview: (value: boolean) => void,
    zoomRatio: number,
    setZoomRatio: (value: number) => void,
    canEditCode: boolean,
    canUndo: boolean,
    canRedo: boolean,
    canCrop: boolean,
    canFilter: boolean,
    selectedObjects?: FabricObject[],
    setCanUndo: (value: boolean) => void,
    canChangeSrc:boolean,
    canEditText:boolean,
    canIconPicker:boolean,
    canEditSvg:boolean,
}) {

    const dispatch = useAppDispatch();
    const interactionMode = useAppSelector(getCanvasInteractionMode);

    const {canvasRef, preview, zoomRatio, setZoomRatio, onChangePreview, 
        canEditCode, canUndo, canRedo, canCrop,selectedObjects, setCanUndo,
        canChangeSrc, canEditText, canIconPicker, canEditSvg} = props;

    const zoomValue = parseInt((zoomRatio * 100).toFixed(2), 10);


    // control code editor modal
    const [open, setOpen] = useState<boolean>(false);
    const currentElement = useRef<FabricObject | null>(null);
    const elementRef = useRef<AceEditor>(null);
    const svgRef = useRef<SvgEditor>(null);
    const [code, setCode] = useState<ElementCodeType>({html: '', js: '', css: '', importJs: '', importCss: '', active: false, funName:''})

    const [isCropping, setIsCropping] = useState<boolean>(false);
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    // 如果只是打开modal就关上，没有做任何事，则不进undo/redo stack
    const [doSth, setDoSth] = useState<boolean>(false);

    // iframe modal打开/关闭
    const [changeSrcModalOpen, setChangeSrcModalOpen] = useState<boolean>(false);

    // textbox modal打开/关闭
    const [textboxModalOpen, setTextboxModalOpen] = useState<boolean>(false);

    // icon picker modal打开/关闭
    const [iconPickerModalOpen, setIconPickerModalOpen] = useState<boolean>(false);

    // svg editor modal
    const [svgEditModalOpen, setSvgEditModalOpen] = useState<boolean>(false);
    const [svgCode, setSvgCode] = useState<SvgCodeType>({svg: ''})
    const [svgForm] = Form.useForm();


    const [form] = Form.useForm();


    const saveCode = () => {
        const tempCode = elementRef.current?.handlers.getCodes();
        if (tempCode && currentElement && currentElement.current) {
            setCode(tempCode);
            currentElement.current.setCode(tempCode);
            canvasRef?.current?.handler.transactionHandler.save('changed');

        }
        setOpen(false);
    }

    const saveSvgCode = () => {
        const tempCode = svgRef.current?.handlers.getCodes();
        if (tempCode && currentElement && currentElement.current) {
            setSvgCode(tempCode);
            let svgProperties = svgForm.getFieldsValue();
            canvasRef?.current?.handler.set("height",svgProperties.svgHeight);
            canvasRef?.current?.handler.set("width",svgProperties.svgWidth);
            currentElement.current.setCode(tempCode);
            canvasRef?.current?.handler.transactionHandler.save('changed');
            
        }
        setSvgEditModalOpen(false);
    }

    const onUndo = () => {
        canvasRef?.current?.handler.transactionHandler.undo();
    }

    const onRedo = () => {
        canvasRef?.current?.handler.transactionHandler.redo();
    }

    const handleSrcChange = () => {
        let values = form.getFieldsValue();
        let obj = canvasRef?.current?.handler.canvas.getActiveObject();
        // @ts-ignore
        obj?.setSrc(values.src);
        canvasRef?.current?.handler.transactionHandler.save('changed');
        setChangeSrcModalOpen(false);
    }


    // 原来icon picker采用了选择颜色后直接关闭modal让用户直观看到改变的方法
    // 但由于颜色拖动会造成大量数据入undo栈，目前采用颜色拖动后
    // 要点击apply才会应用当前颜色，并且进栈和关闭modal
    const setIconPickerModalOpenStep1 = (value:boolean) => {
        setIconPickerModalOpen(value);
        canvasRef?.current?.handler.transactionHandler.save('changed');

    }

    return (
        <React.Fragment>
            <div className="footer-toolbar-container">
                <Stack spacing={1} direction="row">
                    <FormControlLabel
                        control={
                            <Switch checked={preview} onChange={() => {

                                onChangePreview(!preview)
                            }} name="gilad"/>
                        }
                        label="Preview"
                    />
                    {!preview && <><Button
                        variant='contained'
                        onClick={() => {
                            canvasRef?.current?.handler.zoomHandler.zoomOneToOne();
                            setZoomRatio(1)
                        }}
                    >
                        {`${zoomValue}%`}
                    </Button>
                        <Button
                            variant={interactionMode === 'selection' ? 'contained' : 'outlined'}
                            onClick={() => {
                                canvasRef?.current?.handler.interactionHandler.selection();
                                dispatch(setInteractionMode('selection'));
                            }}
                        >
                            Selection
                        </Button>
                        <Button
                            variant={interactionMode === 'grab' ? 'contained' : 'outlined'}
                            onClick={() => {
                                canvasRef?.current?.handler.interactionHandler.grab();
                                dispatch(setInteractionMode('grab'));
                            }}
                        >
                            Grab
                        </Button>
                        {canEditSvg?<Button
                            variant={'outlined'}
                            onClick={() => {
                                currentElement.current = canvasRef?.current?.handler.canvas.getActiveObject() as FabricObject;
                                const {code: activeCode} = currentElement.current;
                                console.log(currentElement.current);
                                svgForm.setFieldsValue({
                                    svgWidth:currentElement.current.width,
                                    svgHeight:currentElement.current.height,
                                })
                                setSvgCode(activeCode);
                                setSvgEditModalOpen(true)
                            }}
                        >
                            Svg Editor
                        </Button>:<Button
                            disabled={!canEditCode}
                            variant={'outlined'}
                            onClick={() => {
                                currentElement.current = canvasRef?.current?.handler.canvas.getActiveObject() as FabricObject;
                                const {code: activeCode} = currentElement.current;
                                setCode(activeCode);
                                setOpen(true)
                            }}
                        >
                            Code Editor
                        </Button>}
                        <Button onClick={onUndo} variant={'contained'} disabled={!canUndo}>
                            Undo
                        </Button>
                        <Button onClick={onRedo} variant={'contained'} disabled={!canRedo}>
                            Redo
                        </Button>
                        {!isCropping ? <Button onClick={() => {
                                setIsCropping(true);
                                canvasRef?.current?.handler.cropHandler.start()
                            }} variant={'contained'} disabled={!canCrop}>
                                Crop
                            </Button> :
                            <>
                                <Button onClick={() => {
                                    setIsCropping(false);
                                    canvasRef?.current?.handler.cropHandler.finish()
                                }} variant={'contained'}>
                                    <CheckCircleIcon/>
                                </Button>
                                <Button onClick={() => {
                                    setIsCropping(false);
                                    canvasRef?.current?.handler.cropHandler.cancel()
                                }} variant={'contained'}>
                                    <CancelIcon/>
                                </Button>
                            </>
                        }
                        <Button onClick={() => setFilterOpen(true)}
                                variant={'contained'} disabled={!canCrop}>
                            Filter
                        </Button>
                        <Button onClick={() => {
                            setChangeSrcModalOpen(true)
                            let obj = canvasRef?.current?.handler.canvas.getActiveObject();
                            form.setFieldsValue({
                                // @ts-ignore
                                src: obj?.src
                            })
                        }
                        }
                                variant={'contained'} disabled={!canChangeSrc}>
                            Set URL
                        </Button>
                        <Button onClick={()=>setTextboxModalOpen(true)}
                        variant={'contained'} disabled={!canEditText}>
                            Edit Text
                        </Button>
                        <Button onClick={()=>{
                            currentElement.current = canvasRef?.current?.handler.canvas.getActiveObject() as FabricObject;

                            setIconPickerModalOpen(true)}
                        }
                        variant={'contained'} disabled={!canIconPicker}>
                            IconPicker
                        </Button>
                    </>}


                </Stack>
            </div>
            <div>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    fullWidth
                    maxWidth="lg"
                >
                    <DialogContent>
                        <AceEditor
                            ref={elementRef}
                            html={code.html}
                            css={code.css}
                            js={code.js}
                            importJs={code.importJs}
                            importCss={code.importCss}
                            active={code.active}
                            funName={code.funName}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={saveCode}>OK</Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div>
                <Modal visible={filterOpen} footer={null}
                       onCancel={() => {
                           setFilterOpen(false);
                           if (doSth) {
                               canvasRef?.current?.handler.transactionHandler.save('changed');
                               setCanUndo(true);
                           }
                           setDoSth(false);
                       }}
                       destroyOnClose={true}
                       width={600} closable={false} mask={false} maskClosable={true}>

                    <ImageFilterProperty canvasRef={canvasRef} data={selectedObjects} setDoSth={setDoSth}/>

                </Modal>
            </div>
            <div>
                <Modal visible={changeSrcModalOpen}
                       onCancel={() => {
                           setChangeSrcModalOpen(false);
                       }}
                       onOk={() => handleSrcChange()}
                        // 这个modal 内容要进行销毁，为了在点击时可以根据当前选择的object进行数据同步
                       destroyOnClose={true}
                       width={600} closable={false} maskClosable={true}>

                    <Form
                        name="basic"

                        form={form}
                    >
                        <Form.Item label={"URL"} colon={false}
                                   name={'src'}
                        >
                            <Input placeholder="Input URL"/>
                        </Form.Item>
                    </Form>

                </Modal>
            </div>
            <div>
                <Modal visible={textboxModalOpen}  footer={null} 
                onCancel={() => {setTextboxModalOpen(false);
                    if(doSth){
                        canvasRef?.current?.handler.transactionHandler.save('changed');
                        setCanUndo(true);
                    }
                    setDoSth(false);
                }}
                // 这个modal 内容要进行销毁，为了在点击时可以根据当前选择的object进行数据同步
                destroyOnClose={true}
                width={600} closable={false} mask={false} maskClosable={true}>

                    <TextboxProperty canvasRef={canvasRef} data={selectedObjects} setDoSth={setDoSth}/>
                    
                </Modal>
            </div>
            <div>
                <Modal visible={iconPickerModalOpen}  footer={null} 
                onCancel={() => {setIconPickerModalOpen(false);
                }}
                // 这里要注意，如果颜色需要同步的话必须destroy内容
                // 但这时候用户搜索/设置过的数据内容会被销毁，所以不destroy，颜色以后放其他地方
                // destroyOnClose={true}
                width={1200} closable={false} mask={false} maskClosable={true}>
                    <IconPickerProperty canvasRef={canvasRef} data={selectedObjects}
                    setIconPickerModalOpenStep1={setIconPickerModalOpenStep1} 
                    />
                </Modal>
            </div>
            <div>
                <Dialog
                    open={svgEditModalOpen}
                    onClose={() => setSvgEditModalOpen(false)}
                    fullWidth
                    maxWidth="lg"
                >
                    <DialogContent>
                        <SvgEditor
                            ref={svgRef}
                            svg={svgCode.svg}
                        />
                        <br />
                        <Form form={svgForm} labelCol={{span:4}} wrapperCol={{span:8}}>
                            <Row>
                            <Col span={12}><Form.Item label={"SVG Height"} colon={false} name="svgHeight">
                                <InputNumber />
                            </Form.Item>
                            </Col>
                            <Col span={12}><Form.Item label={"SVG Width"} colon={false} name="svgWidth">
                                <InputNumber />
                            </Form.Item>
                            </Col>
                            </Row>

                        </Form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSvgEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={saveSvgCode}>OK</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </React.Fragment>
    );
}

export default FooterToolbar;
