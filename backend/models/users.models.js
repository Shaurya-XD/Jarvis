import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [6, 'Email must be at least 6 characters long'],
        match: [
            /^\S+@\S+\.\S+$/,
            'Please enter a valid email'
        ]
    }, 
    password: {
        type: String,
        required: true,
        select: false,
    }
})

userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function() {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, { expiresIn: '24h'})
}

const User = mongoose.model('user', userSchema);

export default User;