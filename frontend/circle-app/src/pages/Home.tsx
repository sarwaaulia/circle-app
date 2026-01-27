import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";
import CreateThread from "@/components/thread/PostThread";
import { fetchThreads, toggleLike as toggleLikeAction } from "@/stores/threadSlice";
import { connect } from "@/services/socket";
import toast from "react-hot-toast";

export default function HomePage() {
	const context = useContext(AuthContext);
	if (!context) return null;

	const { token } = context;
	const dispatch = useDispatch<any>();
	const currentUser = useSelector((state: any) => state.user.currentUser);
	const { threads, loading, error } = useSelector(
		(state: any) => state.threads,
	);

	useEffect(() => {
		if (token) {
			dispatch(fetchThreads());
			connect(token);
		}
	}, [token, dispatch]);

	// handler like/unlike 
	const handleToggleLike = async (threadId: number, likedStatus: boolean) => {
		try {
			await dispatch(toggleLikeAction({ threadId, currentIsLiked: likedStatus }))
		} catch (err) {
			toast.error("Gagal melakukan like");
		}
	};

	// Jika belum login
	if (!token) {
		return (
			<div>
				<p> Log in first to access more threads</p>
				<Link to="/login">
					<button>Login</button>
				</Link>
			</div>
		);
	}

	return (
		<div className="flex-1 ml-64 mr-80 border-l border-r border-neutral-800">
			{/* Header */}
			<header className="px-4 py-4 border-b border-neutral-800 sticky top-0 bg-zinc-850 backdrop-blur-md">
				<h2 className="font-bold text-lg text-white">Home</h2>
			</header>

			<CreateThread
				token={token!}
				photo_profile={
					currentUser?.photo_profile
						? `http://localhost:9000/uploads/${currentUser.photo_profile}`
						: undefined
				}
				isOnThreadCreate={(newThread) =>
					dispatch({
						type: "threads/addThread",
						payload: { ...newThread, likesCount: 0, isLiked: false }
					})
				}
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
				<ThreadList threads={threads} toggleLike={handleToggleLike} />
			)}
		</div>
	);
}
