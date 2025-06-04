import { redisClient } from "..";
import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middlewares/error";
import { Chapter } from "../models/chapterModel";
import ErrorHandler from "../utils/Error_Utility_Class";

export const getAllChapters = TryCatch(async (req, res, next) => {
  const {
    class: cls,
    unit,
    status,
    subject,
    weakChapters,
    page = "1",
    limit = "10",
  } = req.query;

  const filters: Record<string, any> = {};
  if (cls) filters.class = cls;
  if (unit) filters.unit = unit;
  if (status) filters.status = status;
  if (subject) filters.subject = subject;
  if (weakChapters !== undefined)
    filters.weakChapters = weakChapters === "true";

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const cacheKey = `chapters:${JSON.stringify(
    filters
  )}:page${page}:limit${limit}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    res.status(200).json(JSON.parse(cached));
    return;
  }
  const chapters = await Chapter.find(filters)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Chapter.countDocuments(filters);
  const response = { chapters, total };

  await redisClient.setex(cacheKey, 3600, JSON.stringify(response)); // Cache for 1 hour

  res.status(200).json(response);
});

export const getChapterById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return next(new ErrorHandler("Chapter not found", 400));
    }

    res.status(200).json({
      success: true,
      data: chapter,
    });
  }
);

export const uploadChapters = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let chaptersData: any[];

    try {
      if (req.file) {
        const fileContent = req.file.buffer.toString("utf8");
        chaptersData = JSON.parse(fileContent);
      } else if (req.body && Array.isArray(req.body)) {
        chaptersData = req.body;
      } else {
        throw new ErrorHandler(
          "JSON file or array of chapters in body is required",
          400
        );
      }
    } catch (error) {
      return next(new ErrorHandler("Invalid JSON format or request body", 400));
    }

    if (!Array.isArray(chaptersData)) {
      return next(new ErrorHandler("Chapters data must be an array", 400));
    }

    if (chaptersData.length === 0) {
      return next(new ErrorHandler("No chapters provided", 400));
    }

    if (chaptersData.length > 1000) {
      return next(
        new ErrorHandler("Cannot upload more than 1000 chapters at once", 400)
      );
    }

    const uploadedChapters: any[] = [];
    const failedUploads: Array<{
      chapter: any;
      errors: string[];
      index: number;
    }> = [];

    try {
      const inserted = await Chapter.insertMany(chaptersData, {
        ordered: false,
      });
      uploadedChapters.push(...inserted);
    } catch (error: any) {
      if (error.writeErrors) {
        error.writeErrors.forEach((writeErr: any) => {
          failedUploads.push({
            chapter: writeErr.err.op,
            errors: [writeErr.err.errmsg || "Insertion failed"],
            index: writeErr.index,
          });
        });
      } else {
        return next(new ErrorHandler("Unexpected error during insertion", 500));
      }
    }

    if (uploadedChapters.length > 0) {
      try {
        const cacheKeys = await redisClient.keys("chapters:*");
        if (cacheKeys.length > 0) {
          await redisClient.del(...cacheKeys);
          console.log(`Cleared ${cacheKeys.length} chapter cache entries`);
        }
      } catch (cacheError) {
        console.error("Error clearing chapter cache:", cacheError);
      }
    }

    const response: any = {
      success: true,
      message: `Successfully uploaded ${uploadedChapters.length} chapters`,
      data: {
        uploadedCount: uploadedChapters.length,
        failedCount: failedUploads.length,
        totalProcessed: chaptersData.length,
        uploadedChapters: uploadedChapters,
      },
    };

    if (failedUploads.length > 0) {
      response.failedChapters = failedUploads;
    }

    res.status(201).json(response);
  }
);
