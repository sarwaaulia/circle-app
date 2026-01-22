import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from "../types/User";

interface UserState {
  user: Partial<User> | null;
  token: string | null;
  isAuthenticated: boolean;
  currentUser: Partial<User> | null;
  followingCount: number;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  currentUser: null,
  followingCount: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: Partial<User>; token?: string }>
    ) => {
      state.user = {
        ...state.user,
        ...action.payload.user,
      };

      state.currentUser = {
        ...state.currentUser,
        ...action.payload.user,
      };

      // token
      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      }
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },

    incrementFollowing: (state) => {
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;