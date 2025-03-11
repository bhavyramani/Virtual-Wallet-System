import express from "express";
import {
  registerUser,
  validateRegister,
} from "../controllers/register.controller";
import { loginUser, validateLogin } from "../controllers/login.controller";
import { updateEmail } from "../controllers/updateEmail.controller";
import { LogOutUser } from "../controllers/logout.controller";
import { resetPassword } from "../controllers/resetPassword.controller";

const router = express.Router();
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", LogOutUser);
router.put("/updateEmail/:id", updateEmail);
router.post("/reset-password", resetPassword);

export default router;
