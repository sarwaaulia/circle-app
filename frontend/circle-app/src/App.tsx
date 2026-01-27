import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

// pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import FollowPage from "./pages/FollowPage";

// main layout
import LeftSidebar from "./components/layout/LeftSideBar";
import RightSidebar from "./components/layout/RightSideBar";

import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "./stores/userSlice";
import { useEffect } from "react";
import axios from "axios";
import ThreadDetailPage from "./pages/ThreadDetail";
import ProfilePage from "./pages/ProfilePage";
import { useNavigate } from "react-router-dom";
import SearchBar from "./pages/SearchBar";

function AppWrapper() {
	const [authCheck, setAuthCheck] = useState(true);
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	const authPages = ["/login", "/register"];
	const isInAuthPage = authPages.includes(location.pathname);

	const token =
		useSelector((state: any) => state.user.token) ||
		localStorage.getItem("token");

	// fetch user profile otomatis jika ada token
	useEffect(() => {
		const fetchMe = async () => {
			if (!token) {
				setAuthCheck(false);
				// jika bukan di halaman login/register maka redirect ke login
				if (!isInAuthPage) navigate("/login");
				return;
			}

			try {
				const res = await axios.get("http://localhost:9000/api/v1/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: true,
				});

				dispatch(setAuth({ user: res.data.data, token }));

				localStorage.setItem("currentUser", JSON.stringify(res.data.data));
			} catch (error: any) {
				console.error("auth eror");

				if (error.response?.status === 401) {
					localStorage.removeItem("currentUser");
					localStorage.removeItem("token");

					// re direct ke login jika user tidak di halaman login
					if (!isInAuthPage) {
						navigate("/login");
					}
				}
			} finally {
				setAuthCheck(false);
			}
		};

		fetchMe();
	}, [token, location.pathname, navigate, isInAuthPage]);
	if (authCheck) {
		return <p>loading...</p>;
	}

	return (
		<div className="bg-zinc-900 min-h-screen flex justify-center">
			{/* notif */}
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: "#0f172a",
						color: "#fff",
					},
				}}
			/>
			{isInAuthPage ? (
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			) : (
				<div className="flex min-h-screen text-blue-950">
					<LeftSidebar />

					<main className="">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/profile" element={<ProfilePage />} />
							<Route path="/follows" element={<FollowPage />} />
							<Route path="/threads/:threadId" element={<ThreadDetailPage />} />
							<Route path="/search" element={<SearchBar/>}/>
							<Route path="/profile/:userId" element={<ProfilePage />} />
						</Routes>
					</main>

					<RightSidebar />
				</div>
			)}
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<AppWrapper />
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
