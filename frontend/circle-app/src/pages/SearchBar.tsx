import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

interface SearchUser {
	id: number;
	username: string;
	full_name: string;
	photo_profile: string | null;
	bio: string | null;
	isFollowing?: boolean;
}

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const [users, setUsers] = useState<SearchUser[]>([]);
	const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
	const [followedSuggestionUsers, setFollowedSuggestionUsers] = useState<
		Set<number>
	>(new Set());
	const [loading, setLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const navigate = useNavigate();
	const debounceTimeout = useRef<number | null>(null);

	const token = localStorage.getItem("token");
	const currentUser = useSelector((state: any) => state.user.user);

	// Debounced search for suggestions
	const searchSuggestions = useCallback(
		async (searchQuery: string) => {
			if (!searchQuery.trim()) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			try {
				setSearchLoading(true);
				const response = await fetch(
					`http://localhost:9002/api/user/search?q=${encodeURIComponent(searchQuery)}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const result = await response.json();

				if (response.ok) {
					setUsers(result.data || []);
					setSuggestions(result.data.slice(0, 3)); // Limit to 3 suggestions
					setShowSuggestions(result.data.length > 0);
				} else {
					setSuggestions([]);
					setShowSuggestions(false);
				}
			} catch (error) {
				console.error("Suggestion error:", error);
				setSuggestions([]);
				setShowSuggestions(false);
			} finally {
				setSearchLoading(false);
			}
		},
		[token],
	);

	// handle input change mneggunakan debounce
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);

		// clear debounce
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		// waktu untuk suggest user ditampilkan
		debounceTimeout.current = window.setTimeout(() => {
			searchSuggestions(value);
		}, 300);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, []);

	// main logic
	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!query.trim()) return;

		// hide suggestions
		setShowSuggestions(false);

		setLoading(true);
		setSearched(true);

		try {
			console.log("Current user:", currentUser);
			// fetch search results and current user's following list
			const [searchResponse, followingResponse] = await Promise.all([
				fetch(
					`http://localhost:9002/api/user/search?q=${encodeURIComponent(query)}`,
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
						credentials: "include",
					},
				),
				currentUser?.id
					? fetch(
							`http://localhost:9002/api/user/${currentUser.id}/following`,
							{
								headers: token ? { Authorization: `Bearer ${token}` } : {},
								credentials: "include",
							},
						)
					: Promise.resolve(null),
			]);

			let searchResultsArr: SearchUser[] = [];
			let followingList: SearchUser[] = [];

			if (searchResponse.ok) {
				const result = await searchResponse.json();
				// AMBIL .data KARENA BACKEND MENGIRIM { status: "success", data: [...] }
				searchResultsArr = result.data || [];
				console.log("Search results array:", searchResultsArr);
			}

			if (followingResponse && followingResponse.ok) {
				const followResult = await followingResponse.json();
				// Sesuaikan juga jika endpoint following mengembalikan { data: [...] }
				followingList = followResult.data || followResult;
			} else if (followingResponse) {
				console.log("Following fetch failed:", followingResponse.status);
			} else {
				console.log("No following response (no current user)");
			}

			// Mark search results with following status
			const followingIds = new Set(followingList.map((u) => u.id));
			const usersWithFollowingStatus = searchResultsArr.map((user) => ({
				...user,
				isFollowing: followingIds.has(user.id),
			}));
			console.log("Users with following status:", usersWithFollowingStatus);

			setUsers(usersWithFollowingStatus);
		} catch (error) {
			console.error("Search error:", error);
			setUsers([]);
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
				// update user result
				setUsers((prev) =>
					prev.map((u) =>
						u.id === targetUserId ? { ...u, isFollowing: true } : u,
					),
				);

				// menambahkan suggsetion user ke followed
				setFollowedSuggestionUsers((prev) => new Set([...prev, targetUserId]));

				// dispatch real-time event for following count update
				window.dispatchEvent(
					new CustomEvent("currentUserFollowingChange", {
						detail: { action: "increment" },
					}),
				);
			} else {
				console.error("Failed to follow user");
			}
			if (response.ok) {
				// Update status di list utama DAN suggestions agar sinkron
				const updateList = (list: SearchUser[]) =>
					list.map((u) =>
						u.id === targetUserId ? { ...u, isFollowing: true } : u,
					);

				setUsers((prev) => updateList(prev));
				setSuggestions((prev) => updateList(prev));

				window.dispatchEvent(
					new CustomEvent("currentUserFollowingChange", {
						detail: { action: "increment" },
					}),
				);
			}
		} catch (error) {
			console.error("Error following user:", error);
		}
	};

	const handleSuggestionClick = (user: SearchUser) => {
		setQuery(user.username); // Set the username in the input
		setShowSuggestions(false);
	};

	const BASE_URL = "http://localhost:9002/uploads/";

	return (
		<div className="flex-1 ml-64 mr-80 border-l border-r border-neutral-800 p-6 relative">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<ArrowLeft
					size={24}
					className="cursor-pointer hover:text-blue-700 transition-colors"
					onClick={() => navigate("/")}
				/>
				<h1 className="text-2xl font-bold text-blue-700">Search Users</h1>
			</div>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="mb-8 relative">
				<div className="relative">
					<input
						type="text"
						value={query}
						onChange={handleInputChange}
						placeholder="Find your friend by username or fullname"
						className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
					/>
					<button
						type="submit"
						className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
						disabled={loading || !query.trim()}
					>
						<SearchIcon size={24} />
					</button>
				</div>

				{/* Suggestions Dropdown */}
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
						{searchLoading ? (
							<div className="px-4 py-3 text-gray-600">Searching...</div>
						) : (
							suggestions.map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
								>
									<div
										className="flex items-center space-x-3 flex-1 cursor-pointer"
										onClick={() => handleSuggestionClick(user)}
									>
										<img
											src={
												user.photo_profile
													? `${BASE_URL}${user.photo_profile}`
													: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
											}
											alt={user.username}
											className="w-8 h-8 rounded-full object-cover"
										/>
										<div>
											<div className="font-semibold text-blue-950 text-sm">
												{user.full_name}
											</div>
											<div className="text-xs text-gray-600">
												@{user.username}
											</div>
										</div>
									</div>
									{followedSuggestionUsers.has(user.id) ? (
										<button
											className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors text-xs ml-2"
											onClick={(e) => e.stopPropagation()}
										>
											Following
										</button>
									) : (
										<button
											className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors text-xs ml-2"
											onClick={(e) => {
												e.stopPropagation(); //prevent trigger suggestion to click
												handleFollow(user.id);
											}}
										>
											Follow
										</button>
									)}
								</div>
							))
						)}
					</div>
				)}

				<button
					type="submit"
					disabled={loading || !query.trim()}
					className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? "Searching..." : "Search"}
				</button>
			</form>

			{/* Results */}
			{searched && (
				<div>
					{loading ? (
						<div className="text-center py-8">
							<div className="text-blue-950">Searching...</div>
						</div>
					) : users.length > 0 ? (
						<div>
							<h2 className="text-lg font-semibold mb-4 text-blue-950">
								Found {users.length} user{users.length !== 1 ? "s" : ""}
							</h2>
							<div className="space-y-4">
								{users.map((user) => (
									<div
										key={user.id}
										className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
									>
										<div
											className="flex items-center space-x-3 cursor-pointer"
											onClick={() => navigate(`/profile/${user.id}`)}
										>
											<img
												src={
													user.photo_profile
														? `${BASE_URL}${user.photo_profile}`
														: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
												}
												alt={user.username}
												className="w-12 h-12 rounded-full object-cover hover:border-blue-300 transition-colors"
											/>
											<div>
												<div className="font-semibold text-blue-950 hover:text-blue-600 transition-colors">
													{user.full_name}
												</div>
												<div className="text-sm text-gray-600">
													@{user.username}
												</div>
												{user.bio && (
													<div className="text-sm text-gray-500 mt-1">
														{user.bio}
													</div>
												)}
											</div>
										</div>
										<div className="flex gap-2">
											{user.isFollowing ? (
												<button
													className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
													onClick={() => navigate(`/profile/${user.id}`)}
												>
													Following ✓
												</button>
											) : (
												<button
													className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
													onClick={() => handleFollow(user.id)}
												>
													Follow
												</button>
											)}
											<button
												className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
												onClick={() => navigate(`/profile/${user.id}`)}
											>
												View Profile
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="text-center py-8">
							<div className="text-gray-500">No users found "{query}"</div>
						</div>
					)}
				</div>
			)}

			{/* Instructions */}
			{!searched && (
				<div className="text-center py-12">
					<SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-600 mb-2">
						Search for Users
					</h3>
					<p className="text-gray-500">
						Enter a username or full name to find other users.
					</p>
				</div>
			)}
		</div>
	);
}
