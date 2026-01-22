import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
// main layout
import LeftSidebar from "./components/layout/LeftSideBar";
import RightSidebar from "./components/layout/RightSideBar";

// import redux
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./stores/userSlice";
import { useEffect } from "react";
import axios from "axios";

function AppWrapper() {
	const dispatch = useDispatch();
	const location = useLocation();

	const token =
		useSelector((state: any) => state.user.token) ||
		localStorage.getItem("token");

	useEffect(() => {
		const fetchUser = async () => {
			if (!token || token === "undefined") {
				console.warn("Token not found or invalid");
				return;
			}
			try {
				console.log("Token yang akan dikirim:", token);
				console.log("Tipe data token:", typeof token);
				const res = await axios.get("http://localhost:9000/api/v1/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: true,
				});

				dispatch(setUser({ user: res.data.user, token }));

				localStorage.setItem("currentUser", JSON.stringify(res.data.user));
			} catch (err) {
				console.error("Failed to auto fetch user:", err);
			}
		};

		fetchUser();
	}, [token]);

	const authPages = ["/login", "/register"];
	const isInAuthPage = authPages.includes(location.pathname);

	return (
		<div className="bg-black min-h-screen flex justify-center">
			{isInAuthPage ? (
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					{/* Tambahkan fallback jika user mengetik asal di path auth */}
					<Route path="*" element={<Login />} />
				</Routes>
			) : (
				<div className="flex min-h-screen text-blue-950">
					<LeftSidebar />
					
					<main className="">
						<Routes>
							<Route path="/" element={<Home />} />
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
