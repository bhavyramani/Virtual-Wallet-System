import express from "express";
import { getProfile } from "../controllers/getProfile.controller";
import { createProfile } from "../controllers/createProfile.controller";
import { searchProfile } from "../controllers/searchProfile.controller";
import { updateName } from "../controllers/updateName.controller";
import { updateEmail } from "../controllers/updateEmail.controller";
import { verifyEmail } from "../controllers/verifyEmail.controller";
import { forgotPassword } from "../controllers/forgotPassword.controller";
import { validateResetToken } from "../controllers/validateResetToken.controller";
import { sendOTP } from "../controllers/sendOTP.controller";
import { verifyOtp } from "../controllers/verifyOTP.controller";
import { uploadProfileImage } from "../controllers/uploadProfileImage.controller";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.get("/validate-reset-token", validateResetToken);
router.get("/:id", getProfile);
router.post("/create", createProfile);
router.post("/search", searchProfile);
router.put("/update-name/:id", updateName);
router.put("/update-email/:id", updateEmail);
router.post("/verify-email", verifyEmail);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtp);
router.post("/upload-profile-image", uploadProfileImage);

export default router;
