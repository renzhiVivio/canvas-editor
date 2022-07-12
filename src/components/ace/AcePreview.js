import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AcePreview extends Component {
	static propTypes = {
		html: PropTypes.string,
		css: PropTypes.string,
		js: PropTypes.string,
		importJs: PropTypes.string,
		importCss: PropTypes.string,
		active: PropTypes.bool,
		funName: PropTypes.string,
	};

	static defaultProps = {
		html: '',
		css: '',
		js: '',
		importJs: '',
		importCss: '',
		active: false,
		funName: '',
	};

	componentDidMount() {
		const { html, css, js, importJs, importCss, active, funName } = this.props;
		this.iframeRender(html, css, js, importJs, importCss, active, funName);
	}

	componentDidUpdate(prevProps) {
		if (this.container) {
			const { html, css, js, importJs, importCss, active, funName } = this.props;
			if (html !== prevProps.html || css !== prevProps.css || js !== prevProps.js
			|| importJs !== prevProps.importJs || importCss !== prevProps.importCss
			|| active !== prevProps.active || funName !== prevProps.funName
			) {
				this.iframeRender(html, css, js, importJs, importCss, active, funName);
			}
		}
	}

	iframeRender = (html, css, js, importJs, importCss, active, funName) => {
		while (this.container.hasChildNodes()) {
			this.container.removeChild(this.container.firstChild);
		}
		
		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '200px';
		this.container.appendChild(iframe);

		const importScript = document.createElement('script');
		importScript.type = 'text/javascript';
		importScript.src = importJs;
		iframe.contentDocument.head.appendChild(importScript);

		const importStyle = document.createElement('link');
		importStyle.rel = 'stylesheet';
		importStyle.href = importCss;
		iframe.contentDocument.head.appendChild(importStyle);
		
		
		// this.container.appendChild(importCss);
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		iframe.contentDocument.head.appendChild(style);

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.innerHTML = js;
		iframe.contentDocument.head.appendChild(script);
		iframe.contentDocument.body.innerHTML = html;

	};

	render() {
		return (
			<div
				ref={(c) => {
					this.container = c;
				}}
				id="code-preview"
				style={{ width: '100%', height: 200 }}
			/>
		);
	}
}

export default AcePreview;
