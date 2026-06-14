import mongoose from "mongoose";

export const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to the MongoDB');
    } catch (err) {
        console.log(err);
    }
};