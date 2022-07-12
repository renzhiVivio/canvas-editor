import React, {useEffect, useRef, useState} from 'react';
import {CanvasInstance} from "../../canvas/Canvas";
import SwitchButton from "../components/SwitchButton";
import {Col, Form, Radio, Row, Select, Slider} from 'antd';
import 'antd/dist/antd.min.css';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import './index.css';

const DefaultFontFamily = ['Arial', 'Helvetica', 'Georgia', 'Impact', 'Lucida Console', 'MS Sans Serif', 'New York', 'Symbol', 'Times New Roman']
const DefaultFontSize = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]

function TextboxProperty(props: {
    canvasRef: React.MutableRefObject<CanvasInstance | undefined>,
    data: any,
    setDoSth: (value: boolean) => void
}) {

    const [form] = Form.useForm();
    const {canvasRef, data, setDoSth} = props;
    const propertiesRef = useRef<any[]>([]);
    const {...options} = data[0];
    // 必须要有startRender,才能在渲染内容前确保获取options，然后进行数据同步
    const [startRender, setStartRender] = useState<boolean>(false);

    useEffect(() => {
        // console.log(options,'textData');
        propertiesRef.current = options;
        setStartRender(true);
        form.setFieldsValue({
            // @ts-ignore
            fontWeight: propertiesRef.current.fontWeight && propertiesRef.current.fontWeight === 'bold',
            // @ts-ignore
            textAlign: propertiesRef.current.textAlign === undefined ? 'left' : propertiesRef.current.textAlign,
            // @ts-ignore
            fontFamily: propertiesRef.current.fontFamily === undefined ? 'New York' : propertiesRef.current.fontFamily,
            // @ts-ignore
            fontSize: propertiesRef.current.fontSize === undefined ? 40 : propertiesRef.current.fontSize,
            // @ts-ignore
            charSpacing: propertiesRef.current.charSpacing === undefined ? 0 : propertiesRef.current.charSpacing,
            // @ts-ignore
            fill: propertiesRef.current.fill === undefined ? '#000000' : propertiesRef.current.fill,
            // html input[type=color]不支持alpha channel，所以没法选择透明色
            // @ts-ignore
            backgroundColor: propertiesRef.current.backgroundColor,
            // @ts-ignore
            borderColor: propertiesRef.current.borderColor,
        })

    }, [])

    const handleChange = (tag: any, value: any, property?: string, useIcon?: boolean) => {
        setDoSth(true);
        let temp = form.getFieldsValue();
        if (tag === 'fontWeight') {
            canvasRef?.current?.handler.set(tag, value ? 'bold' : 'normal');
            return;
        }
        if (tag === 'fontStyle') {
            canvasRef?.current?.handler.set(tag, value ? 'italic' : 'normal');
            return;
        }
        if (tag === 'textAlign') {
            canvasRef?.current?.handler.set(tag, Object.keys(value)[0]);
            return;
        }
        if (tag === 'fill') {
            canvasRef?.current?.handler.set(tag, temp.fill);
        } else if (tag === 'backgroundColor') {
            canvasRef?.current?.handler.set(tag, temp.backgroundColor);
        } else if (tag === 'borderColor') {
            canvasRef?.current?.handler.set(tag, temp.borderColor);

        } else canvasRef?.current?.handler.set(tag, value);
        return;
    }

    const handleFormChange = (values: any) => {
        Object.keys(values).forEach((ele) => {
            if (ele === 'textAlign') {
                let temp = values[ele];
                handleChange(ele, {[temp]: true});
            }
        })

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
            onValuesChange={handleFormChange}
        >
            {startRender && <><Row>
                <Col span={6}>
                    <Form.Item label={"Bold"} colon={false}>
                        <SwitchButton tag={'fontWeight'} text={'B'}
                            // 没有此属性或此属性等于normal时，value为false
                            // @ts-ignore
                                      value={propertiesRef.current.fontWeight && propertiesRef.current.fontWeight === 'bold'}
                                      handleChange={handleChange}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Italic"} colon={false}>
                        <SwitchButton tag={'fontStyle'} text={'I'}
                            // @ts-ignore
                                      value={propertiesRef.current.fontStyle && propertiesRef.current.fontStyle === 'italic'}
                                      handleChange={handleChange}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Through"} colon={false}>
                        <SwitchButton tag={'linethrough'} text={'L'}
                            // @ts-ignore
                                      value={propertiesRef.current.linethrough}
                                      property='linethrough'
                                      useIcon={true}
                                      handleChange={handleChange}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={"Underline"} colon={false}>
                        <SwitchButton tag={'underline'} text={'U'}
                            // @ts-ignore
                                      value={propertiesRef.current.underline}
                                      property='underline'
                                      useIcon={true}
                                      handleChange={handleChange}/>
                    </Form.Item>
                </Col>
            </Row>
                <Row>

                    <Col span={12}>
                        <Form.Item label={"Font Family"}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   name={'fontFamily'}
                        >
                            <Select
                                // defaultValue={!!filtersRef?.current?.[16] && filtersRef?.current?.[16].mode}
                                style={{
                                    width: "100%",
                                }}
                                onChange={(value) => handleChange("fontFamily", value)}
                            >
                                {DefaultFontFamily.map((v: string) => {
                                    return <Select.Option value={v} key={v}>{v}</Select.Option>

                                })}

                            </Select>


                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={"Font Size"}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   name={'fontSize'}
                        >
                            <Select
                                style={{
                                    width: "100%",
                                }}
                                onChange={(value) => handleChange("fontSize", value)}
                            >
                                {DefaultFontSize.map((v: number) => {
                                    return <Select.Option value={v} key={v}>{v}</Select.Option>

                                })}

                            </Select>


                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item name={'textAlign'}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   label={'Align'}>
                            <Radio.Group size={'small'}>

                                <Radio.Button value="left">
                                    <FormatAlignLeftIcon/>
                                </Radio.Button>

                                <Radio.Button value="center">
                                    <FormatAlignCenterIcon/>
                                </Radio.Button>

                                <Radio.Button value="right">
                                    <FormatAlignRightIcon/>
                                </Radio.Button>

                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={'charSpacing'}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   label={'Char Spacing'}>

                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                // disabled={!filtersRef?.current?.[5]}
                                onChange={(value) => handleChange("charSpacing", value)}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item label={"Color"}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   name={'fill'}
                        >
                            <input type="color"
                                   onChange={(value) => handleChange("fill", value)}/>

                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={"BG Color"}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   name={'backgroundColor'}
                        >
                            <input type="color"
                                   onChange={(value) => handleChange("backgroundColor", value)}/>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item label={"Border Color"}
                                   labelCol={{
                                       span: 8
                                   }}
                                   wrapperCol={{
                                       span: 16,
                                   }}
                                   colon={false}
                                   name={'borderColor'}
                        >
                            <input type="color"
                                   onChange={(value) => handleChange("borderColor", value)}/>

                        </Form.Item>
                    </Col>
                </Row>
            </>}
        </Form>
    );

}

export default TextboxProperty;