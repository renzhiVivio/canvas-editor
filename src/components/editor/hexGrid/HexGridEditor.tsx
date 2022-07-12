import React, {useRef} from 'react';
import {fabric} from 'fabric';
import {extendHex, defineGrid} from 'honeycomb-grid';
import Canvas, {CanvasInstance} from '../../canvas/Canvas';
import {v4 as uuidv4} from 'uuid';
import Handler from "../../canvas/handlers/Handler";

const Hexagon = fabric.util.createClass(fabric.Polygon, {
    type: 'polygon',
    superType: 'shape',
    editable: false,
    initialize(points: fabric.Point, option: fabric.Polygon) {
        this.callSuper('initialize', points, option);
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
    },
});

const HexGridEditor = () => {
    const canvasRef = useRef<CanvasInstance>();

    const handleLoad = (handler: Handler, canvas?: fabric.Canvas) => {
        const size = 20;
        const Hex = extendHex({
            size,
        });
        const Grid = defineGrid(Hex);
        const corners = Grid.rectangle({width: 10, height: 10}).map(hex => {
            const point = hex.toPoint();
            const corners = hex.corners().map(corner => corner.add(point));
            return corners;
        });
        const group = {
            id: uuidv4(),
            type: 'group',
            objects: corners.map(
                cs =>
                    new fabric.Polygon(cs, {
                        type: 'polygon',
                        originX: 'center',
                        originY: 'center',
                        fill: 'rgba(153, 153, 153, 0.5)',
                        borderColor: '#999',
                    }),
            ),
        };
        const createdObj = handler.add(group, false, true);
        handler.centerObject(createdObj, true);
    };

    return (
        <Canvas
            ref={canvasRef}
            editable={false}
            onLoad={handleLoad}
            activeSelectionOption={{
                hasControls: false,
            }}
            fabricObjects={{
                hexagon: {
                    create: ({points, ...other}) => new Hexagon(points, other),
                },
            }}
            canvasOption={{
                backgroundColor: '#434f5a',
            }}
        />
    );
};

export default HexGridEditor;
