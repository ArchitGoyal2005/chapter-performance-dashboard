import express from "express";
import {
  getAllChapters,
  getChapterById,
  uploadChapters,
} from "../controllers/chapterController";
import { uploadMiddleware } from "../middlewares/multer";

const router = express.Router();

router.get("/", getAllChapters);
router.get("/:id", getChapterById);

router.post("/", uploadMiddleware, uploadChapters);

export default router;
