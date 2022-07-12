import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form, Switch, Input, Tooltip} from 'antd';
import debounce from 'lodash/debounce';
import {Grid} from "@mui/material";
import ReactAce from 'react-ace';
import './index.css';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

import AcePreview from './AcePreview';

class AceEditor extends Component {
    handlers = {
        onChangeImportJS: debounce((value) => {
            this.setState({
                importJs: value,
                importJsAnnotations: this.importJsRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeImportJS) {
                    this.props.onChangeImportJS(value);
                }
            });
        }, 500),
        onChangeImportCSS: debounce((value) => {
            this.setState({
                importCss: value,
                importCssAnnotations: this.importCssRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeImportCSS) {
                    this.props.onChangeImportCSS(value);
                }
            });
        }, 500),
        
        onChangeHTML: debounce((value) => {
            this.setState({
                html: value,
                htmlAnnotations: this.htmlRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeHTML) {
                    this.props.onChangeHTML(value);
                }
            });
        }, 500),
        onChangeCSS: debounce((value) => {
            this.setState({
                css: value,
                cssAnnotations: this.cssRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeCSS) {
                    this.props.onChangeCSS(value);
                }
            });
        }, 500),
        onChangeJS: debounce((value) => {
            this.setState({
                js: value,
                jsAnnotations: this.jsRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeJS) {
                    this.props.onChangeJS(value);
                }
            });
        }, 500),
        activeOnload: debounce((value) => {
            this.setState({
                active: value,
            }, () => {
                if (this.props.activeOnload) {
                    this.props.activeOnload(value);
                }
            });
        }, 500),
        onChangeFunctionName: debounce((value) => {
            this.setState({
                funName: value.target.defaultValue,
            }, () => {
                if (this.props.onChangeFunctionName) {
                    this.props.onChangeFunctionName(value);
                }
            });
        }, 500),
        onValidateHTML: (annotations) => {
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
                this.htmlRef.editor.getSession().setAnnotations(annotations);
            }
        },
        getAnnotations: () => {
            const {htmlAnnotations, cssAnnotations, jsAnnotations, importCssAnnotations, importJsAnnotations,} = this.state;
            return {
                htmlAnnotations,
                cssAnnotations,
                jsAnnotations,
                importCssAnnotations,
                importJsAnnotations,
            };
        },
        getCodes: () => {
            const {html, css, js, importCss, importJs, active, funName} = this.state;
            return {
                html,
                css,
                js,
                importCss,
                importJs,
                active,
                funName
            };
        },
    }

    static propTypes = {
        isHTML: PropTypes.bool,
        isCSS: PropTypes.bool,
        isJS: PropTypes.bool,
        isImportCSS: PropTypes.bool,
        isImportJS: PropTypes.bool,
        isPreview: PropTypes.bool,
        html: PropTypes.string,
        css: PropTypes.string,
        js: PropTypes.string,
        importCss: PropTypes.string,
        importJs: PropTypes.string,
        active: PropTypes.bool,
        funName: PropTypes.string,
    }

    static defaultProps = {
        isHTML: true,
        isCSS: true,
        isJS: true,
        isImportCSS: true,
        isImportJS: true,
        isPreview: true,
        html: '',
        css: '',
        js: '',
        importCss: '',
        importJs: '',
        active: false,
        funName: '',
    }

    state = {
        html: this.props.html,
        css: this.props.css,
        js: this.props.js,
        importCss: this.props.importCss,
        importJs: this.props.importJs,
        active: this.props.active,
        funName: this.props.funName,
        htmlAnnotations: [],
        cssAnnotations: [],
        jsAnnotations: [],
        importCssAnnotations: [],
        importJsAnnotations: [],
    }

    componentWillUnmount() {
        this.htmlRef.editor.destroy();
        this.cssRef.editor.destroy();
        this.jsRef.editor.destroy();
        this.importCssRef.editor.destroy();
        this.importJsRef.editor.destroy();
    }

    render() {
        const {isHTML, isCSS, isJS, isPreview, isImportJS, isImportCSS } = this.props;
        const {html, css, js, importCss, importJs, active, funName}    = this.state;
        return (
            <Grid container spacing={1}>
                {
                    isImportJS ? (
                        <Grid item xs={6}>
                            <Form.Item style={{marginBottom:"0px"}}>
                                <ReactAce
                                    ref={(c) => {
                                        this.importJsRef = c;
                                    }}
                                    mode="text"
                                    theme="github"
                                    width="100%"
                                    height="200px"
                                    defaultValue={importJs}
                                    value={importJs}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeImportJS}
                                />
                            </Form.Item>
                            <Grid><span width="100%">Import JS (Single URL only)</span></Grid>
                        </Grid>
                    ) : null
                }
                {
                    isImportCSS ? (
                        <Grid item xs={6}>
                            <Form.Item style={{marginBottom:"0px"}}>
                                <ReactAce
                                    ref={(c) => {
                                        this.importCssRef = c;
                                    }}
                                    mode="text"
                                    theme="github"
                                    width="100%"
                                    height="200px"
                                    defaultValue={importCss}
                                    value={importCss}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeImportCSS}
                                />
                            </Form.Item>
                            <Grid><span width="100%">Import CSS (Single URL only)</span></Grid>
                        </Grid>
                    ) : null
                }
                {
                    isHTML ? (
                        <Grid item xs={6}>
                            <Form.Item style={{marginBottom:"0px"}}>
                                <ReactAce
                                    ref={(c) => {
                                        this.htmlRef = c;
                                    }}
                                    mode="html"
                                    theme="github"
                                    width="100%"
                                    height="200px"
                                    defaultValue={html}
                                    value={html}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeHTML}
                                />
                            </Form.Item>
                            <Grid><span width="100%">HTML</span></Grid>
                        </Grid>
                    ) : null
                }
                {
                    isCSS ? (
                        <Grid item xs={6}>
                            <Form.Item style={{marginBottom:"0px"}}>
                                <ReactAce
                                    ref={(c) => {
                                        this.cssRef = c;
                                    }}
                                    mode="css"
                                    theme="github"
                                    width="100%"
                                    height="200px"
                                    defaultValue={css}
                                    value={css}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeCSS}
                                />
                            </Form.Item>
                            <Grid><span width="100%">CSS</span></Grid>
                        </Grid>
                    ) : null
                }
                {
                    isJS ? (
                        <Grid item xs={6} >
                            <Form.Item style={{marginBottom:"0px"}}>
                                <ReactAce
                                    ref={(c) => {
                                        this.jsRef = c;
                                    }}
                                    mode="javascript"
                                    theme="github"
                                    width="100%"
                                    height="200px"
                                    defaultValue={js}
                                    value={js}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeJS}
                                />
                            </Form.Item>
                            <Grid><span width="100%">JS</span></Grid>
                        </Grid>
                    ) : null
                }
                {
                    isPreview ? (
                        <Grid item xs={6}>
                            <Form.Item style={{marginBottom:"0px"}}>
                                <AcePreview html={html} css={css} js={js} importJs={importJs} importCss={importCss} />
                            </Form.Item>
                            <Grid><span width="100%">Preview</span></Grid>
                        </Grid>
                    ) : null
                }
                <Grid item xs={6}>
                    <Grid container>
                        <Grid item xs={6}>
                            <Switch checkedChildren="启用" unCheckedChildren="停用" checked={active} onChange={this.handlers.activeOnload} />
                        </Grid>
                        <Grid item xs={6}>
                            <Form.Item label="函数名" colon={false} style={{marginBottom:"0px"}}>
                                <Input placeholder={"请置空或单个函数名"}
                                defaultValue={funName} onChange={this.handlers.onChangeFunctionName} ></Input>
                            </Form.Item>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Tooltip title="启用且函数名为空时整个JS会在页面加载后启用，启用且函数名不为空时指定的函数会在页面加载后启用">
                        <span width="100%">启用window.onload</span>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

export default AceEditor;
