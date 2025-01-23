import express from 'express';
import { getProfile } from '../controllers/getProfile.controller';
import { updateProfile, validateProfileUpdate } from '../controllers/updateProfile.controller';

const router = express.Router();

// Fetch user profile
router.get('/user/:id', getProfile);

// Update user profile
router.put('/user/:id', validateProfileUpdate, updateProfile);

export default router;
