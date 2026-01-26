import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/stores/userSlice";

export default function Login() {
	// untuk akses status login
	const context = useContext(AuthContext);
	if (!context) return null;

	const { login } = context;
	// pindah halaman setelah login berhasil
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");
	const dispatch = useDispatch();

	const handleLogin = async (
		e: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault();
		setMsg("");

		try {
			const response = await fetch("http://localhost:9000/api/v1/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();
			console.log("Response data:", data); // Tambahkan ini untuk debug

			if (!response.ok) {
				setMsg(data.message || "Login failed");
				return;
			}
			login(data.data.token);
			// mengirim data ke redux
			dispatch(
				setAuth({
					user: {
						id: data.data.user_id,
						username: data.data.username,
						full_name: data.data.full_name,
						email: data.data.email,
						photo_profile: data.data.photo_profile,
						header: data.data.header,
						bio: data.data.bio,
					},
					token: data.data.token,
				}),
			);

			// penyimpanan ke local storage
			localStorage.setItem("currentUser", JSON.stringify({
				id: data.data.user_id,
				username: data.data.username,
				full_name: data.data.full_name,
				email: data.data.email,
				photo_profile: data.data.photo_profile,
				header: data.data.header,
				bio: data.data.bio,
			}));
			localStorage.setItem("token", data.data.token);

			navigate("/");
		} catch (err) {
			setMsg("somthing went wrong while login");
		}
	};

	return (
		<div className="w-full w-screen flex items-center justify-center bg-zinc-900">
			<div className="w-full max-w-md text-center">
				<Card className="bg-zinc-850 border border-zinc-700 shadow-lg">
					<CardHeader className="space-y-1">
						<CardTitle className="text-3xl font-bold text-white text-start capitalize mb-2">
							circle<span className="text-blue-800">App</span>
						</CardTitle>
						<p className="text-white text-start text-xl">Login to Circle</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-zinc-200">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="bg-zinc-800 border-zinc-700 text-white focus:ring-green-500"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-zinc-200">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="bg-zinc-800 border-zinc-700 text-white focus:ring-green-500"
									required
								/>
							</div>

							{msg && (
								<div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded-md text-center">
									{msg}
								</div>
							)}

							<div className="text-right text-white">
								<a
									href="#"
									className="text-sm text-white hover:underline hover:underline-offset-4"
								>
									Forgot password?
								</a>
							</div>

							<Button
								type="submit"
								className="w-full py-5 rounded-full text-lg font-medium bg-blue-950 hover:bg-blue-700 text-white"
							>
								Login
							</Button>

							{msg && (
								<p className="text-center text-red-400 text-sm mt-1">{msg}</p>
							)}

							<p className="text-center text-zinc-400 text-sm mt-4">
								Don't have an account yet?{" "}
								<Link
									to="/register"
									className="text-green-500 font-semibold hover:underline"
								>
									Create Account
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
