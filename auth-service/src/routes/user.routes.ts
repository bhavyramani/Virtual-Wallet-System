import express from 'express';
import { registerUser, validateRegister } from '../controllers/register.controller';
import { loginUser, validateLogin } from '../controllers/login.controller';

const router = express.Router();

// Register route with validation
router.post('/auth/register', validateRegister, registerUser);

// Login route with validation
router.post('/auth/login', validateLogin, loginUser);

export default router;
