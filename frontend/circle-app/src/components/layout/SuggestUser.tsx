import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface SuggestedUser {
	id: number;
	username: string;
	full_name: string;
	photo_profile: string | null;
	bio: string | null;
}

export function SuggestUsers() {
	const [users, setUsers] = useState<SuggestedUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [followingStates, setFollowingStates] = useState<{
		[key: number]: boolean;
	}>({});
	const user = useSelector((state: any) => state.user.user);
	const token =
		useSelector((state: any) => state.user.token) ||
		localStorage.getItem("token");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchSuggestedUsers = async () => {
			if (!token || !user?.id) return;

			try {
				setLoading(true);
				const response = await fetch(
					`http://localhost:9002/api/user/suggest/${user.id}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);

				if (response.ok) {
					const data = await response.json();
					setUsers(data);
				} else {
					setUsers([]);
				}
			} catch (error) {
				console.error("Error fetching suggested users:", error);
				setUsers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchSuggestedUsers();
	}, [token, user?.id]);

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
				setFollowingStates((prev) => ({ ...prev, [targetUserId]: true }));
				// Remove the user from suggestions immediately for better UX
				setUsers((prev) => prev.filter((u) => u.id !== targetUserId));

				// Trigger real-time following count update
				window.dispatchEvent(
					new CustomEvent("currentUserFollowingChange", {
						detail: { action: "increment" },
					}),
				);
			} else {
				console.error("Error following user");
			}
		} catch (error) {
			console.error("Error following user:", error);
		}
	};

	const BASE_URL = "http://localhost:9002/uploads/";

	if (loading) {
		return (
			<div className="bg-blue-500 rounded-lg p-2 shadow">
				<h3 className="font-bold text-blue-950 text-sm mb-2">
					Suggested for you
				</h3>
				<div className="text-center py-4 text-blue-950">Loading...</div>
			</div>
		);
	}

	return (
		<div className="bg-zinc-800 rounded-lg p-4 shadow-lg max-h-80 overflow-y-auto">
			<h3 className="text-zinc-300 font-semibold mb-3">Suggested for you</h3>
			<div className="flex flex-col gap-2">
				{users.length > 0 ? (
					users.map((suggestedUser) => (
						<div
							key={suggestedUser.id}
							className="flex justify-between items-center hover:bg-zinc-700 p-2 rounded-lg transition-colors"
						>
							<div
								className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
								onClick={() => navigate(`/profile/${suggestedUser.id}`)}
							>
								<img
									src={
										suggestedUser.photo_profile
											? `${BASE_URL}${suggestedUser.photo_profile}`
											: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
									}
									alt={suggestedUser.full_name}
									className="w-8 h-8 rounded-full object-cover flex-shrink-0"
								/>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm text-white truncate">
										{suggestedUser.full_name}
									</p>
									<p className="text-xs text-zinc-400 truncate">
										@{suggestedUser.username}
									</p>
								</div>
							</div>
							<button
								onClick={() => handleFollow(suggestedUser.id)}
								className="bg-blue-600 text-white px-3 py-1 cursor-pointer rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
							>
								Follow
							</button>
						</div>
					))
				) : (
					<div className="text-center py-4 text-zinc-400 text-sm">
						No suggestions available
					</div>
				)}
			</div>
		</div>
	);
}
