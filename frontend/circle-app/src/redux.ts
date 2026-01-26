import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./stores/userSlice";
import replyReducer from "./stores/replySlice";
import threadReducer from "./stores/threadSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        replies: replyReducer,
        threads: threadReducer
    }
})