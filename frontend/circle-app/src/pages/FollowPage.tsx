import { useState, useEffect } from "react";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface User {
	id: number;
	username: string;
	full_name: string;
	photo_profile: string | null;
	bio: string | null;
	isFollowing?: boolean;
}

export default function FollowPage() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"followers" | "following">(
		"followers",
	);
	const [followers, setFollowers] = useState<User[]>([]);
	const [following, setFollowing] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);

	const currentUser = useSelector((state: any) => state.user.user);
	const token =
		useSelector((state: any) => state.user.token) ||
		localStorage.getItem("token");

	useEffect(() => {
		if (currentUser?.id) {
			fetchFollowers();
		}
	}, [currentUser]);

	// Listen for real-time following changes
	useEffect(() => {
		const handleFollowingChange = () => {
			if (currentUser?.id) {
				// Refetch data when following relationships change
				fetchFollowers();
			}
		};

		window.addEventListener(
			"currentUserFollowingChange",
			handleFollowingChange,
		);

		return () => {
			window.removeEventListener(
				"currentUserFollowingChange",
				handleFollowingChange,
			);
		};
	}, [currentUser]);

	const fetchFollowers = async () => {
		if (!token || !currentUser?.id) return;

		setLoading(true);
		try {
			// Fetch followers and following lists in parallel
			const [followersResponse, followingResponse] = await Promise.all([
				fetch(`http://localhost:9002/api/user/${currentUser.id}/followers`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch(`http://localhost:9002/api/user/${currentUser.id}/following`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			let followersList: User[] = [];
			let followingList: User[] = [];

			if (followersResponse.ok) {
				followersList = await followersResponse.json();
			}

			if (followingResponse.ok) {
				followingList = await followingResponse.json();
				setFollowing(followingList);
			}

			// Mark followers with following status
			const followingIds = new Set(followingList.map((u) => u.id));
			const followersWithStatus = followersList.map((user) => ({
				...user,
				isFollowing: followingIds.has(user.id),
			}));

			setFollowers(followersWithStatus);
		} catch (error) {
			console.error("Error fetching followers:", error);
			setFollowers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleFollow = async (targetUserId: number) => {
		if (!token) return;

		try {
			const response = await fetch("http://localhost:9002/api/user/follow", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ targetUserId }),
			});

			if (response.ok) {
				// Update followers to mark as followed
				setFollowers((prev) =>
					prev.map((u) =>
						u.id === targetUserId ? { ...u, isFollowing: true } : u,
					),
				);

				// Add to following list
				const newFollowingUser = followers.find((u) => u.id === targetUserId);
				if (newFollowingUser) {
					setFollowing((prev) => [
						...prev,
						{ ...newFollowingUser, isFollowing: undefined },
					]);
				}

				// update jumlah following menggunakan dispatch
				window.dispatchEvent(
					new CustomEvent("currentUserFollowingChange", {
						detail: { action: "increment" },
					}),
				);
			} else {
				console.error("Failed to follow user");
			}
		} catch (error) {
			console.error("Error following user:", error);
		}
	};

	const handleUnfollow = async (targetUserId: number) => {
		if (!token) return;

		try {
			const response = await fetch("http://localhost:9002/api/user/unfollow", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ targetUserId }),
			});

			if (response.ok) {
				// Remove from following list
				setFollowing((prev) => prev.filter((u) => u.id !== targetUserId));

				// Update followers to mark as not followed
				setFollowers((prev) =>
					prev.map((u) =>
						u.id === targetUserId ? { ...u, isFollowing: false } : u,
					),
				);

				// Dispatch real-time event for following count update
				window.dispatchEvent(
					new CustomEvent("followingCountChanged", {
						detail: { action: "decrement" },
					}),
				);
			} else {
				console.error("Failed to unfollow user");
			}
		} catch (error) {
			console.error("Error unfollowing user:", error);
		}
	};

	const BASE_URL = "http://localhost:9002/uploads/";

	const getCurrentUsers = () =>
		activeTab === "followers" ? followers : following;

	return (
		<div className="flex-1 ml-64 mr-80 border-l border-r border-neutral-800 bg-zinc-900 min-h-screen">
			{/* Header */}
			<div
				className="bg-zinc-800 py-4 px-4 font-semibold text-lg flex items-center gap-2 cursor-pointer hover:bg-zinc-700 transition-colors"
				onClick={() => navigate("/")}
			>
				<ArrowLeft size={20} className="text-white" />
				<h3 className="font-bold text-white">Follows</h3>
			</div>

			{/* Tab Navigation */}
			<div className="flex bg-zinc-800">
				<button
					onClick={() => setActiveTab("followers")}
					className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
						activeTab === "followers"
							? "text-blue-400 bg-zinc-700 border-b-2 border-blue-400"
							: "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700"
					}`}
				>
					<Users size={18} />
					Followers ({followers.length})
				</button>
				<button
					onClick={() => setActiveTab("following")}
					className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
						activeTab === "following"
							? "text-blue-400 bg-zinc-700 border-b-2 border-blue-400"
							: "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700"
					}`}
				>
					<UserCheck size={18} />
					Following ({following.length})
				</button>
			</div>

			{/* Content */}
			<div className="p-6">
				{loading ? (
					<div className="flex justify-center py-12 bg-zinc-800 rounded-lg">
						<div className="text-white">Loading...</div>
					</div>
				) : getCurrentUsers().length > 0 ? (
					<div className="space-y-3">
						{getCurrentUsers().map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
							>
								<div
									className="flex items-center space-x-4 cursor-pointer flex-1 min-w-0"
									onClick={() => navigate(`/profile/${user.id}`)}
								>
									<img
										src={
											user.photo_profile
												? `${BASE_URL}${user.photo_profile}`
												: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
										}
										alt={user.username}
										className="w-12 h-12 rounded-full object-cover flex-shrink-0"
									/>
									<div className="min-w-0 flex-1">
										<div className="font-semibold text-white text-base hover:text-blue-400 transition-colors truncate">
											{user.full_name}
										</div>
										<div className="text-sm text-zinc-400 truncate">
											@{user.username}
										</div>
										{user.bio && (
											<div className="text-sm text-zinc-500 mt-1 truncate">
												{user.bio}
											</div>
										)}
									</div>
								</div>
								{activeTab === "followers" &&
									(user.isFollowing ? (
										<button
											onClick={() => handleUnfollow(user.id)}
											className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ml-4"
										>
											Following
										</button>
									) : (
										<button
											onClick={() => handleFollow(user.id)}
											className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ml-4"
										>
											Follow
										</button>
									))}
								{activeTab === "following" && (
									<button
										onClick={() => handleUnfollow(user.id)}
										className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ml-4 whitespace-nowrap"
									>
										Unfollow
									</button>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-16 bg-zinc-800 rounded-lg">
						<div className="text-zinc-400 mb-2">
							{activeTab === "followers" ? (
								<Users size={48} />
							) : (
								<UserCheck size={48} />
							)}
						</div>
						<h3 className="text-lg font-semibold text-zinc-300 mb-2">
							No {activeTab} yet
						</h3>
						<p className="text-zinc-500">
							{activeTab === "followers"
								? "When people follow you, you'll see them here."
								: "Follow others to make a beautiful memories"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
