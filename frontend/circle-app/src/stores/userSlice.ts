import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/User";

interface UserState {
	user: Partial<User> | null;
	token: string | null;
	isAuthenticated: boolean;
	currentUser: Partial<User> | null;
	followingNumber: number;
}

const initialState: UserState = {
	user: null,
	token: null,
	isAuthenticated: false,
	currentUser: null, // ← tidak nested lagi
	followingNumber: 0,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setAuth: (
			state,
			action: PayloadAction<{ user: Partial<User>; token: string }>,
		) => {
			state.user = {
				...state.user,
				...action.payload.user,
			};
			state.currentUser = {
				...state.currentUser,
				...action.payload.user,
			};
			if (action.payload.token) {
				state.token = action.payload.token;
				localStorage.setItem("token", action.payload.token);
			}
			state.isAuthenticated = true;

			// userSlice.ts
			const savedUser = localStorage.getItem("currentUser");
		},

		logout: (state) => {
			state.currentUser = null;
			state.token = null;
			state.isAuthenticated = false;
			localStorage.removeItem("token");
		},

		incrementFollowing: (state) => {},
	},
});

export const { setAuth, logout } = userSlice.actions;
export default userSlice.reducer;
