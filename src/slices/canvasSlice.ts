import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../app/store";
import {InteractionMode} from "../components/canvas/objects/helper";

export interface CanvasState {
    interactionMode: InteractionMode
}

const initialState = {
    interactionMode: 'selection'
} as CanvasState;

export const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        setInteractionMode: (state, action: PayloadAction<InteractionMode>) => {
            state.interactionMode = action.payload
        }
    }
})


export const {
    setInteractionMode,
} = canvasSlice.actions;

export const getCanvasInteractionMode = (state: RootState) => state.canvas.interactionMode;

export default canvasSlice.reducer;
