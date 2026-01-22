import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";
import { useSelector } from "react-redux";
import CreateThread from "@/components/thread/PostThread";
import { useWebSocket } from "../hooks/useWebSocket";
import Swal from "sweetalert2";

export default function HomePage() {
	const context = useContext(AuthContext);
	if (!context) return null;

	const { token } = context;
	const currentUser = useSelector((state: any) => state.user.currentUser);
	const [threads, setThreads] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { lastMessage } = useWebSocket("ws://localhost:9000");

	useEffect(() => {
		if (token) fetchThreads();
	}, [token]);

	async function fetchThreads() {
		try {
			const response = await fetch("http://localhost:9000/api/v1/threads", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await response.json();

			if (response.ok) {
				setThreads(data.data);
			} else {
				setError(data.message || "Failed to fetch threads");
			}
		} catch {
			setError("An error occurred while fetching threads");
		} finally {
			setLoading(false);
		}
	}

	// handle saat user berhasil up new thread
	const handleCreatedThread = (newThread: any) => {
		const userData = newThread.user || currentUser
		const threadNew = {
			...newThread,
			likesCount: 0,
			isLiked: false,
			full_name: userData.full_name || currentUser?.full_name || "Anonymous",
			username: userData.username || currentUser?.username || "user",
			profilePic: userData.photo_profile || currentUser?.photo_profile || null,
		};
		setThreads((prev) => [threadNew, ...prev]);

		// jumlah foto jika posting ada gambar
		const imgCount = newThread.image ? 1 : 0;
		const msg = imgCount > 0 ? `posted new thread with ${imgCount} image success` : "posted new thread";
		Swal.fire({
			icon: "success",
			title: "post success",
			text: msg,
			timer: 2000,
			showConfirmButton: false,
			background: '#18181b',
			color: "#ffffff",
			iconColor: "#3b82f6",
		})
	};

	
	// Listen for real-time thread updates
	useEffect(() => {
		if (lastMessage && lastMessage.type === "new_thread") {
			// Tambahkan thread baru ke posisi paling atas secara realtime
			const incomingThread = {
				...lastMessage.payload,
				likesCount: 0,
				isLiked: false,
			};
			setThreads((prev) => [incomingThread, ...prev]);
		}
	}, [lastMessage]);


	// LIKE / UNLIKE
	const toggleLike = async (threadId: number, isLiked: boolean) => {
		try {
			// cari thread yang mau di like/unlike
			const thread = threads.find((t) => t.id === threadId);
			if (!thread) return;

			// method untuk likesnya
			const method = isLiked ? "DELETE" : "POST";

			// kirim req ke server
			await fetch(`http://localhost:9000/api/v1/${threadId}/like`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			// update state lokal => langsung nambah/kurang 1 likesnya
			const newIsLiked = !isLiked;
			const newLikesCount = isLiked
				? (thread.likesCount || 1) - 1
				: (thread.likesCount || 0) + 1;

			setThreads((prev) =>
				prev.map((t) =>
					t.id === threadId
						? {
								...t,
								isLiked: newIsLiked,
								likesCount: newLikesCount,
							}
						: t,
				),
			);
		} catch (error) {
			console.log("Error toggling like:", error);
		}
	};

	// Jika belum login
	if (!token) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-white">
                <p className="font-semibold capitalize mb-5 text-xl">
                    Log in first to access more threads
                </p>
                <Link to="/login">
                    <button className="bg-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
                        Login
                    </button>
                </Link>
            </div>
		);
	}

	return (
		<div className="flex-1 ml-64 mr-80 border-l border-r border-neutral-800 min-h-screen">
			{/* Header */}
			<header className="px-4 py-4 border-b border-neutral-800 sticky top-0 bg-zinc-850 backdrop-blur-md z-10">
				<h2 className="font-bold text-lg text-white">Home</h2>
			</header>

			<CreateThread
				token={token!}
				profile={
					currentUser?.photo_profile
						? `http://localhost:9000/uploads/${currentUser.photo_profile}`
						: undefined
				}
				isOnThreadCreate={handleCreatedThread}
			/>

			{/* Content */}
			{loading ? (
				<div className="flex flex-col items-center justify-center py-20 space-y-4">
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			) : error ? (
				<div className="text-center text-red-400 py-10">Error: {error}</div>
			) : threads.length === 0 ? (
				<p className="text-center py-10 text-gray-500">No threads available.</p>
			) : (
				// kirim toggleLike ke ThreadList
				<ThreadList threads={threads} toggleLike={toggleLike} />
			)}
		</div>
	);
}
