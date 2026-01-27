import { store } from "@/redux";
import { addThread, updateThread, updateLikeStatusThread } from "@/stores/threadSlice";

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
			// Seperti yang terlihat di console : data: '{"type":"auth", ...}'
			let finalData = rawData;
			if (typeof rawData.data === "string") {
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
    switch (data.type) {
        case "NEW_THREAD": {
            const threadData = data.thread || data.data;
            if (threadData) {
                // ✅ Gunakan action creator
                store.dispatch(addThread({
                    ...threadData,
                    likesCount: 0,
                    isLiked: false,
                }));
            }
            break;
        }

        case "LIKE_UPDATE": {
            store.dispatch(updateThread({ 
                id: data.threadId, 
                likesCount: data.likesCount 
            }));

            // Cek jika user yang sedang login adalah yang melakukan like
            const state = store.getState();
            const currentUserId = state.user.user?.id;
            if (currentUserId && data.userId === currentUserId) {
                store.dispatch(updateLikeStatusThread({
                    id: data.threadId,
                    isLiked: data.liked,
                    likesCount: data.likesCount,
                }));
            }
            break;
        }

        case "NEW_REPLY": {
            const { threadId, reply, repliesCount } = data.data;
            
            // update jumlah reply di list thread
            store.dispatch(updateThread({
                id: threadId,
                number_of_replies: repliesCount,
            }));

            // jika ada reply detail/status reply, masukkan ke slice reply (jika ada)
            if (reply) {
                store.dispatch({ type: "reply/addReply", payload: reply });
            }
            break;
        }

        default:
            console.log("❓ Unhandled message:", data.type);
    }
};

export const disconnect = () => {
	if (socket) {
		socket.close();
		socket = null;
	}
};

export const getSocket = () => {
	return socket;
};
