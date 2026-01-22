import express from "express";
import { authenticate } from "../middlewares/userAuth";
import threadController from "../controllers/thread";
import upload from "../utils/multer";
import corsMiddleware from "../middlewares/cors";

const router = express.Router();

// get all thread
router.get(
	"/threads",
	corsMiddleware,
	authenticate,
	threadController.getAllThreads,
);

// by threaad id
router.get("/:id", authenticate, threadController.getThreadById);

// create a new thread with uploas
router.post(
	"/threads",
	authenticate,
	upload.single("image"),
	threadController.createThread,
);

// update thread
router.put("/:id", authenticate, threadController.updateThread);

// delete thread
router.patch(
	"/:id/increment-replies",
	authenticate,
	threadController.incrementReplies,
);

// delete thread (protected)
router.delete("/:id", authenticate, threadController.deleteThread);

export default router;
