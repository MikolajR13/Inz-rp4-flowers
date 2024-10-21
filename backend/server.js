import express from "express"
import { connectDb } from "./DataBase/mongodb.js";
import dotenv from "dotenv";
import User from "./models/User.js";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";

dotenv.config();

const app = express()
app.use(express.json())

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Ready to work");
});


app.listen(5000, () => {
    connectDb();
    console.log("Server started at https://localhost:5000")
});

export default app