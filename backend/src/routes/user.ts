import express from "express";
import { authenticate } from "../middlewares/userAuth";
import upload from "../utils/multer";
import prisma from "../prisma/client";

const router = express.Router();

export default router;
