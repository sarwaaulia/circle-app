import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Arahkan ke folder uploads yang ada di dalam src
    cb(null, path.join(__dirname, "../uploads")); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 2 * 1024 * 1024 },
});

export default upload;