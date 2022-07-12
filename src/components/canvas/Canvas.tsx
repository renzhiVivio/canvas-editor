import React, {Component, useRef} from "react";
import {fabric} from "fabric";
import Handler from "./handlers/Handler";
import {HandlerOptions} from "./handlers/helper";
import {v4 as uuidv4} from 'uuid';
import * as defaults from "./defaults";
import {filterObject} from "../../utils/projectUtils";

export interface CanvasInstance {
    handler: Handler,
    canvas: fabric.Canvas,
    container: HTMLDivElement,
}

export type CanvasProps = HandlerOptions & {
    responsive?: boolean;
    style?: React.CSSProperties;
}

interface IState {
    id: string,
    loaded: boolean
}

class InternalCanvas extends Component<CanvasProps, IState> {
    public handler!: Handler;
    public canvas!: fabric.Canvas;
    public containerRef = React.createRef<HTMLDivElement>();
    private resizeObserver?: ResizeObserver;

    state: IState = {
        id: uuidv4(),
        loaded: false
    }

    componentDidMount() {
        const {editable, canvasOption, width, height, responsive, objects, ...other} = this.props;
        const {id} = this.state;
        const mergedCanvasOption = Object.assign({}, defaults.canvasOption, filterObject(canvasOption), filterObject({
            width,
            height,
            selection: editable,
        }));

        this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
        this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        this.canvas.renderAll();
        this.handler = new Handler({
            id,
            width,
            height,
            editable,
            canvas: this.canvas,
            container: this.containerRef.current!,
            canvasOption: mergedCanvasOption,
            ...other,
        });
        if (this.props.responsive) {
            this.createObserver(mergedCanvasOption.width, mergedCanvasOption.height);
        } else {
            this.handleLoad();
        }
    }

    componentDidUpdate(prevProps: CanvasProps) {
        if (this.props.width && this.props.height && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
            this.handler.eventHandler.resize(this.props.width, this.props.height);
        }
        if (this.props.editable !== prevProps.editable) {
            this.handler.editable = this.props.editable ?? false;
        }
        if (this.props.responsive !== prevProps.responsive) {
            if (!this.props.responsive) {
                this.destroyObserver();
            } else {
                this.destroyObserver();
                this.createObserver(defaults.canvasOption.width, defaults.canvasOption.height);
            }
        }
        if (JSON.stringify(this.props.canvasOption) !== JSON.stringify(prevProps.canvasOption) && this.props.canvasOption) {
            this.handler.setCanvasOption(this.props.canvasOption);
        }
        if (JSON.stringify(this.props.keyEvent) !== JSON.stringify(prevProps.keyEvent) && this.props.keyEvent) {
            this.handler.setKeyEvent(this.props.keyEvent);
        }
        if (JSON.stringify(this.props.fabricObjects) !== JSON.stringify(prevProps.fabricObjects) && this.props.fabricObjects) {
            this.handler.setFabricObjects(this.props.fabricObjects);
        }
        if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption) && this.props.workareaOption) {
            this.handler.setWorkareaOption(this.props.workareaOption);
        }
        if (JSON.stringify(this.props.guidelineOption) !== JSON.stringify(prevProps.guidelineOption) && this.props.guidelineOption) {
            this.handler.setGuidelineOption(this.props.guidelineOption);
        }
        if (JSON.stringify(this.props.objectOption) !== JSON.stringify(prevProps.objectOption) && this.props.objectOption) {
            this.handler.setObjectOption(this.props.objectOption);
        }
        if (JSON.stringify(this.props.gridOption) !== JSON.stringify(prevProps.gridOption) && this.props.gridOption) {
            this.handler.setGridOption(this.props.gridOption);
        }
        if (JSON.stringify(this.props.propertiesToInclude) !== JSON.stringify(prevProps.propertiesToInclude) && this.props.propertiesToInclude) {
            this.handler.setPropertiesToInclude(this.props.propertiesToInclude);
        }
        if (JSON.stringify(this.props.activeSelectionOption) !== JSON.stringify(prevProps.activeSelectionOption) && this.props.activeSelectionOption) {
            this.handler.setActiveSelectionOption(this.props.activeSelectionOption);
        }
    }

    componentWillUnmount() {
        this.destroyObserver();
        this.handler.destroy();
        this.canvas.dispose();
    }

    createObserver = (width: number, height: number) => {
        this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            this.handler.eventHandler.resize(width, height);
            if (!this.state.loaded) {
                this.handleLoad();
            }
        });
        this.resizeObserver.observe(this.containerRef.current!);
    };

    destroyObserver = () => {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
    };

    handleLoad = () => {
        this.setState(
            {
                loaded: true,
            },
            () => {
                this.props.onLoad?.(this.handler, this.canvas);
            },
        );
    };

    render() {
        const {style} = this.props;
        const {id} = this.state;
        return (
            <div
                ref={this.containerRef}
                id={id}
                className="internal-canvas"
                style={{width: '100%', height: '100%', ...style}}
            >
                <canvas id={`canvas_${id}`}/>
            </div>
        );
    }
}

const Canvas: React.FC<CanvasProps> = React.forwardRef<CanvasInstance, CanvasProps>((props, ref) => {

    const canvasRef = useRef() as React.MutableRefObject<InternalCanvas>;

    React.useImperativeHandle(ref, () => (
        {
            canvas: canvasRef.current?.canvas!,
            container: canvasRef.current?.containerRef.current!,
            handler: canvasRef.current?.handler!,
        }
    ));

    return <InternalCanvas ref={canvasRef} {...props} />;
});

export default Canvas;