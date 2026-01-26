import express from "express";
import { authenticate } from '../middlewares/userAuth';
import threads from '../controllers/thread';

const router = express.Router()

// rread likes by thread id
router.post("/:threadId/thread/like", authenticate, threads.toggleLike);

router.get('/:id/like/status', authenticate, threads.getLikeStatus);

export default router;