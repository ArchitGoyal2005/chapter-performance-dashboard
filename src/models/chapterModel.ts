import { model, Schema } from "mongoose";

const ChapterSchema = new Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [2, "Subject must be at least 2 characters long"],
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },

    chapter: {
      type: String,
      required: [true, "Chapter is required"],
      trim: true,
      minlength: [2, "Chapter must be at least 2 characters long"],
      maxlength: [200, "Chapter cannot exceed 200 characters"],
    },

    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },

    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      minlength: [2, "Unit must be at least 2 characters long"],
      maxlength: [150, "Unit cannot exceed 150 characters"],
    },

    yearWiseQuestionCount: {
      type: Map,
      of: {
        type: Number,
        min: [0, "Question count cannot be negative"],
        max: [1000, "Question count seems too high"],
        validate: {
          validator: Number.isInteger,
          message: "Question count must be a whole number",
        },
      },
      required: [true, "Year-wise question count is required"],
      validate: {
        validator: function (map: Map<string, number>) {
          if (map.size === 0) return false;

          for (const year of map.keys()) {
            if (!/^\d{4}$/.test(year)) return false;
            const yearNum = parseInt(year);
            if (yearNum < 1950 || yearNum > new Date().getFullYear() + 2)
              return false;
          }
          return true;
        },
        message: "Invalid year format or year out of range",
      },
    },

    questionSolved: {
      type: Number,
      required: [true, "Questions solved count is required"],
      min: [0, "Questions solved cannot be negative"],
      max: [10000, "Questions solved count seems too high"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Questions solved must be a whole number",
      },
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Not Started", "In Progress", "Completed"],
        message: "Status must be one of: Not Started, In Progress, Completed",
      },
      default: "Not Started",
    },

    isWeakChapter: {
      type: Boolean,
      required: [true, "Weak chapter flag is required"],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.index(
  {
    userId: 1,
    class: 1,
    subject: 1,
    chapter: 1,
  },
  { unique: true }
);

export const Chapter = model("Chapter", ChapterSchema);
