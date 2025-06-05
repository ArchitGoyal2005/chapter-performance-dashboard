import { MAX_LIMIT } from "./defaults";
import { ChapterQuery, ValidationError } from "./typings";

export const validateQueryParams = (query: ChapterQuery): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate page parameter
  if (query.page !== undefined) {
    const pageNum = parseInt(query.page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push({
        field: "page",
        message: "Page must be a positive integer",
        received: query.page,
      });
    }
  }

  // Validate limit parameter
  if (query.limit !== undefined) {
    const limitNum = parseInt(query.limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      errors.push({
        field: "limit",
        message: "Limit must be a positive integer",
        received: query.limit,
      });
    } else if (limitNum > MAX_LIMIT) {
      errors.push({
        field: "limit",
        message: `Limit cannot exceed ${MAX_LIMIT}`,
        received: query.limit,
      });
    }
  }

  // Validate weakChapters parameter
  if (query.weakChapters !== undefined) {
    const validBooleans = ["true", "false"];
    if (!validBooleans.includes(query.weakChapters.toLowerCase())) {
      errors.push({
        field: "weakChapters",
        message: 'WeakChapters must be either "true" or "false"',
        received: query.weakChapters,
      });
    }
  }

  // Validate status parameter (assuming specific valid values)
  if (query.status !== undefined) {
    const validStatuses = ["Not Started", "In Progress", "Completed"];
    if (!validStatuses.includes(query.status)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
        received: query.status,
      });
    }
  }

  if (query.class !== undefined) {
    const validClasses = ["Class 9", "Class 10", "Class 11", "Class 12"];
    if (!validClasses.includes(query.class)) {
      errors.push({
        field: "class",
        message: `Class must be one of: ${validClasses.join(", ")}`,
        received: query.class,
      });
    }
  }

  return errors;
};
