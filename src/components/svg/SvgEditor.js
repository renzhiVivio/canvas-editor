import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form} from 'antd';
import debounce from 'lodash/debounce';
import {Grid} from "@mui/material";
import ReactAce from 'react-ace';
import { Upload, message } from 'antd';
import { Button } from "@mui/material";

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

import SvgPreview from './SvgPreview';

const defaultStyle = {
    padding: 12,
};

class SvgEditor extends Component {
    handlers = {
        onChangeSvg: debounce((value) => {
            this.setState({
                svg: value,
                svgAnnotations: this.svgRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeSvg) {
                    this.props.onChangeSvg(value);
                }
            });
        }, 500),
        
        onValidateSvg: (annotations) => {
            let i     = annotations.length;
            const len = annotations.length;
            while (i--) {
                if (/doctype first\. Expected/.test(annotations[i].text)) {
                    annotations.splice(i, 1);
                } else if (/Unexpected End of file\. Expected/.test(annotations[i].text)) {
                    annotations.splice(i, 1);
                }
            }
            if (len > annotations.length) {
                this.svgRef.editor.getSession().setAnnotations(annotations);
            }
        },
        getAnnotations: () => {
            const {svgAnnotations} = this.state;
            return {
                svgAnnotations,
            };
        },
        getCodes: () => {
            const {svg} = this.state;
            return {
                svg,
            };
        },
    }

    static propTypes = {
        isSvg: PropTypes.bool,
        isPreview: PropTypes.bool,
        svg: PropTypes.string,
    }

    static defaultProps = {
        isSvg: true,
        isPreview: true,
        svg: '',
    }

    state = {
        svg: this.props.svg,
        svgAnnotations: [],
    }

    componentWillUnmount() {
        this.svgRef.editor.destroy();
    }

    render() {
        const {isSvg, isPreview} = this.props;
        const {svg} = this.state;
        return (
            <Grid container spacing={1}>
                {
                    isSvg ? (
                        <Grid item xs={6}>
                            <Form.Item label="SVG" colon={false}>
                                <ReactAce
                                    ref={(c) => {
                                        this.svgRef = c;
                                    }}
                                    mode="html"
                                    theme="github"
                                    width="100%"
                                    height="400px"
                                    defaultValue={svg}
                                    value={svg}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeSvg}
                                />
                            </Form.Item>
                        </Grid>
                    ) : null
                }
                
                {
                    isPreview ? (
                        <Grid item xs={6}>
                            <Form.Item label="Preview" colon={false}>
                                <SvgPreview svg={svg}/>
                            </Form.Item>
                        </Grid>
                    ) : null
                }
                
                    
                <Grid item xs={6}>
                    <Upload
                        maxCount={1}
                        beforeUpload={(file) => {
                            const allow = ['image/svg+xml'];
                            if (allow.indexOf(file.type) >= 0){
                                const reader = new FileReader();
                                reader.readAsText(file);
                                reader.onload = (evt) => {
                                   if(evt?.target?.readyState===2){
                                       this.setState({
                                           svg:evt.target.result
                                       })
                                   }else{
                                       this.setState({
                                           svg:"Loading Error, please check your uploaded file"
                                       })
                                   };
                                };
                            }else this.setState({
                                           svg:"File Type Error, please check"
                                       });
                            return false;

                            
                        }}
                        onRemove={()=>{
                            this.setState({
                               svg:""
                            })
                        }}
                    >
                        <Button>Upload SVG File (Max: 1)</Button>
                    </Upload>
                </Grid>
                
                
            </Grid>
        );
    }
}

export default SvgEditor;
