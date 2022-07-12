import React, {useState} from 'react';
import './App.css';

import {CSSObject, styled, Theme, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableIcon from "./components/DraggableIcon";
import {indexToWidgetType} from "./types";
import GridEditor from "./components/editor/grid/GridEditor";
import {PolylineOutlined} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "./app/hooks";
import {getCanvasInteractionMode, setInteractionMode} from "./slices/canvasSlice";
import {InteractionMode} from "./components/canvas/objects/helper";
import '@fortawesome/fontawesome-free/css/all.min.css';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


function App() {

    const dispatch = useAppDispatch();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const sCanvasInteractionMode = useAppSelector(getCanvasInteractionMode);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    // @ts-ignore
    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{display: 'flex', minHeight: '100vh'}}>
                <CssBaseline/>
                <AppBar position="fixed" open={open}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{
                                marginRight: 5,
                                ...(open && {display: 'none'}),
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            Canvas Editor
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                        </IconButton>
                    </DrawerHeader>
                    <Divider/>
                    <List>

                        {['Rect', 'Circle', 'Triangle', 'Cube', 'Image', 'Gif', 'Video', 'Element', 'Animation', 'VideoJS', 'Chart', 'Iframe', 'Textbox', 'Node', 'IText', 'Svg'].map((text, index) => (

                            <ListItem key={text} disablePadding sx={{minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5,}}>
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                    style={{
                                        textAlign:'center',
                                    }}
                                >
                                    <DraggableIcon widgetType={indexToWidgetType(index)}/>
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{opacity: open ? 1 : 0}}/>
                            </ListItem>
                        ))}
                        <Divider/>
                        {['polygon' as InteractionMode, 'line' as InteractionMode, 'arrow' as InteractionMode].map((text) => (
                            <ListItem key={text} disablePadding sx={{minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5,}}>
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <PolylineOutlined onClick={() => dispatch(setInteractionMode(text))}
                                                      color={sCanvasInteractionMode === text ? "primary" : "action"}/>
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{opacity: open ? 1 : 0}}/>
                            </ListItem>
                        ))}
                        <Divider/>

                    </List>
                </Drawer>
                <Box component="main" sx={{flexGrow: 1, p: 0, backgroundColor: 'lightgray'}}>
                    <DrawerHeader/>
                    <GridEditor interactionMode={sCanvasInteractionMode} editWidth={1500} editHeight={800}/>
                </Box>
            </Box>
        </DndProvider>
    );
}

export default App;
