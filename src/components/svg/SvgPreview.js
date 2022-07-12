import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SvgPreview extends Component {
	static propTypes = {
		svg: PropTypes.string,
	};

	static defaultProps = {
		svg: '',
	};

	componentDidMount() {
		const { svg } = this.props;
		this.iframeRender(svg);
	}

	componentDidUpdate(prevProps) {
		if (this.container) {
			const { svg } = this.props;
			if (svg !== prevProps.svg) {
				this.iframeRender(svg);
			}
		}
	}

	iframeRender = (svg) => {
		while (this.container.hasChildNodes()) {
			this.container.removeChild(this.container.firstChild);
		}
		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '400px';
		this.container.appendChild(iframe);
		iframe.contentDocument.body.innerHTML = svg;
	};

	render() {
		return (
			<div
				ref={(c) => {
					this.container = c;
				}}
				id="code-preview"
				style={{ width: '100%', height: 400 }}
			/>
		);
	}
}

export default SvgPreview;
