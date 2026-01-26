import { store } from "@/redux";

let socket: WebSocket | null = null;

export const connect = (token: string) => {
	if (socket && socket.readyState === WebSocket.OPEN) return socket;

	socket = new WebSocket("ws://localhost:9000");

	socket.onopen = () => {
		console.log("✅ WS Connected");
		setTimeout(() => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ type: "auth", token }));
			}
		}, 500);
	};

	socket.onclose = () => {
		console.log(`websocket disconnect`);
	};

	socket.onerror = (error) => {
		console.error("WebSocket connection error:", error);
	};

	socket.onmessage = (event) => {
		try {
			const rawData = JSON.parse(event.data);
        
        // Cek jika data yang diterima masih berupa string (nested JSON)
        // Seperti yang terlihat di console kamu: data: '{"type":"auth", ...}'
        let finalData = rawData;
        if (typeof rawData.data === 'string') {
            finalData = JSON.parse(rawData.data);
        }

        console.log("Parsed WebSocket Data:", finalData);
        handleGlobalUpdate(finalData);
		} catch (error) {
			console.log("Received WebSocket message (raw):", event.data);
			try {
				const rawData = JSON.parse(event.data);
				console.log("🧵 Processing raw new_thread message:", rawData);
				handleGlobalUpdate(rawData);
			} catch (rawError) {
				console.log("Failed to parse raw message:", rawError);
			}
		}
	};
	return socket;
};

const handleGlobalUpdate = (data: any) => {
	console.log(`for handle realtime global update`, data);

	switch (data.type) {
		case "NEW_THREAD":
			console.log("new thread ", data.thread || data.data);
			const threadData = data.thread || data.data;
			// Add new thread to the store
			store.dispatch({
				type: "threads/addThread",
				payload: {
					...threadData,
					likesCount: 0,
					isLiked: false,
				},
			});
			break;

		case "LIKE_UPDATE":
			console.log("like updating", data);
			// Update the likes count for the thread
			store.dispatch({
				type: "threads/updateThread",
				payload: { id: data.threadId, likesCount: data.likesCount },
			});
			break;

		case "NEW_REPLY":
			console.log("reply count updatin", data.data.thread_id);
			// Update the thread's reply count
			store.dispatch({
				type: "threads/updateThread",
				payload: {
					id: data.data.thread_id,
					number_of_replies: data.data.thread_replies_count || 0,
				},
			});

			const state = store.getState();
			const currentUserId = state.user.currentUser?.id;
			if (currentUserId && data.userId === currentUserId) {
				store.dispatch({
					type: "threads/updateLikeStatusThread",
					payload: {
						id: data.threadId,
						isLiked: data.liked,
						likesCount: data.likesCount,
					},
				});
			}

			// If there's a global callback for like update (e.g., for Status page)
			if ((window as any).likeUpdateCallback) {
				(window as any).likeUpdateCallback(data);
			}
			break;

		default:
			console.log("❓ Unhandled WebSocket message type:", data.type);
	}
};

export const disconnect = () => {
    if(socket){
        socket.close()
        socket = null
    }
}

export const getSocket = () => {
    return socket 
}