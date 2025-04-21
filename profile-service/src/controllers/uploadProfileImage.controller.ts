import { Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";

// Set up storage configuration
const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "..", "uploads");

        // Create uploads folder if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.headers["x-user-id"] as string;

        if (!userId) {
            return cb(new Error("User ID is missing in headers"), "");
        }

        cb(null, `${userId}.jpg`);
    },
});

// Set up multer middleware
const upload = multer({ storage }).single("profileImage");

export const uploadProfileImage = (req: Request, res: Response): void => {
    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: err.message });
        } else if (err) {
            console.error("Unknown upload error:", err);
            return res.status(500).json({ message: "Failed to upload image" });
        }

        const userId = req.headers["x-user-id"] as string;
        const filePath = `/uploads/${userId}.jpg`;

        res.status(200).json({
            message: "Profile image uploaded successfully.",
            filename: `${userId}.jpg`,
            filePath,
        });

        return;
    });
};
