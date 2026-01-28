import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toggleLike } from "../stores/threadSlice";
import FollowersFollowingModal from "../components/profile/FollFollModal";
import ProfileModal from "../components/profile/ProfileModal";
import EditProfile from "../components/profile/EditProfile";
import ProfilePosts from "../components/profile/ProfilePosts";
import ProfileMedia from "../components/profile/ProfileMedia";
import UserProfileHeader from "@/components/UserProfileHeader";
import ThreadDetailModal from "@/components/ThreadDetailModal";

interface UserProfile {
	id: number;
	username: string;
	full_name: string;
	photo_profile: string | null;
	header: string | null;
	bio: string | null;
}

interface UserStats {
	followers: number;
	following: number;
}

interface Thread {
	id: number;
	content: string;
	created_at: string;
	images?: string[];
	likesCount?: number;
	repliesCount?: number;
	isLiked?: boolean;
}

export default function ProfilePage() {
	const navigate = useNavigate();
	// id dari url
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useDispatch();
	// ambil data dari redux
	const currentUser = useSelector((state: any) => state.user.user);
	const token =
		useSelector((state: any) => state.user.token) ||
		localStorage.getItem("token");

	// penyimpanan data user yang sedang di lihat ke lokal state
	const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
	const [stats, setStats] = useState<UserStats>({ followers: 0, following: 0 });
	const [loading, setLoading] = useState(true);
	const [isCurrentUser, setIsCurrentUser] = useState(false);
	const [followersFollowingModal, setFollowersFollowingModal] = useState<{
		isOpen: boolean;
		type: "followers" | "following" | null;
	}>({
		isOpen: false,
		type: null,
	});
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Profile subpage state
	const [activeTab, setActiveTab] = useState<"posts" | "media">("posts");
	const [userThreads, setUserThreads] = useState<Thread[]>([]);
	const [threadsLoading, setThreadsLoading] = useState(false);
	const [showThreadModal, setShowThreadModal] = useState(false);
	const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
	const [likingThread, setLikingThread] = useState<number | null>(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);

	// route logic
	useEffect(() => {
		if (!userId && currentUser?.id) {
			// view profile sendiri dari sidebar
			setIsCurrentUser(true);
			setProfileUser(currentUser);
			fetchStats(currentUser.id.toString());
			fetchUserThreads(currentUser.id.toString()); // fetch user's posts
			setLoading(false);
		} else if (!userId && !currentUser) {
			// user membuka profile orang lain
			setLoading(true);
		} else if (userId) {
			// view other user profile
			console.log("Viewing other user profile:", userId);
			fetchUserProfile(userId);
			fetchStats(userId);
			fetchUserThreads(userId);
			checkFollowStatus(userId); // check if following this user
		}
	}, [userId, currentUser]);

	// check if current user is following the profile user
	const checkFollowStatus = async (profileUserId: string) => {
		if (!token || !currentUser?.id) return;

		try {
			const response = await fetch(
				`http://localhost:9002/api/user/${currentUser.id}/following`,
				{
					headers: { Authorization: `Bearer ${token}` },
					credentials: "include",
				},
			);

			if (response.ok) {
				const followingList = await response.json();
				const isFollowingProfile = followingList.some(
					(user: any) => user.id.toString() === profileUserId,
				);
				setIsFollowing(isFollowingProfile);
			}
		} catch (error) {
			console.error("Error checking follow status:", error);
		}
	};

	// Handle follow/unfollow
	const handleFollow = async () => {
		if (!token || !profileUser?.id || followLoading) return;

		setFollowLoading(true);

		try {
			const endpoint = isFollowing ? "unfollow" : "follow";
			const response = await fetch(
				`http://localhost:9002/api/user/${endpoint}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ targetUserId: profileUser.id }),
				},
			);

			if (response.ok) {
				setIsFollowing(!isFollowing);

				// Update the profile user's follower count
				setStats((prev) => ({
					...prev,
					followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
				}));

				// If this is the current user's profile, also update their following count
				if (isCurrentUser) {
					setStats((prev) => ({
						...prev,
						following: isFollowing ? prev.following - 1 : prev.following + 1,
					}));
				} else {
					// Notify other components about the following count change for current user
					window.dispatchEvent(
						new CustomEvent("currentUserFollowingChange", {
							detail: { action: isFollowing ? "decrement" : "increment" },
						}),
					);
				}
			} else {
				console.error("Failed to follow/unfollow user");
			}
		} catch (error) {
			console.error("Error following/unfollowing user:", error);
		} finally {
			setFollowLoading(false);
		}
	};

	// Listen for real-time following count updates
	useEffect(() => {
		const handleFollowingCountChange = (event: any) => {
			const { action } = event.detail;
			if (action === "increment") {
				setStats((prev) => ({
					...prev,
					following: prev.following + 1,
				}));
				console.log(
					"Following count incremented via real-time event (Profile page)",
				);
			} else if (action === "decrement") {
				setStats((prev) => ({
					...prev,
					following: Math.max(0, prev.following - 1),
				}));
				console.log(
					"Following count decremented via real-time event (Profile page)",
				);
			}
		};

		window.addEventListener(
			"followingCountChanged",
			handleFollowingCountChange,
		);

		return () => {
			window.removeEventListener(
				"followingCountChanged",
				handleFollowingCountChange,
			);
		};
	}, []);

	const fetchUserProfile = async (id: string) => {
		if (!token) return;

		try {
			setLoading(true);

			const response = await fetch(`http://localhost:9002/api/user/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setProfileUser(data.user);
				setIsCurrentUser(data.user.id === currentUser?.id);
			} else {
				setProfileUser(null);
				console.log(`User ${id} not found`);
			}

			setLoading(false);
		} catch (error) {
			console.error("Error fetching user profile:", error);
			setProfileUser(null);
			setLoading(false);
		}
	};

	const fetchStats = async (id: string) => {
		if (!token) return;

		try {
			const [followersRes, followingRes] = await Promise.all([
				fetch(`http://localhost:9002/api/user/${id}/followers`, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: "include",
				}),
				fetch(`http://localhost:9002/api/user/${id}/following`, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: "include",
				}),
			]);

			const [followersData, followingData] = await Promise.all([
				followersRes.ok ? followersRes.json() : [],
				followingRes.ok ? followingRes.json() : [],
			]);

			setStats({
				followers: Array.isArray(followersData) ? followersData.length : 0,
				following: Array.isArray(followingData) ? followingData.length : 0,
			});
		} catch (error) {
			console.error("Error fetching stats:", error);
			setStats({ followers: 0, following: 0 });
		}
	};

	const fetchUserThreads = async (id: string) => {
		if (!token) return;

		try {
			setThreadsLoading(true);

			// cek apakah punya api untuk fetch user threads
			const response = await fetch(`http://localhost:9002/api/v1/user/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
				credentials: "include",
			});

			console.log(
				`Fetching threads for user ${id}, response:`,
				response.status,
			);

			if (response.ok) {
				const result = await response.json();
				const threads = Array.isArray(result.data) ? result.data : [];

				console.log(
					`Loaded ${threads.length} threads for user ${id}:`,
					threads,
				);

				//selalu sinkronkan status like dengan localStorage untuk likes
				const likedThreads = JSON.parse(
					localStorage.getItem("likedThreads") || "{}",
				);

				//menghindari pemanggilan API tambahan untuk status like
				const threadsWithLikes = threads.map((thread: Thread) => {
					// gunakan data dari localStorage
					const isLikedByCurrentUser = !!likedThreads[thread.id];
					//likes count yang sudah di sediakan oleh API user threads
					return {
						...thread,
						isLiked: isLikedByCurrentUser,
						likesCount: thread.likesCount || 0,
					};
				});
				setUserThreads(threadsWithLikes);
			} else {
				// jka tidak ada api call
				setUserThreads([]);
			}
		} catch (error) {
			console.error("Error fetching user threads:", error);
			setUserThreads([]);
		} finally {
			setThreadsLoading(false);
		}
	};

	const handleFollowersClick = () => {
		setFollowersFollowingModal({
			isOpen: true,
			type: "followers",
		});
	};

	const handleFollowingClick = () => {
		setFollowersFollowingModal({
			isOpen: true,
			type: "following",
		});
	};

	const handleCloseFollowersFollowingModal = () => {
		setFollowersFollowingModal({
			isOpen: false,
			type: null,
		});
	};

	const handleEditProfile = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	// global like update callback untuk cross-page synchronization
	useEffect(() => {
		const likeUpdateCallback = (data: {
			threadId: number;
			userId: number;
			liked: boolean;
			likesCount: number;
		}) => {
			console.log("🔄 Profile page receiving like update:", data);

			// update specific thread in userThreads array
			setUserThreads((prevThreads) =>
				prevThreads.map((thread) =>
					thread.id === data.threadId
						? {
								...thread,
								likesCount: data.likesCount,
								// update isLiked only untuk user yang tertrigger
								...(data.userId === currentUser?.id
									? { isLiked: data.liked }
									: {}),
							}
						: thread,
				),
			);

			//update thread yang terpilih jika modal terbuka
			if (selectedThread && selectedThread.id === data.threadId) {
				setSelectedThread((prev) =>
					prev
						? {
								...prev,
								likesCount: data.likesCount,
								...(data.userId === currentUser?.id
									? { isLiked: data.liked }
									: {}),
							}
						: null,
				);
			}
		};

		// set the global callback (other pages will trigger this)
		(window as any).likeUpdateCallback = likeUpdateCallback;
		console.log("🔄 Profile page like callback registered");

		// Clean up on unmount
		return () => {
			(window as any).likeUpdateCallback = undefined;
			console.log("🔄 Profile page like callback unregistered");
		};
	}, [currentUser?.id]);

	// When a like is toggled locally, broadcast the update to other pages
	const broadcastLikeUpdate = (
		threadId: number,
		userId: number,
		liked: boolean,
		likesCount: number,
	) => {
		console.log("Profile page broadcasting like update:", {
			threadId,
			userId,
			liked,
			likesCount,
		});

		// panggil global callback  di halaman lain jika ada
		if ((window as any).likeUpdateCallback) {
			(window as any).likeUpdateCallback({
				threadId,
				userId,
				liked,
				likesCount,
			});
		}
	};

	const handleOpenThreadModal = (thread: Thread) => {
		setSelectedThread(thread);
		setShowThreadModal(true);
	};

	const handleToggleThreadLike = async (
		threadId: number,
		hasLiked: boolean,
	) => {
		if (likingThread) return; // Prevent double clicks

		setLikingThread(threadId);

		console.log("Toggling like for thread:", threadId, "hasLiked:", hasLiked);

		try {
			// Call Redux action to toggle like
			const result = await dispatch(
				toggleLike({ threadId, currentIsLiked: hasLiked }),
			);

			// On success, update local state with server response
			if (result.payload) {
				const {
					threadId: updatedThreadId,
					isLiked,
					likesCount,
				} = result.payload;

				// Update local userThreads
				setUserThreads((prevThreads) =>
					prevThreads.map((t) =>
						t.id === updatedThreadId ? { ...t, isLiked, likesCount } : t,
					),
				);

				// Update selectedThread if modal is open
				if (selectedThread && selectedThread.id === updatedThreadId) {
					setSelectedThread((prev) =>
						prev ? { ...prev, isLiked, likesCount } : null,
					);
				}

				// Persist liked status in localStorage
				const likedThreads = JSON.parse(
					localStorage.getItem("likedThreads") || "{}",
				);
				if (isLiked) {
					likedThreads[updatedThreadId] = true;
				} else {
					delete likedThreads[updatedThreadId];
				}
				localStorage.setItem("likedThreads", JSON.stringify(likedThreads));

				// Broadcast accurate update to other pages
				broadcastLikeUpdate(
					updatedThreadId,
					currentUser?.id || 0,
					isLiked,
					likesCount,
				);
			}
		} catch (error) {
			console.error("Error toggling thread like:", error);
			// Note: No revert needed since no optimistic update was made
		} finally {
			setLikingThread(null);
		}
	};

	const BASE_URL = "http://localhost:9002/uploads/";

	return (
        <div className="bg-zinc-900 min-h-screen text-white">
            <div className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen pb-20">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-pulse text-zinc-500">Loading profile...</div>
                    </div>
                ) : !profileUser ? (
                    <div className="p-4 text-center py-12">
                        <ArrowLeft className="cursor-pointer mx-auto mb-4" onClick={() => navigate("/")} />
                        <h3 className="text-xl font-bold">This account doesn't exist</h3>
                        <p className="text-zinc-500">Try searching for another.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Sticky Header */}
                        <div className="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-md py-2 px-4 flex items-center gap-6 border-b border-zinc-800">
                            <button onClick={() => navigate("/")} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{profileUser.full_name}</h3>
                                <p className="text-xs text-zinc-500">{userThreads.length} Posts</p>
                            </div>
                        </div>

                        {/* 2. Visuals Section */}
                        <div className="relative">
                            <div className="h-48 bg-zinc-800 overflow-hidden">
                                <UserProfileHeader user={profileUser} clickable={false} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-16 left-4">
                                <img
                                    src={profileUser.photo_profile ? `${BASE_URL}${profileUser.photo_profile}` : "/default-avatar.png"}
                                    className="w-32 h-32 rounded-full border-4 border-zinc-900 object-cover bg-zinc-800"
                                    alt="profile"
                                />
                            </div>
                        </div>

                        {/* 3. Action Buttons */}
                        <div className="flex justify-end p-4 h-16">
                            {isCurrentUser ? (
                                <button onClick={handleEditProfile} className="px-5 py-2 border border-zinc-700 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors">
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                        isFollowing 
                                        ? "bg-transparent border border-zinc-700 hover:border-red-500 hover:text-red-500" 
                                        : "bg-white text-black hover:bg-zinc-200"
                                    }`}
                                >
                                    {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>

                        {/* 4. Bio & Stats */}
                        <div className="px-4 mt-4 space-y-3">
                            <div>
                                <h3 className="text-xl font-extrabold">{profileUser.full_name}</h3>
                                <p className="text-zinc-500">@{profileUser.username}</p>
                            </div>
                            {profileUser.bio && <p className="text-[15px] whitespace-pre-wrap">{profileUser.bio}</p>}
                            <div className="flex items-center gap-5 text-sm pt-1">
                                <button onClick={handleFollowingClick} className="hover:underline flex gap-1">
                                    <span className="font-bold">{stats.following}</span> <span className="text-zinc-500">Following</span>
                                </button>
                                <button onClick={handleFollowersClick} className="hover:underline flex gap-1">
                                    <span className="font-bold">{stats.followers}</span> <span className="text-zinc-500">Followers</span>
                                </button>
                            </div>
                        </div>

                        {/* 5. Tabs & Content */}
                        <div className="mt-4 border-b border-zinc-800 flex">
                            {["posts", "media"].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className="flex-1 py-4 text-center relative hover:bg-zinc-800/50 transition-colors uppercase text-sm font-bold tracking-wider">
                                    <span className={activeTab === tab ? "text-white" : "text-zinc-500"}>{tab}</span>
                                    {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[400px]">
                            {activeTab === "posts" ? (
                                <ProfilePosts userThreads={userThreads} threadsLoading={threadsLoading} isCurrentUser={isCurrentUser} profileUser={profileUser} onToggleLike={handleToggleThreadLike} />
                            ) : (
                                <ProfileMedia userThreads={userThreads} threadsLoading={threadsLoading} isCurrentUser={isCurrentUser} currentUser={currentUser} token={token} onOpenThreadModal={handleOpenThreadModal} BASE_URL={BASE_URL} />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modals outside the main scroll container */}
            <FollowersFollowingModal isOpen={followersFollowingModal.isOpen} onClose={handleCloseFollowersFollowingModal} type={followersFollowingModal.type!} userId={profileUser?.id?.toString() || ""} />
            <ProfileModal open={isModalOpen} onClose={handleCloseModal}><EditProfile onClose={handleCloseModal} /></ProfileModal>
            <ThreadDetailModal isOpen={showThreadModal} onClose={() => setShowThreadModal(false)} thread={selectedThread} profileUser={profileUser} token={token} currentUser={currentUser} onToggleLike={handleToggleThreadLike} />
        </div>
    );
}
