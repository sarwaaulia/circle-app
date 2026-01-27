import express from 'express';
import upload from '../utils/multer';
import { authenticate } from '../middlewares/userAuth';
import repliesController from '../controllers/replies';

const router = express.Router()

// get all replies dari suate thread
router.get('/thread/:threadId', authenticate, repliesController.getRepliesByThread);

// create a new reply (protected)
router.post("/:threadId", authenticate, upload.any(), repliesController.createReply);

// update reply (protected)
router.put('/:id', authenticate, repliesController.updateReply);

// delete reply (protected)
router.delete('/:id', authenticate, repliesController.deleteReply);


// TOGGLE LIKE UNTUK REPLY
router.post("/:replyId/like", authenticate, repliesController.toggleLike)
router.put("/:replyId/like", authenticate, repliesController.toggleLike);
router.delete("/:replyId/like", authenticate, repliesController.toggleLike);

export default router;