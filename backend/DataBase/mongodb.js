import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();


export const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.FLOWERS_DB_URI);
        console.log(`DataBase connected: ${conn.connection.host}`);
    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}