import express from "express";
import { authenticate } from '../middlewares/userAuth';
import threadController from '../controllers/thread';

const router = express.Router()

// thread by user 
router.get("/user/:userId", authenticate, threadController.getThreadsByUser)

export default router;