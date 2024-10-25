import express from "express"
import { connectDb } from "./DataBase/mongodb.js";
import dotenv from "dotenv";
import User from "./models/User.js";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";
import potRoutes from "./routes/pot.route.js";
import historyRoutes from "./routes/history.route.js";
import cors from 'cors';


dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000;
app.use(express.json())
app.use(cors());
app.use("/api/users", userRoutes);  // Ścieżka użytkownika - główna
app.use("/api/users/:userId/pots", potRoutes); // Ścieżka z doniczkami - powiązana z userId bo jest doniczki per user
app.use("/api/users/:userId/pots/:potId/watering", historyRoutes); // Ścieżka związana z historią podlewania per doniczka - powiązana z potId bo jes historia podlewania per doniczka

app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.get("/", (req, res) => {
    res.send("Ready to work");
});


app.listen(PORT, () => {
    connectDb();
    console.log("Server started at https://localhost:5000")
});

export default app