import crypto from 'crypto';
import Profile from '../models/profile.model';

export const generateEmailVerificationToken = async (UserId: String) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    try{
        await Profile.findOneAndUpdate({ UserId }, {
            EmailVerificationToken: token,
            EmailVerificationExpires: expires
        });
        return token;
    }catch(err){
        console.error(err);
        return "";
    }
    
};
