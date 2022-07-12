import React from 'react';
import Canvas from "../../canvas/Canvas";

function PreviewWindow(props: { objects: any[], previewWidth: number, previewHeight: number }) {

    const {objects} = props;
    return (
        <div style={{position: 'absolute', overflow: 'hidden', top: 0, left: 0, width: props.previewWidth, height: props.previewHeight}}
             id='canvas-container-div'>
            <Canvas
                editable={false}
                canvasOption={{
                    width: props.previewWidth,
                    height: props.previewHeight,
                    perPixelTargetFind: true,
                }}
                responsive={true}
                workareaOption={{
                    width: props.previewWidth,
                    height: props.previewHeight,
                    backgroundColor: 'lightgray',
                }}
                onLoad={handler => {
                    handler.importJSON(objects)
                }}
                minZoom={100}
                maxZoom={100}
            />
        </div>
    );
}

export default PreviewWindow;
