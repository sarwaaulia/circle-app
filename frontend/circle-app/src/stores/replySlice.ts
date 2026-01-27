import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Reply } from "@/types/Reply";

interface RepliesState {
	replies: Reply[];
	loading: boolean;
	error: string | null;
}

const initialState: RepliesState = {
	replies: [],
	loading: false,
	error: null,
};

// fetch replies by thread
export const fetchThreadReply = createAsyncThunk(
	"replies/fetchByThread",
	async (threadId: string) => {
		const response = await fetch(
			`http://localhost:9000/api/v1/replies/thread/${threadId}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			},
		);
		if (!response.ok) {
			throw new Error("Failed to fetch replies");
		}

		const data = await response.json();
		return data.data || [];
	},
);

export const toggleReplyLike = createAsyncThunk(
	"replies/toggleLike",
	async ({
		replyId,
		currentIsLiked,
	}: {
		replyId: number;
		currentIsLiked: boolean;
	}) => {
		const response = await fetch(
			`http://localhost:9000/api/v1/replies/${replyId}/like`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
			},
		);
		if (!response.ok) {
			throw new Error("Failed to toggle like");
		}
		return { replyId };
	},
);

const replySlice = createSlice({
	name: "reply",
	initialState,
	reducers: {
		setReplies: (state, action: PayloadAction<Reply[]>) => {
			state.replies = action.payload;
		},
		addReply: (state, action: PayloadAction<Reply>) => {
			const exists = state.replies.some(
				(reply) => reply.id === action.payload.id,
			);

			if (!exists) {
				state.replies.unshift(action.payload);
			}
		},
		clearReplies: (state) => {
			state.replies = [];
		},
	},
	extraReducers: (builder) => {
		builder
			// fetchByThread
			.addCase(fetchThreadReply.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchThreadReply.fulfilled, (state, action) => {
				state.loading = false;
				state.replies = action.payload;
			})
			.addCase(fetchThreadReply.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch replies";
			})

			// toggleLike
			.addCase(toggleReplyLike.pending, (state) => {
				state.error = null;
			})
			.addCase(toggleReplyLike.fulfilled, (state, action) => {})
			.addCase(toggleReplyLike.rejected, (state, action) => {
				state.error = action.error.message || "Failed to toggle like";
			});
	},
});

export const { setReplies, addReply, clearReplies } = replySlice.actions;
export default replySlice.reducer;
