import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./stores/userSlice";

export const store = configureStore({
    reducer: {
        user: userReducer
    }
})