import express from 'express';
import { registerUser, validateRegister } from '../controllers/register.controller';
import { loginUser, validateLogin } from '../controllers/login.controller';
import { updateEmail } from '../controllers/updateEmail.controller';

const router = express.Router();
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/updateEmail/:id', updateEmail);

export default router;
