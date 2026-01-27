import express from "express";
import * as followController from "../controllers/follows";
import { authenticate } from "../middlewares/userAuth";

const router = express.Router();

// follow
router.post("/follow", authenticate, followController.follow);

router.post("/unfollow", authenticate, followController.unfollow);

router.get("/:id/follow_stats", authenticate, followController.followStats);

router.get("/:id/followers", authenticate, followController.followersList);

router.get("/:id/following", authenticate, followController.followingList);

router.get("/suggest/:userId", authenticate, followController.suggestUser);

router.post("/follow/:followingId", authenticate, followController.toggleFollow);

export default router;
