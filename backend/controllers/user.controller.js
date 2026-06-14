import User from "../models/users.models.js";
import {createUser, getAllUsers} from "../services/user.service.js";
import {validationResult} from 'express-validator';
import redisClient from "../services/redis.service.js";

export const createUserController = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){ 
        return res.status(400).json({error: errors.array()[0].msg});
    }

    try{
        const user = await createUser(req.body);
        const token = user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        delete user._doc.password;
        res.status(201).json({message: 'User Created Successfully', user, token});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const loginUserController = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()[0].msg});
    }

    try{
        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+password');
        if(!user || !(await user.isValidPassword(password))){
            throw new Error("Invalid Credintials");
        }
        const token = user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        delete user._doc.password;
        res.status(200).json({message: 'User Logged In Successfully', user, token});

    }catch(err){
        res.status(400).json({error: err.message});
    }

}

export const userProfileController = async(req,res) => {
    console.log(req.user);
    res.status(200).json({
        user:req.user
    });
}

export const userLogoutController = async(req, res) => {
    try{
        const token = req.cookies?.token || (req.header('Authorization') ? req.header('Authorization').split(' ')[1]: null);

        redisClient.set(token, 'logout', 'EX', 60*60*24);

        res.status(200).json({message: 'Logout Successfully'});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const getAllUsersController = async(req, res) => {
    try{
        const userId = req.user._id;
        const users = await getAllUsers({userId});
        res.status(200).json({users});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}