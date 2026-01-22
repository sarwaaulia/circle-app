import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Register() {
	const [username, setUsername] = useState("");
	const [fullname, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");

	const handleRegist = async (
		e: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault();
		setMsg("");

		try {
			const response = await fetch(
				"http://localhost:9000/api/v1/register",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username,
						full_name: fullname,
						email,
						password,
					}),
				},
			);

			const data = await response.json();
			if (response.ok) {
				setMsg("Registrasi successful!");
				setUsername("");
				setFullName("");
				setEmail("");
				setPassword("");
			} else {
				setMsg(data.message || "Registration failed");
			}
		} catch (err) {
			setMsg("somthing went wrong while registration, please try again later");
		}
	};

	return (
		<div className="">
			<Card className="w-full w-200 max-w-md bg-zinc-900 border-zinc-800 shadow-2xl p-7">
				<CardHeader className="space-y-1">
					<CardTitle className="text-3xl text-start font-bold text-blue-500 capitalize">
						circle app
					</CardTitle>
					<p className="text-white text-start text-2xl capitalize">Create account circle</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleRegist} className="space-y-3">
						<div className="space-y-2">
							<Label htmlFor="username" className="text-zinc-200">
								username
							</Label>
							<Input
								type="text"
								placeholder="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="bg-zinc-800 border-zinc-700 text-white focus:ring-green-500"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fullname" className="text-zinc-200">
								fullname
							</Label>
							<Input
								type="text"
								placeholder="fullname"
								value={fullname}
								onChange={(e) => setFullName(e.target.value)}
								className="bg-zinc-800 border-zinc-700 text-white focus:ring-green-500"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email" className="text-zinc-200">
								Email
							</Label>
							<Input
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
							className="w-full font-bold py-6 rounded-full text-lg transition-all"
						>
							Create
						</Button>

						{msg && (
							<p className="text-center text-red-400 text-sm mt-1">{msg}</p>
						)}

						<p className="text-center text-zinc-400 text-sm mt-4 capitalize">
							already have an accoount?{" "}
							<Link
								to="/login"
								className="text-green-500"
							>
								Login
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
