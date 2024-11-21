import express from "express";
import { connectDb } from "./DataBase/mongodb.js";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import potRoutes from "./routes/pot.route.js";
import historyRoutes from "./routes/history.route.js";
import weatherRoutes from "./routes/weather.route.js"; // Import nowej trasy pogodowej
import cors from 'cors';
import { checkAndWaterPots, collectWeatherDataForAllUsers } from './mqttClient.js';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);               // Ścieżka użytkownika
app.use("/api/users/me/pots", potRoutes);        // Ścieżka z doniczkami
app.use("/api/users/me", historyRoutes);         // Ścieżka z historią podlewania
app.use("/api/users/me/weather", weatherRoutes); // Ścieżka z danymi pogodowymi

app.use(cors({
    origin: process.env.SERVER
}));

app.get("/", (req, res) => {
    res.send("Ready to work");
});

// Harmonogram na sprawdzanie i podlewanie doniczek
cron.schedule('* * * * *', checkAndWaterPots);
// Harmonogram na sprawdzanie pogody
cron.schedule('0 * * * *', collectWeatherDataForAllUsers);

app.listen(PORT, () => {
    connectDb();
    console.log(`Server started at https://localhost:${PORT}`);
});

export default app;
