import express from 'express';
import { registerUser, validateRegister } from '../controllers/register.controller';
import { loginUser, validateLogin } from '../controllers/login.controller';

const router = express.Router();
router.get('/', (req, res)=>{
    res.send("This");
});
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

export default router;
