import express from "express";
import { getProfile } from "../controllers/getProfile.controller";
import { updateProfile } from "../controllers/updateProfile.controller";
import { createProfile } from "../controllers/createProfile.controller";

const router = express.Router();

router.get("/", getProfile);
router.put("/:id", updateProfile);
router.post("/create", createProfile);

export default router;
