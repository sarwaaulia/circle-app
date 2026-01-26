import express from "express";
import { handleLogin, handleRegister } from "../controllers/user_auth";
import { authenticate } from "../middlewares/userAuth";
import upload from "../utils/multer";
import corsMiddleware from "../middlewares/cors";
import prisma from "../prisma/client";

const router = express.Router()

router.post("/register", upload.single("photo_profile"), handleRegister)

router.post("/login", upload.single("photo_profile"), handleLogin)


// user
router.get("/me", corsMiddleware, authenticate, async (req, res) => {
    const {user} = req as any;
    try {
        const userData = await prisma.user.findUnique({
            where: {id: user.id},
            select: {
                id: true,
                username: true,
                full_name: true,
                email: true,
                photo_profile: true,
                bio: true,
            }
        })

        if(!userData) {
            return res.status(404).json({
                message: `user not found`
            })
        }

        return res.status(200).json({
            message: `success`,
            data: userData
        })
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

export default router