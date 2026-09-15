import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user.slice";
import apiToolReducer from './apiTool.slice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    apitool: apiToolReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
