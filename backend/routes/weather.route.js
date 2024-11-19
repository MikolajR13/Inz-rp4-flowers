import express from "express";
import {
    getLimitedWeatherData,
    getWeatherByDateRange,
    saveWeatherData,
    getWeatherData
} from "../controllers/weather.controller.js";

const router = express.Router();

// Zapisanie danych pogodowych
router.post("/", saveWeatherData);

// Pobranie wszystkich danych pogodowych
router.get("/", getWeatherData);

// Pobranie ograniczonej liczby wpisów z paginacją
router.get("/limit", getLimitedWeatherData);

// Pobranie danych z określonego zakresu dat
router.get("/date-range", getWeatherByDateRange);

export default router;
