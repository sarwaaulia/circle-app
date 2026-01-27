import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../profile/ProfileModal";
import EditProfile from "../profile/EditProfile";
import FollowersFollowingModal from "../profile/FollFollModal";

export function ProfileCard() {
	const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
	const [followersFollowingModalOpen, setFollowersFollowingModalOpen] =
		useState<{
			isOpen: boolean;
			type: "followers" | "following" | null;
		}>({
			isOpen: false,
			type: null,
		});
	const [status, setStatus] = useState({ followers: 0, following: 0 });
	const [loading, setLoading] = useState(true);
	const [refreshStatus, setRefreshStatus] = useState(false);

	const user = useSelector((state: any) => state.user.user);
	const token = useSelector((state: any) => state.user.token) || localStorage.getItem("token");

	const navigate = useNavigate();

	const handleEditProfile = () => setIsOpenModalOpen(true);
	const handleCloseModal = () => setIsOpenModalOpen(false);

	useEffect(() => {
    // Jangan lakukan apa-apa jika token belum ada (masih loading auth)
    if (!token || !user.id) return; 

    const fetchStatus = async () => {
		setLoading(true);

        try {

            const [resFollowers, resFollowing] = await Promise.all([
                fetch(`http://localhost:9000/api/user/${user.id}/followers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:9000/api/user/${user.id}/following`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const followersData = resFollowers.ok ? await resFollowers.json() : [];
            const followingData = resFollowing.ok ? await resFollowing.json() : [];

            setStatus({
                followers: Array.isArray(followersData) ? followersData.length : 0,
                following: Array.isArray(followingData) ? followingData.length : 0,
            });
        } catch (error) {
            console.error("Error fetching status:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchStatus();
}, [token, user?.id]);

	// Listen for real-time following count updates
	useEffect(() => {
		const handleFollowingCountChange = (event: any) => {
			const { action } = event.detail;
			if (action === "increment") {
				setStatus((prev) => ({
					...prev,
					following: prev.following + 1,
				}));
				console.log("Following count incremented via real-time event");
			} else if (action === "decrement") {
				setStatus((prev) => ({
					...prev,
					following: Math.max(0, prev.following - 1),
				}));
				console.log("Following count decremented via real-time event");
			}
		};

		window.addEventListener(
			"currentUserFollowingChange",
			handleFollowingCountChange,
		);

		return () => {
			window.removeEventListener(
				"currentUserFollowingChange",
				handleFollowingCountChange,
			);
		};
	}, []);

	// Refresh stats when following changes
	useEffect(() => {
		if (refreshStatus) {
			setStatus((prev) => ({
				...prev,
				following: Math.max(0, prev.following - 1), // jumlah following dikurangi 1
			}));
			setRefreshStatus(false);
		}
	}, [refreshStatus]);

	const handleFollowersClick = () => {
		setFollowersFollowingModalOpen({
			isOpen: true,
			type: "followers",
		});
	};

	const handleFollowingClick = () => {
		setFollowersFollowingModalOpen({
			isOpen: true,
			type: "following",
		});
	};

	const handleCloseFollowersFollowingModal = () => {
		setFollowersFollowingModalOpen({
			isOpen: false,
			type: null,
		});
	};

	const headerSrc = user?.header
		? `http://localhost:9000/uploads/${user.header}`
		: "https://cdn.pixabay.com/photo/2025/08/29/11/16/norway-9803687__480.jpg";

	const profileSrc = user?.photo_profile
		? `http://localhost:9000/uploads/${user.photo_profile}`
		: "https://pixabay.com/vectors/flower-ornament-frame-border-4634053/";

	const debug = useSelector((state: any) => state.user);
	console.log("DEBUG USER:", debug);

	return (
		<>
			<div className="bg-blue-800 rounded-lg overflow-hidden shadow-lg w-full">
				<div className="px-2 pt-2 pb-1 sm:px-3 sm:pt-1 sm:pb-2">
					<h2 className="text-zinc-300 font-semibold text-xs sm:text-sm">
						My Profile
					</h2>
				</div>

				{/* Header */}
				<div className="relative sm:mx-3 h-16 sm:h-20 rounded-lg">
					<img
						src={headerSrc}
						className="w-full h-full object-cover rounded-lg"
						alt="Header"
					/>

					{/* Profile photo */}
					<div className="absolute -bottom-6 sm:-bottom-8 left-2 sm:left-3">
						<img
							src={profileSrc}
							className="w-12 h-12 sm:w-17 sm:h-17 rounded-full object-cover border-2 sm:border-3 border-blue-500"
							alt="Profile"
						/>
					</div>
				</div>

				{/* Edit Button */}
				<div className="mx-2 sm:mx-3 flex justify-end">
					<button
						className="px-2 sm:px-3 mt-1 sm:mt-2 py-1 bg-blue-800 text-white cursor-pointer text-xs rounded-lg hover:bg-blue-700 transition"
						onClick={handleEditProfile}
					>
						Edit Profile
					</button>
				</div>

				{/* User Info */}
				<div className="px-2 sm:px-3 pb-2 sm:pb-3">
					<h3 className="font-semibold text-zinc-300 text-xs sm:text-sm mt-1">
						{user?.full_name || "Name"}
					</h3>

					<p className="text-white text-xs mb-1 sm:mb-2">
						@{user?.username || "username"}
					</p>

					<p className="text-blue-950 text-xs mb-1 sm:mb-2">
						{user?.bio || "Bio goes here"}
					</p>

					<div className="flex items-center gap-2 sm:gap-3 text-xs">
						<div
							onClick={handleFollowersClick}
							className="cursor-pointer hover:opacity-75"
						>
							<span className="text-blue-950 font-bold">
								{loading ? "..." : status.followers}
							</span>
							<span className="text-white ml-1">Followers</span>
						</div>
						<div
							onClick={handleFollowingClick}
							className="cursor-pointer hover:opacity-75"
						>
							<span className="text-blue-950 font-bold">
								{loading ? "..." : status.following}
							</span>
							<span className="text-white ml-1">Following</span>
						</div>
					</div>
				</div>
			</div>

			{/* Edit Profile Modal */}
			<ProfileModal open={isOpenModalOpen} onClose={handleCloseModal}>
				<EditProfile onClose={handleCloseModal} />
			</ProfileModal>

			{/* Followers/Following Modal */}
			{followersFollowingModalOpen.type && (
				<FollowersFollowingModal
					isOpen={followersFollowingModalOpen.isOpen}
					onClose={handleCloseFollowersFollowingModal}
					type={followersFollowingModalOpen.type}
					userId={user?.id?.toString() || ""}
				/>
			)}
		</>
	);
}
