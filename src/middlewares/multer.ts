import multer from "multer";
import ErrorHandler from "../utils/Error_Utility_Class";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/json") {
      cb(null, true);
    } else {
      cb(new ErrorHandler("Only JSON files are allowed", 400) as any, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadMiddleware = upload.single("chapters");
