import { Home, Search, User, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { CreateThreadRef } from "../thread/PostThread";
import { useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useSelector } from "react-redux";
import CreateThread from "../thread/PostThread";

export default function LeftSidebar() {
	const { pathname } = useLocation();
	const createThreadRef = useRef<CreateThreadRef>(null);

	const authContext = useContext(AuthContext);
	const currentUser = useSelector((state: any) => state.user.currentUser);

	const token = authContext?.token;

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

	const handleCreateThread = () => {
		if (createThreadRef.current) {
			createThreadRef.current.openModal();
		}
	};

	return (
		<aside className="h-screen w-60 p-4 flex flex-col bg-zinc-900 fixed left-0 top-0 overflow-y-auto">
			<h2 className="left-0 top-0 flex justify-start text-3xl font-bold mb-3 text-white capitalize">
				circle <span className="capitalize text-blue-700"> app</span>{" "}
			</h2>
			<nav className="flex flex-col gap-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = pathname === item.href;

					return (
						<Link
							key={item.href}
							to={item.href}
							className={`flex items-center gap-3 px-4 py-2 rounded-xl transition text-zinc-300 hover:bg-blue-900 ${
								active ? "bg-blue-700" : ""
							}`}
						>
							<Icon size={19} />
							<span className="text-lg">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<label
				className="mt-4 cursor-pointer bg-blue-700 text-zinc-300 hover:bg-blue-900 font-semibold text-lg py-1 rounded-3xl text-center"
				onClick={handleCreateThread}
			>
				Create Post
			</label>

			<div className="mt-auto">
				<Button
					variant="destructive"
					className="w-full flex items-center font-semibold text-zinc-500 gap-2 bg-white hover:bg-blue-900 rounded-3xl cursor-pointer"
					onClick={handleLogout}
				>
					<LogOut size={19} /> Logout
				</Button>
			</div>

			{/* Create Thread Modal */}
			{token && (
				<CreateThread
					ref={createThreadRef}
					token={token}
					photo_profile={
						currentUser?.photo_profile
							? `http://localhost:9002/uploads/${currentUser.photo_profile}`
							: undefined
					}
					isOnThreadCreate={handleThreadCreated}
					showBottom={false}
				/>
			)}
		</aside>
	);
}
