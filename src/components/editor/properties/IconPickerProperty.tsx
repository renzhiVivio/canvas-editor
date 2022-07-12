import React, {useEffect, useState} from 'react';
import {CanvasInstance} from "../../canvas/Canvas";
import {Button, Col, Form, Input, Pagination, Row} from 'antd';
import 'antd/dist/antd.min.css';
import icons from '../../canvas/constants/icons.json';

const iconStyle = {
    // fontFamily: "Font Awesome 6 Free",
    fontWeight: 900,
    fontSize: 30,
    // width: 30,
    // height: 30,
    // fill:'black',
    // editable: false,

};

function IconPickerProperty(props: {
    canvasRef: React.MutableRefObject<CanvasInstance | undefined>,
    data: any,
    setIconPickerModalOpenStep1: (value:boolean) => void,
}) {

    const [form] = Form.useForm();
    const [colorform] = Form.useForm();
    const [tempColor, setTempColor] = useState<string>('#000000');
    const {canvasRef, data, setIconPickerModalOpenStep1} = props;

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageLength, setPageLength] = useState<number>(32);
    const [searchParam, setSearchParam] = useState<string>('');
    // 初始化首页显示的icons，注意要将对象转换成对象数组，方便和后面filter后的结果数据结构一致
    const [showingIcons, setShowingIcons] = useState<any>(Object.keys(icons).slice((currentPage - 1) * pageLength, currentPage * pageLength).map((ic) => {
        // @ts-ignore
        return {[ic]: icons[ic]}
    }));
    const [total, setTotal] = useState<number>(Object.keys(icons).length);

    const handleChange = (key: string, icon: Record<string, any>) => {
        // 注意不能只set text，必须把fontFamily也set了
        if (icon[key].styles[0] === 'brands') {
            canvasRef?.current?.handler.set('fontFamily', 'Font Awesome 6 Brands');
        } else if (icon[key].styles[0] === 'regular') {
            canvasRef?.current?.handler.set('fontFamily', 'Font Awesome 6 Regular');
        } else {
            canvasRef?.current?.handler.set('fontFamily', 'Font Awesome 6 Free');

        }
        canvasRef?.current?.handler.set('text', String.fromCharCode(parseInt(icon[key].unicode, 16)));
        canvasRef?.current?.handler.set('icon', icon[key]);
        setIconPickerModalOpenStep1(false);
    }

    // 根据当前页、页面数据量和搜索值进行filter
    // filter出icons中符合搜索值的数据,setTotal设置总量，然后让分页组件渲染
    // 根据当前页和页面数据量进行slice，然后setShowingIcons进行渲染
    useEffect(() => {
        // @ts-ignore
        let fil = Object.keys(icons).filter(icon => icon.includes(searchParam) || icons[icon].search.terms.some(term => term.includes(searchParam)));
        setTotal(fil.length);
        // @ts-ignore
        setShowingIcons(fil.slice((currentPage - 1) * pageLength, currentPage * pageLength).map(icon => ({[icon]: icons[icon]})));
    }, [currentPage, pageLength, searchParam])

    useEffect(() => {
        colorform.setFieldsValue({
            fill: '#000000'
        });
        form.setFieldsValue({
            searchParam: ''
        })
    }, [])

    return (
        <><Form
            name="basic"
            labelCol={{
                span: 12,
            }}
            wrapperCol={{
                span: 12,
            }}
            form={form}
            onChange={() => {
                const values = form.getFieldsValue();
                // 注意，只要进行搜索输入，都应该将当前页面置1，防止过滤后的数据超出页面*页面数据量
                setCurrentPage(1);
                setSearchParam(values.searchParam.toLowerCase());
            }}
        >
            <Row>
                <Form.Item wrapperCol={{span: 24}} colon={false} name={'searchParam'} style={{width: "100%"}}>
                    <Input
                        placeholder={`Search ${total} Icons for ...`}
                        size="large"
                    />
                </Form.Item>
            </Row>
        </Form>
        <Row>
            {showingIcons.length>0?Object.keys(showingIcons).map((icon)=>{
                const key = Object.keys(showingIcons[icon])[0];

                return <Col span={6} key={key}>
                    <Button style={{width:"100%",height:"80px"}} type="text"
                    onClick={()=>handleChange(key,showingIcons[icon])}
                    >
                        <Row>
                            {/* 渲染icon图标 */}
                            
                            <Col span={24}><i className={`${showingIcons[icon][key].styles[0]==="brands"?"fab":showingIcons[icon][key].styles[0]==="regular"?"far":"fas"} fa-${key}`} style={iconStyle} /></Col>
                            <Col span={24}>{showingIcons[icon][key].label}</Col>
                        </Row>
                    </Button>
                    
                </Col>
            }

            ):<span>No results</span>}
        </Row>
            
        {showingIcons.length>0?<Row >
            <Col span={6}>
            <Form form={colorform} onChange={()=>{
                let temp = colorform.getFieldsValue();
                setTempColor(temp.fill);
                // setIconPickerModalOpenStep1(false);
            }}>
                <Row>
                <Form.Item label={"Color"} 
                labelCol={{
                    span:12
                }}
                wrapperCol={{
                    span: 12,
                }}
                colon={false}
                name={'fill'}
                >
                <input type="color" />
                
                </Form.Item>
                <Col span={6} push={2}>
                    <Button type="default" onClick={()=>{
                        canvasRef?.current?.handler.set('fill', tempColor)
                        setIconPickerModalOpenStep1(false)}
                    }>
                        Apply
                    </Button>
                </Col>
                </Row>
            </Form>
            </Col>
            {/* 用于左右两边对齐 */}
            <Col flex="auto"></Col>
            <Col><Pagination current={currentPage}
            defaultPageSize={pageLength}
            pageSizeOptions={[16,24,32]}
            onChange={(page, pageSize)=>{
                setPageLength(pageSize);
                setCurrentPage(page);
            }}
            hideOnSinglePage={true}
            showQuickJumper={true}
            showSizeChanger={true}
            total={total} />
            </Col>
        </Row>:<></>}
        </>
    );

}

export default IconPickerProperty;