import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Thread } from "@/types/Thread";

interface ThreadState {
	threads: Thread[];
	loading: boolean;
	error: string | null;
}

// kondisi awal membuka app
const initialState: ThreadState = {
	threads: [],
	loading: false,
	error: null,
};

// fetch threads menggunakan async thunk
export const fetchThreads = createAsyncThunk("threads/fetchAll", async () => {
	try {
		const response = await fetch("http://localhost:9000/api/v1/threads", {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch threads");
		}

		const data = await response.json();
		return data.data || [];
	} catch (error) {
		console.error("Error in fetchThreads:", error);
		throw error;
	}
});

export const fetchThreadId = createAsyncThunk(
	"threads/fetchId",
	async (id: number) => {
		try {
			const response = await fetch(`http://localhost:9000/api/v1/${id}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch thread with id ${id}`);
			}

			const data = await response.json();
			return data.data;
		} catch (error) {
			console.error("Error in fetch thread id:", error);
			throw error;
		}
	},
);

export const toggleLike = createAsyncThunk(
	"threads/toggleLike",
	async ({
		threadId,
		currentIsLiked,
	}: {
		threadId: number;
		currentIsLiked: boolean;
	}) => {
		try {
			const response = await fetch(
				`http://localhost:9000/api/v1/${threadId}/thread/like`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
						"Content-Type": "application/json",
					},
					credentials: "include",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to toggle like");
			}

			// fetch status like agar akurat
			const statusResponse = await fetch(
				`http://localhost:9000/api/v1/${threadId}/like/status`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					credentials: "include",
				},
			);

			if (statusResponse.ok) {
				const { isLiked, likesCount } = await statusResponse.json();
				return { threadId, isLiked, likesCount }; //mengirim status asli dari server
			} else {
				// Fallback jka gagal maka kalkulasi manual
				return { threadId, isLiked: !currentIsLiked, likesCount: 0 }; // jumlah like dengan optimistic update
			}
		} catch (error) {}
	},
);

const threadSlice = createSlice({
	name: "threads",
	initialState,
	reducers: {
		addThread: (state, action: PayloadAction<Thread>) => {
			const newThread = action.payload
			const isExist = state.threads.find((t) => t.id === newThread.id)

			if(!isExist){
				state.threads = [newThread, ...state.threads]
			}
		},

		updateThread: (state, action: PayloadAction<Partial<Thread> & { id: number }>) => {
			const index = state.threads.findIndex(
				(thread) => thread.id === action.payload.id,
			);
			if (index !== -1) {
				state.threads[index] = {
					...state.threads[index],
					// menggabungkan perubahan
					...action.payload,
				};
			}
		},

		updateLikeStatusThread: (
			state,
			action: PayloadAction<{
				id: number;
				isLiked: boolean;
				likesCount: number;
			}>,
		) => {
			const index = state.threads.findIndex(
				(thread) => thread.id === action.payload.id,
			);
			if (index !== -1) {
				state.threads[index].isLiked = action.payload.isLiked;
				state.threads[index].likesCount = action.payload.likesCount;
			}
		},

		clearThreads: (state) => {
			state.threads = [];
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(fetchThreads.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchThreads.fulfilled, (state, action) => {
				state.loading = false;
				state.threads = action.payload;
			})
			.addCase(fetchThreads.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch threads";
			})
			.addCase(toggleLike.fulfilled, (state, action) => {
				if (!action.payload) return;
				const { threadId, isLiked, likesCount } = action.payload;
				const index = state.threads.findIndex(
					(thread) => thread.id === threadId,
				);
				if (index !== -1) {
					state.threads[index].isLiked = isLiked;
					state.threads[index].likesCount = likesCount;
				}
			})
			.addCase(fetchThreadId.fulfilled, (state, action) => {
				const fetchedThread = action.payload;
				if (!fetchedThread) return;
				const index = state.threads.findIndex(
					(thread) => thread.id === fetchedThread.id,
				);
				if (index !== -1) {
					state.threads[index] = {
						...state.threads[index],
						...fetchedThread,
					};
				} else {
					state.threads.unshift(fetchedThread);
				}
			});
	},
});

export const { addThread, updateThread, updateLikeStatusThread, clearThreads } =
	threadSlice.actions;

export const selectThreads = (state: { threads: ThreadState }) =>
	state.threads.threads;
export const getThreadById = (state: { threads: ThreadState }, id: number) =>
	state.threads.threads.find((thread) => thread.id === id);

export default threadSlice.reducer;
