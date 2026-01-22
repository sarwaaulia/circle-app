import express from "express";
import { handleLogin, handleRegister } from "../controllers/user_auth";
import { authenticate } from "../middlewares/userAuth";
import upload from "../utils/multer";
import corsMiddleware from "../middlewares/cors";

const router = express.Router()

router.post("/register", upload.single("photo_profile"), handleRegister)

router.post("/login", handleLogin)


// user
router.get("/me", corsMiddleware, authenticate, async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.json({
            message: "User profile",
            data: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

export default router