import React, {useEffect, useRef, useState} from 'react';
import {CanvasInstance} from "../../canvas/Canvas";
import SwitchButton from "../components/SwitchButton";
import {Col, Form, Row, Select, Slider} from 'antd';
import 'antd/dist/antd.min.css';


const BlendColorMode = ['multiply', 'add', 'diff', 'screen', 'subtract', 'darken', 'lighten', 'overlay', 'exclusion', 'tint']

function ImageFilterProperty(props: {
    canvasRef: React.MutableRefObject<CanvasInstance | undefined>,
    data: any,
    setDoSth: (value: boolean) => void
}) {

    const [form] = Form.useForm();
    const {canvasRef, data, setDoSth} = props;
    const filtersRef = useRef<any[]>([]);
    const {filters} = data[0];
    // 必须要有startRender,才能在渲染内容前确保获取options，然后进行数据同步
    const [startRender, setStartRender] = useState<boolean>(false);

    useEffect(() => {
        filtersRef.current = filters;
        setStartRender(true);
        form.setFieldsValue({
            gammaEnabled: !!filtersRef?.current?.[17],
            gammaRed: filtersRef?.current?.[17] ? filtersRef?.current?.[17].gamma[0] : 1,
            gammaGreen: filtersRef?.current?.[17] ? filtersRef?.current?.[17].gamma[1] : 1,
            gammaBlue: filtersRef?.current?.[17] ? filtersRef?.current?.[17].gamma[2] : 1,
            brightnessEnabled: !!filtersRef?.current?.[5],
            brightnessPercentage: filtersRef?.current?.[5] ? filtersRef?.current?.[5].brightness : 0,
            contrastEnabled: !!filtersRef?.current?.[6],
            contrastPercentage: filtersRef?.current?.[6] ? filtersRef?.current?.[6].contrast : 0,
            saturationEnabled: !!filtersRef?.current?.[7],
            saturationPercentage: filtersRef?.current?.[7] ? filtersRef?.current?.[7].saturation : 0,
            hueEnabled: !!filtersRef?.current?.[21],
            huePercentage: filtersRef?.current?.[21] ? filtersRef?.current?.[21].rotation : 0,
            noiseEnabled: !!filtersRef?.current?.[8],
            noisePercentage: filtersRef?.current?.[8] ? filtersRef?.current?.[8].noise : 100,
            pixelateEnabled: !!filtersRef?.current?.[10],
            pixelatePercentage: filtersRef?.current?.[10] ? filtersRef?.current?.[10].blocksize : 1,
            blurEnabled: !!filtersRef?.current?.[11],
            blurPercentage: filtersRef?.current?.[11] ? filtersRef?.current?.[11].value : 0.1,
            blendEnabled: !!filtersRef?.current?.[16],
            blendColor: filtersRef?.current?.[16] ? filtersRef?.current?.[16].color : "#c65d5d",
            blendMode: filtersRef?.current?.[16] ? filtersRef?.current?.[16].mode : "multiply",
            blendAlpha: filtersRef?.current?.[16] ? filtersRef?.current?.[16].alpha : 1,
            removeEnabled: !!filtersRef?.current?.[2],
            removeColor: filtersRef?.current?.[2] ? filtersRef?.current?.[2].color : "#c65d5d",
            removeDistance: filtersRef?.current?.[2] ? filtersRef?.current?.[2].distance : 0.02,
            // removeUseAlpha:filtersRef?.current?.[2]?filtersRef?.current?.[2].useAlpha:false,

        })
    }, [filters])

    const handleChange = (tag: any, value: any, property?: string, useIcon?:boolean) => {
        setDoSth(true);
        const filterKey = tag;
        const filterValue = value;
        let temp = form.getFieldsValue();
        if (filterKey === 'gamma') {
            const rgb = [temp.gammaRed, temp.gammaGreen, temp.gammaBlue];
            if (property === 'enabled') {
                form.setFieldsValue({
                    gammaEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    gamma: rgb,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.gammaEnabled, {
                    gamma: rgb,
                });
            }
        } else if (filterKey === 'brightness') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    brightnessEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    brightness: temp.brightnessPercentage,
                });

            } else {

                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.brightnessEnabled, {
                    brightness: temp.brightnessPercentage,
                });
            }
        } else if (filterKey === 'contrast') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    contrastEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    contrast: temp.contrastPercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.contrastEnabled, {
                    contrast: temp.contrastPercentage,
                });
            }
        } else if (filterKey === 'saturation') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    saturationEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    saturation: temp.saturationPercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.saturationEnabled, {
                    saturation: temp.saturationPercentage,
                });
            }
        } else if (filterKey === 'hue') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    hueEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    rotation: temp.huePercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.hueEnabled, {
                    rotation: temp.huePercentage,
                });
            }
        } else if (filterKey === 'noise') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    noiseEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    noise: temp.noisePercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.noiseEnabled, {
                    noise: temp.noisePercentage,
                });
            }
        } else if (filterKey === 'pixelate') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    pixelateEnabled: filterValue
                })
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    blocksize: temp.pixelatePercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.pixelateEnabled, {
                    blocksize: temp.pixelatePercentage,
                });
            }
        } else if (filterKey === 'blur') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    blurEnabled: filterValue
                })
                // react-design-editor和fabricjs的文档中都用了value
                // 注意value没有效果，要用blur
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    blur: temp.blurPercentage,
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.blurEnabled, {
                    blur: temp.blurPercentage,
                });
            }
        } else if (filterKey === 'blend-color') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    blendEnabled: filterValue
                })
                // 注意这里的filterKey是blend-color
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    color: temp.blendColor,
                    mode: temp.blendMode,
                    alpha: temp.blendAlpha
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.blendEnabled, {
                    color: temp.blendColor,
                    mode: temp.blendMode,
                    alpha: temp.blendAlpha
                });
            }
        } else if (filterKey === 'remove-color') {
            if (property === 'enabled') {
                form.setFieldsValue({
                    removeEnabled: filterValue
                })
                // 注意这里的filterKey是remove-color
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue, {
                    color: temp.removeColor,
                    distance: temp.removeDistance,
                    // useAlpha: temp.removeUseAlpha
                });
            } else {
                canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, temp.removeEnabled, {
                    color: temp.removeColor,
                    distance: temp.removeDistance,
                    // useAlpha: temp.removeUseAlpha
                });
            }
        } else {
            canvasRef?.current?.handler?.imageHandler.applyFilterByType(filterKey, filterValue);

        }
        const {filters} = data[0];
        filtersRef.current = filters;
        return;
    }

    return (
        <Form
            name="basic"
            labelCol={{
                span: 12,
            }}
            wrapperCol={{
                span: 12,
            }}
            form={form}
        >
            {startRender && <><Row>
                <Col span={6}>
                    <Form.Item label={"Grayscale"} colon={false}>
                        <SwitchButton tag={'grayscale'} text={'G'}
                                      value={!!filtersRef?.current?.[0]}
                                      handleChange={handleChange}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Invert"} colon={false}>
                        <SwitchButton tag={'invert'} text={'I'}
                                      value={!!filtersRef?.current?.[1]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Sepia"} colon={false}>
                        <SwitchButton tag={'sepia'} text={'S'}
                                      value={!!filtersRef?.current?.[3]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Brownie"} colon={false}>
                        <SwitchButton tag={'brownie'} text={'B'}
                                      value={!!filtersRef?.current?.[4]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Vintage"} colon={false}>
                        <SwitchButton tag={'vintage'} text={'V'}
                                      value={!!filtersRef?.current?.[9]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Blackwhite"} colon={false}>
                        <SwitchButton tag={'blackwhite'} text={'B'}
                                      value={!!filtersRef?.current?.[19]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Technicolor"} colon={false}>
                        <SwitchButton tag={'technicolor'} text={'T'}
                                      value={!!filtersRef?.current?.[14]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Polaroid"} colon={false}>
                        <SwitchButton tag={'polaroid'} text={'P'}
                                      value={!!filtersRef?.current?.[15]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Sharpen"} colon={false}>
                        <SwitchButton tag={'sharpen'} text={'S'}
                                      value={!!filtersRef?.current?.[12]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Emboss"} colon={false}>
                        <SwitchButton tag={'emboss'} text={'E'}
                                      value={!!filtersRef?.current?.[13]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Kodachrome"} colon={false}>
                        <SwitchButton tag={'kodachrome'} text={'K'}
                                      value={!!filtersRef?.current?.[18]}
                                      handleChange={handleChange}/>

                    </Form.Item>
                </Col>
            </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Gamma"} colon={false}
                                   name={'gammaEnabled'}>
                            <SwitchButton tag={'gamma'} text={'G'}
                                          value={!!filtersRef?.current?.[17]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Red"} colon={false}
                                   name={'gammaRed'}
                        >
                            <Slider
                                min={0.01}
                                max={2.2}
                                step={0.01}
                                onChange={(value) => handleChange("gamma", value, 'red')}/>
                            {/*
                        滑动时不会渲染，停下鼠标才会渲染，这种方法作为原子操作进undo/redo栈体验非常差    
                        onAfterChange={(value)=>handleChange("gamma",value,'red')} />*/}

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Green"} colon={false}
                                   name={'gammaGreen'}
                        >
                            <Slider
                                min={0.01}
                                max={2.2}
                                step={0.01}
                                onChange={(value) => handleChange("gamma", value, 'green')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Blue"} colon={false}
                                   name={'gammaBlue'}
                        >
                            <Slider
                                min={0.01}
                                max={2.2}
                                step={0.01}
                                onChange={(value) => handleChange("gamma", value, 'blue')}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Blend"} colon={false}
                                   name={'blendEnabled'}>
                            <SwitchButton tag={'blend-color'} text={'B'}
                                          value={!!filtersRef?.current?.[16]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Color"} colon={false}
                                   name={'blendColor'}
                        >
                            <input type="color"
                                   onChange={(value) => handleChange("blend-color", value, 'color')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Mode"} colon={false}
                                   name={'blendMode'}
                        >
                            <Select
                                // defaultValue={!!filtersRef?.current?.[16] && filtersRef?.current?.[16].mode}
                                style={{
                                    width: "100%",
                                    zIndex: 1000
                                }}
                                onChange={(value) => handleChange("blend-color", value, 'mode')}
                            >
                                {BlendColorMode.map((v: string) => {
                                    return <Select.Option value={v} key={v}>{`${v.charAt(0).toUpperCase()}${v.slice(1)}`}</Select.Option>

                                })}

                            </Select>


                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Alpha"} colon={false}
                                   name={'blendAlpha'}
                        >
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(value) => handleChange("blend-color", value, 'alpha')}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Remove"} colon={false}
                                   name={'removeEnabled'}>
                            <SwitchButton tag={'remove-color'} text={'R'}
                                          value={!!filtersRef?.current?.[2]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Color"} colon={false}
                                   name={'removeColor'}
                        >
                            <input type="color"
                                   onChange={(value) => handleChange("remove-color", value, 'color')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Distance"} colon={false}
                                   name={'removeDistance'}
                        >
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(value) => handleChange("remove-color", value, 'distance')}/>

                        </Form.Item>
                    </Col>
                    {/*<Col span={6}>
                    <Form.Item label={"UseAlpha"}  colon={false} 
                        name={'removeUseAlpha'}
                    >
                        <SwitchButton tag={'remove-color'} text={'U'} 
                        value={!!filtersRef?.current?.[2]?.useAlpha}
                        handleChange={handleChange}
                        property={'useAlpha'} />
                    </Form.Item>
                </Col>*/}
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Brightness"} colon={false}
                                   name={'brightnessEnabled'}>
                            <SwitchButton tag={'brightness'} text={'B'}
                                          value={!!filtersRef?.current?.[5]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Brightness"} colon={false}
                                   name={'brightnessPercentage'}
                        >
                            <Slider
                                min={-1}
                                max={1}
                                step={0.05}
                                // disabled={!!filtersRef?.current?.[5]?false:true}
                                onChange={(value) => handleChange("brightness", value, 'brightness')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Contrast"} colon={false}
                                   name={'contrastEnabled'}>
                            <SwitchButton tag={'contrast'} text={'C'}
                                          value={!!filtersRef?.current?.[6]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Contrast"} colon={false}
                                   name={'contrastPercentage'}
                        >
                            <Slider
                                min={-1}
                                max={1}
                                step={0.05}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("contrast", value, 'contrast')}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Saturation"} colon={false}
                                   name={'saturationEnabled'}>
                            <SwitchButton tag={'saturation'} text={'S'}
                                          value={!!filtersRef?.current?.[6]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Saturation"} colon={false}
                                   name={'saturationPercentage'}
                        >
                            <Slider
                                min={-1}
                                max={1}
                                step={0.05}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("saturation", value, 'saturation')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Hue"} colon={false}
                                   name={'hueEnabled'}>
                            <SwitchButton tag={'hue'} text={'H'}
                                          value={!!filtersRef?.current?.[21]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Hue"} colon={false}
                                   name={'huePercentage'}
                        >
                            <Slider
                                min={-2}
                                max={2}
                                step={0.005}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("hue", value, 'hue')}/>

                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={6}>
                        <Form.Item label={"Noise"} colon={false}
                                   name={'noiseEnabled'}>
                            <SwitchButton tag={'noise'} text={'N'}
                                          value={!!filtersRef?.current?.[8]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Noise"} colon={false}
                                   name={'noisePercentage'}
                        >
                            <Slider
                                min={0}
                                max={1000}
                                step={1}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("noise", value, 'noise')}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Pixelate"} colon={false}
                                   name={'pixelateEnabled'}>
                            <SwitchButton tag={'pixelate'} text={'P'}
                                          value={!!filtersRef?.current?.[10]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Pixelate"} colon={false}
                                   name={'pixelatePercentage'}
                        >
                            <Slider
                                min={1}
                                max={50}
                                step={1}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("pixelate", value, 'pixelate')}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label={"Blur"} colon={false}
                                   name={'blurEnabled'}>
                            <SwitchButton tag={'blur'} text={'B'}
                                          value={!!filtersRef?.current?.[11]}
                                          handleChange={handleChange}
                                          property={'enabled'}/>

                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={"Blur"} colon={false}
                                   name={'blurPercentage'}
                        >
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("blur", value, 'blur')}/>

                        </Form.Item>
                    </Col>
                </Row>

            </>}
        </Form>
    );

}

export default ImageFilterProperty;