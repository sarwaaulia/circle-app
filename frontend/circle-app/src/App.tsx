import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

// pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Status from "../src/pages/threadDetail";

// main layout
import LeftSidebar from "./components/layout/LeftSideBar";
import RightSidebar from "./components/layout/RightSideBar";

import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "./stores/userSlice";
import { useEffect } from "react";
import axios from "axios";

function AppWrapper() {
  const dispatch = useDispatch();
  const location = useLocation();

  const token =
    useSelector((state: any) => state.user.token) ||
    localStorage.getItem("token");

	// fetch user profile otomatis jika ada token
  useEffect(() => {
    const fetchMe = async () => {
      if (!token || token === "undefined") return;

      try {
        const res = await axios.get("http://localhost:9000/api/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
		  withCredentials: true,
        });

        dispatch(setAuth({ user: res.data.data, token }));

		localStorage.setItem("currentUser", JSON.stringify(res.data.data));
      } catch (err) {
        console.error("Auto login failed:", err);
      }
    };

    fetchMe();
  }, [token]);

  const authPages = ["/login", "/register"];
  const isInAuthPage = authPages.includes(location.pathname);

	return (
		<div className="bg-black min-h-screen flex justify-center">
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
							<Route path="/threads/:threadId" element={<Status />} />
							{/* <Route path="/profile/:id" element={<Status />} /> */}
							{/* <Route path="/profile" element={<ProfilePage />} />
							<Route path="/profile/:userId" element={<ProfilePage />} /> */}
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
