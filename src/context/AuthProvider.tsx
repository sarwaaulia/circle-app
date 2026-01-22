import { useDispatch } from "react-redux";
import { AuthContext } from "./AuthContext";
import { useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(() =>
		localStorage.getItem("token"),
	);

	const login = (token: string) => {
		console.log("AuthProvider login called with token:", token);
		localStorage.setItem("token", token);
		setToken(token);
		console.log("Token saved to localStorage:", localStorage.getItem("token"));
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
	};

	return (
		<AuthContext.Provider value={{ token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
