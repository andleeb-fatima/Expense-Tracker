import { createSlice, configureStore } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
const initialState = {
  filter: "all",
  notice: "new notice",
};
const ReduxSlice = createSlice({
  name: "updator",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setNotice: (state, action: PayloadAction<string>) => {
      state.notice = action.payload;
    },
  },
});
export const { setFilter, setNotice } = ReduxSlice.actions;
export const store = configureStore({
  reducer: ReduxSlice.reducer,
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export const selectFilter = (state: RootState) => state.filter;
export const selectNotice = (state: RootState) => state.notice;
