import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not set. Make sure backend/.env exists and defines MONGODB_URI.");
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {});
        console.log("Connected to MongoDB");
        return conn;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};