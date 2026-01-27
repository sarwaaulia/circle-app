import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import authRoute from "./routes/auth";
import userRouteAuth from "./routes/auth";

import threadRoute from "./routes/thread";
import likesRoute from "./routes/likes";
import userRoute from "./routes/user";
import repliesRoute from "./routes/replies";
import followRoute from "./routes/follows"

import corsMiddleware from "./middlewares/cors";
import path from "path";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("SERVING UPLOADS FROM:", uploadsPath);

// Routes
app.use("/api/v1", authRoute, userRouteAuth);
app.use("/api/v1", threadRoute, likesRoute, userRoute);
app.use("/api/v1/replies", repliesRoute);
app.use("/api/user", followRoute)

// Error handling middleware
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		res.status(500).json({ message: err.message });
	},
);

// buat HTTP server dari Express
const server = http.createServer(app);

// create socket server
const wss = new WebSocketServer({ server });

import { setWss, broadcast } from "./services/socket";
setWss(wss);

// menghubungkan socket dengan client
wss.on("connection", (ws) => {
	console.log("New WebSocket client connected");

	ws.on("message", (message) => {
		try {
			const payload = JSON.parse(message.toString());
			if (payload.type === "auth") {
				console.log(`user authenticated`);
				return;
			}
		} catch (error) {
			console.log("📨 Received raw WebSocket message:", message.toString());
			// Backward compatibility - broadcast raw messages if needed
			broadcast({ type: "message", data: message.toString() });
		}
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

// Jalankan server HTTP + WebSocket
server.listen(process.env.PORT, () => {
	console.log(`Server running on port ${port} (HTTP + WS)`);
});

export default app;
