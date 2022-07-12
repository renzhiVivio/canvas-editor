import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import React from "react";
import {useDrag} from "react-dnd";
import {WidgetType} from "../types";
import ChangeHistoryOutlinedIcon from '@mui/icons-material/ChangeHistoryOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import HtmlIcon from '@mui/icons-material/Html';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import {InsertChartOutlinedOutlined} from "@mui/icons-material";
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import EscalatorIcon from '@mui/icons-material/Escalator';

export interface DraggableIconItem {
    type: WidgetType
}

function DraggableIcon(props: { widgetType: WidgetType }) {
    const [{isDragging}, drag] = useDrag(() => ({
        type: props.widgetType,
        item: {type: props.widgetType},
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    function Icon() {
        switch (props.widgetType) {
            case WidgetType.Rect:
                return <CheckBoxOutlineBlankOutlinedIcon/>;
            case WidgetType.Circle:
                return <CircleOutlinedIcon/>;
            case WidgetType.Triangle:
                return <ChangeHistoryOutlinedIcon/>;
            case WidgetType.Cube:
                return <ViewInArOutlinedIcon/>;
            case WidgetType.Image:
                return <ImageOutlinedIcon/>;
            case WidgetType.Gif:
                return <GifBoxOutlinedIcon/>;
            case WidgetType.Video:
                return <OndemandVideoOutlinedIcon/>
            case WidgetType.Element:
                return <HtmlIcon/>
            case WidgetType.Animation:
                return <AutoFixHighOutlinedIcon/>
            case WidgetType.VideoJS:
                return <OndemandVideoOutlinedIcon/>
            case WidgetType.Chart:
                return <InsertChartOutlinedOutlined/>
            case WidgetType.Iframe:
                return <FilterFramesIcon/>
            case WidgetType.Textbox:
                return <FormatColorTextIcon/>
            case WidgetType.Node:
                return <CloseFullscreenOutlinedIcon/>
            case WidgetType.IText:
                // return <FontAwesomeIcon icon={faAddressCard} />
                // return <RoomIcon/>
                const iconStyle={
                    fontFamily: "Font Awesome 5 Free",
                    fontWeight: 900,
                    fontSize: 26,
                    // width: 30,
                    // height: 30,
                    // fill:'black',
                    // editable: false,
                    // content:"\uf3c5"
                };
                return <i className="fas fa-map-marker-alt" style={iconStyle} />
            case WidgetType.Svg:
                return <EscalatorIcon/>  
            default:
                return <CheckBoxOutlineBlankOutlinedIcon/>
        }
    }

    return (
        <div ref={drag} style={{opacity: isDragging ? 0.5 : 1.0}}>
            <Icon/>
        </div>
    )
}

export default DraggableIcon;