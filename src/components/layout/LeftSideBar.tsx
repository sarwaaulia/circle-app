import { Home, Search, User, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "../../context/AuthContext";
import { useSelector } from "react-redux";

export default function LeftSidebar() {
	const { pathname } = useLocation();

	const navItems = [
		{ label: "Home", icon: Home, href: "/" },
		{ label: "Search", icon: Search, href: "/search" },
		{ label: "Follows", icon: Users, href: "/follows" },
		{ label: "Profile", icon: User, href: "/profile" },
	];

	function handleLogout() {
		localStorage.removeItem("token");
		window.location.href = "/login";
	}

	const handleThreadCreated = (_newThread: any) => {
		window.location.reload();
	};

	return (
		<aside
			className="h-screen w-60 p-4 flex flex-col bg-zinc-900
  fixed left-0 top-0 overflow-y-auto"
		>
			<h2 className="left-0 top-0 flex justify-start text-3xl font-bold mb-3 text-white capitalize">circle <span className="capitalize text-blue-700"> app</span> </h2>
			<nav className="flex flex-col gap-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = pathname === item.href;

					return (
						<Link
							key={item.href}
							to={item.href}
							className={`flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-blue-900 ${
								active ? "bg-blue-700" : ""
							}`}
						>
							<Icon size={20} />
							<span className="text-lg">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<label
				className="mt-4 cursor-pointer bg-white text-blue-950 hover:bg-blue-800 font-semibold text-lg py-1 rounded-2xl text-center "
				onClick={handleThreadCreated}
			>
				Create Post
			</label>

			<div className="mt-auto">
				<Button
					variant="destructive"
					className="w-full flex items-center gap-2"
					onClick={handleLogout}
				>
					<LogOut size={18} /> Logout
				</Button>
			</div>

			{/* Create Thread Modal */}
			{/* {token && (
				<CreateThread
					ref={createThreadRef}
					token={token}
					userAvatar={
						currentUser?.photo_profile
							? `http://localhost:9000/uploads/${currentUser.photo_profile}`
							: undefined
					}
					onThreadCreated={handleThreadCreated}
					showBottomDisplay={false}
				/>
			)} */}
		</aside>
	);
}
