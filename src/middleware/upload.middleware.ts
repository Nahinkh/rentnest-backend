import multer from "multer";

const storage = multer.memoryStorage();
export const uploadImages = multer({
    storage: storage,
    limits:{
        files:10,
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
        }
        cb(null, true);
    }
    
})