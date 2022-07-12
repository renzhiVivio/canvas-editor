import React, {useRef} from 'react';
import {v4 as uuidv4} from 'uuid';
import Canvas, {CanvasInstance} from "../../canvas/Canvas";
import FiberHandler from "../../canvas/handlers/FiberHandler";
import CableSectionNode from "./node/CableSectionNode";

const FiberEditor = () => {
    const canvasRef = useRef<CanvasInstance>();
    const handleLoad = () => {
        const createdObj = canvasRef.current?.handler.add(
            {
                id: uuidv4(),
                type: 'cableNode',
                coreCount: 27,
                hasControls: false,
            },
            true,
        );
        const fiberHandler = canvasRef.current?.handler.registerHandler('fiber', FiberHandler) as FiberHandler;
    };
    return (
        <Canvas
            ref={canvasRef}
            onLoad={handleLoad}
            canvasOption={{backgroundColor: '#272727', fireRightClick: true}}
            workareaOption={{width: 0, height: 0}}
            activeSelectionOption={{hasControls: false, hasBorders: false}}
            fabricObjects={{
                cableNode: {
                    create: options => new CableSectionNode(options),
                },
            }}
        />
    );
};

export default FiberEditor;
