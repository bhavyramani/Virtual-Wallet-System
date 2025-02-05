import express from "express";
import { getProfile } from "../controllers/getProfile.controller";
import { updateProfile } from "../controllers/updateProfile.controller";
import { createProfile } from "../controllers/createProfile.controller";
import { searchProfile } from "../controllers/searchProfile.controller";

const router = express.Router();

router.get("/:id", getProfile);
router.put("/:id", updateProfile);
router.post("/create", createProfile);
router.post("/search", searchProfile);

export default router;
