import Weather from "../models/Weather.js";
import { requestWeatherDataForUser } from '../mqttClient.js';


// Zapisanie danych pogodowych do bazy danych
export const saveWeatherData = async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            temperature,
            humidity,
            pressure,
            uvIndex,
            visibleLight,
            rain,
            gasLevel,
            tilt
        } = req.body;

        const weatherEntry = new Weather({
            latitude,
            longitude,
            temperature,
            humidity,
            pressure,
            uvIndex,
            visibleLight,
            rain,
            gasLevel,
            tilt
        });

        await weatherEntry.save();
        res.status(201).json({ message: "Weather data saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pobranie wszystkich zapisanych danych pogodowych
export const getWeatherData = async (req, res) => {
    try {
        const userId = req.user.id; // Id użytkownika
        console.log(`[DEBUG] Wysyłanie żądania o dane pogodowe dla użytkownika ${userId}`);
        
        // Wyślij żądanie MQTT i poczekaj na odpowiedź
        await requestWeatherDataForUser(userId);

        // Pobierz dane pogodowe po odpowiedzi
        const weatherRecords = await Weather.find().sort({ timestamp: -1 });
        res.status(200).json(weatherRecords);
    } catch (error) {
        console.error(`[ERROR] Błąd podczas pobierania danych pogodowych:`, error);
        res.status(500).json({ error: error.message });
    }
};

// Pobranie pojedynczego rekordu danych pogodowych na podstawie ID
export const getWeatherDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const weatherRecord = await Weather.findById(id);

        if (!weatherRecord) {
            return res.status(404).json({ message: "Weather record not found." });
        }

        res.status(200).json(weatherRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Usunięcie rekordu danych pogodowych na podstawie ID
export const deleteWeatherData = async (req, res) => {
    try {
        const { id } = req.params;
        const weatherRecord = await Weather.findByIdAndDelete(id);

        if (!weatherRecord) {
            return res.status(404).json({ message: "Weather record not found." });
        }

        res.status(200).json({ message: "Weather record deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getWeatherByDate = async (req, res) => {
    try {
        const { date } = req.query; // Format daty: YYYY-MM-DD
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const weatherRecords = await Weather.find({
            timestamp: { $gte: start, $lt: end },
        });
        res.status(200).json(weatherRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pobranie określonej liczby wpisów (10, 25, 50, 100)
export const getLimitedWeatherData = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50; // Domyślnie 50 wpisów na stronę
        const page = parseInt(req.query.page, 10) || 1; // Domyślnie strona 1
        const skip = (page - 1) * limit; // Obliczenie ile wpisów pominąć

        const weatherRecords = await Weather.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const totalRecords = await Weather.countDocuments(); // Liczba wszystkich wpisów

        res.status(200).json({
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            data: weatherRecords
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getWeatherByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required." });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Dodanie jednego dnia, aby uwzględnić całą końcową datę

        const weatherRecords = await Weather.find({
            timestamp: { $gte: start, $lt: end },
        }).sort({ timestamp: 1 });

        res.status(200).json(weatherRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pobranie konkretnych danych (np. tylko temperatury)
export const getSpecificWeatherField = async (req, res) => {
    try {
        const { field } = req.query; // Pole do pobrania, np. "temperature"
        const weatherRecords = await Weather.find({}, { [field]: 1, timestamp: 1 });
        res.status(200).json(weatherRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
