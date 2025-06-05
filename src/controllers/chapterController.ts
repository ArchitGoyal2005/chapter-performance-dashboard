import { redisClient } from "..";
import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middlewares/error";
import { Chapter } from "../models/chapterModel";
import ErrorHandler from "../utils/Error_Utility_Class";
import { ChapterFilters, ChapterQuery } from "../utils/typings";
import { validateQueryParams } from "../utils/utils";
import {
  CACHE_TTL,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../utils/defaults";

export const getAllChapters = TryCatch(async (req, res, next) => {
  const query = req.query as ChapterQuery;

  const validationErrors = validateQueryParams(query);

  if (validationErrors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: validationErrors,
    });
    return;
  }

  const filters: ChapterFilters = {};

  if (query.class) filters.class = query.class;
  if (query.unit) filters.unit = query.unit;
  if (query.status) filters.status = query.status;
  if (query.subject) filters.subject = query.subject;
  if (query.weakChapters !== undefined) {
    filters.weakChapters = query.weakChapters === "true";
  }

  const pageNum = Math.max(1, parseInt(query?.page || "0", 10) || DEFAULT_PAGE);
  const limitNum = Math.min(
    Math.max(1, parseInt(query?.limit || "0", 10) || DEFAULT_LIMIT),
    MAX_LIMIT
  );

  const cacheKey = `chapters:${JSON.stringify(
    filters
  )}:page${pageNum}:limit${limitNum}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    res.status(200).json(JSON.parse(cached));
    return;
  }
  const chapters = await Chapter.find(filters)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Chapter.countDocuments(filters);

  const totalPages = Math.ceil(total / limitNum);

  const response = {
    success: true,
    message: "Chapters fetched successfully",
    data: {
      data: chapters,
      filters,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
        hasNext: total == 0 && pageNum < totalPages,
        hasPrev: total == 0 && pageNum > 1,
      },
    },
  };

  if (total == 0) {
    response.message = "No chapters found matching the given query";
  }

  await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(response));

  res.status(200).json(response);
});

export const getChapterById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return next(new ErrorHandler("Chapter not found with the given id", 404));
    }

    res.status(200).json({
      success: true,
      message: "Chapter fetched successfully",
      data: {
        data: chapter,
      },
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
