export enum WidgetType {
    Rect = 'Rect',
    Circle = 'Circle',
    Triangle = 'Triangle',
    Cube = 'Cube',
    Image = 'Image',
    Gif = 'Gif',
    Video = 'Video',
    Element = 'Element',
    Animation = 'Animation',
    VideoJS = 'VideoJS',
    Chart = 'Chart',
    Iframe = 'Iframe',
    Textbox = 'Textbox',
    Node = 'Node',
    IText = 'IText',
    Svg = 'Svg',
}

export function indexToWidgetType(i: number) {
    switch (i % Object.keys(WidgetType).length) {
        case 1:
            return WidgetType.Circle;
        case 2:
            return WidgetType.Triangle;
        case 3:
            return WidgetType.Cube;
        case 4:
            return WidgetType.Image;
        case 5:
            return WidgetType.Gif;
        case 6:
            return WidgetType.Video;
        case 7:
            return WidgetType.Element;
        case 8:
            return WidgetType.Animation;
        case 9:
            return WidgetType.VideoJS;
        case 10:
            return WidgetType.Chart;
        case 11:
            return WidgetType.Iframe;
        case 12:
            return WidgetType.Textbox;
        case 13:
            return WidgetType.Node;
        case 14:
            return WidgetType.IText;
        case 15:
            return WidgetType.Svg;
        default:
            return WidgetType.Rect;
    }
}