import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

export const authUser = async(req, res, next) => {
    try{
        const token = req.cookies?.token || (req.header('Authorization') ? req.header('Authorization').split(' ')[1]: null);
        
        if(!token){
            return res.status(401).json({message: 'Unauthorization user'});
        }

        const isBlackListed = await redisClient.get(token);
        if(isBlackListed){
            res.cookie('token', '');
            return res.status(401).json({message: 'Expired Token'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        res.status(401).json({error: err.message});
    }
}