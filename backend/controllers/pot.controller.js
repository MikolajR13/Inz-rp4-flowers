import Pot from '../models/Pot.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { sendPotListToUser, requestSoilMoistureCheck } from '../mqttClient.js';
import { fetchPlantData } from '../utils/trefleApi.js';
import deepl from 'deepl-node';

const translator = new deepl.Translator(process.env.TRANSLATE_API);
// Pobierz wszystkie doniczki dla konkretnego użytkownika
export const getPotsByUser = async (req, res) => {
    const userId = req.user.id; // Pobierz userId z authMiddleware

    try {
        const pots = await Pot.find({ owner: userId });
        res.status(200).json({ success: true, data: pots });
    } catch (error) {
        console.error("Błąd pobierania doniczek", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const requestSoilMoisture = async (req, res) => {
    const userId = req.user.id;
    const { potId } = req.params;
  
    try {
      const pot = await Pot.findOne({ _id: potId, owner: userId });
      if (!pot) {
        return res.status(404).json({ success: false, message: 'Doniczka nie została znaleziona' });
      }
  
      requestSoilMoistureCheck(userId, potId);
      res.status(200).json({ success: true, message: 'Wysłano żądanie o sprawdzenie wilgotności gleby' });
    } catch (error) {
      console.error("Błąd podczas wysyłania żądania o wilgotność gleby", error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

export const getLatestSoilMoisture = async (req, res) => {
    const userId = req.user.id; 
    const { potId } = req.params;

    try {
        const pot = await Pot.findOne({ _id: potId, owner: userId });
        if (!pot) {
            return res.status(404).json({ success: false, message: 'Doniczka nie została znaleziona' });
        }

        const latestEntry = pot.wateringHistory
            .filter(entry => entry.soilMoisture != null)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!latestEntry) {
            return res.status(404).json({ success: false, message: 'Brak danych o wilgotności gleby' });
        }

        res.status(200).json({ success: true, soilMoisture: latestEntry.soilMoisture });
    } catch (error) {
        console.error("Błąd podczas pobierania najnowszej wilgotności gleby", error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Pobieranie konkretnej doniczki użytkownika
export const getPotById = async (req, res) => {
    const userId = req.user.id; // Pobierz userId z authMiddleware
    const { potId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(potId)) {
        return res.status(404).json({ success: false, message: "Nie ma doniczki o takim Id" });
    }

    try {
        const pot = await Pot.findOne({ _id: potId, owner: userId });
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }
        res.status(200).json({ success: true, data: pot });
    } catch (error) {
        console.error("Błąd pobierania doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Utwórz nową doniczkę dla konkretnego użytkownika

export const addPot = async (req, res) => {
    const {
        potName,
        flowerName,
        waterAmount,
        wateringFrequency,
        potSize,
        shape,
        dimensions,
        otherParams,
        plantData 
    } = req.body;

    if (
        !potName ||
        !flowerName ||
        !waterAmount ||
        !wateringFrequency ||
        !potSize ||
        !shape ||
        !dimensions.height ||
        (shape === 'Prostopadłościan' && (!dimensions.width || !dimensions.depth)) ||
        (shape === 'Walec' && !dimensions.diameter)
    ) {
        return res.status(400).json({
            success: false,
            message: "Proszę wypełnić wszystkie wymagane pola.",
        });
    }

    try {
        const plantSpecifications = plantData ? {
            commonName: plantData.nazwa || '',
            ligneousType: plantData.typ_drzewa || '',
            growthForm: plantData.forma_wzrostu || '',
            growthHabit: plantData.nawyk_wzrostu || '',
            growthRate: plantData.tempo_wzrostu || '',
            averageHeight: plantData.srednia_wysokosc || '',
            maximumHeight: plantData.maksymalna_wysokosc || '',
            shapeAndOrientation: plantData.orientacja || '',
            toxicity: plantData.toksycznosc || '',
            daysToHarvest: plantData.dni_do_zbioru || '',
            soilRequirements: {
                phMin: plantData.ph_min || '',
                phMax: plantData.ph_max || '',
                soilNutriments: plantData.wartosci_odzywcze_gleby || '',
                soilSalinity: plantData.zasolenie_gleby || '',
                soilTexture: plantData.tekstura_gleby || '',
                soilHumidity: plantData.wilgotnosc_gleby || ''
            },
            lightRequirements: plantData.swiatlo || '',
            atmosphericHumidity: plantData.wilgotnosc_powietrza || '',
            growthMonths: plantData.miesiace_wzrostu || '',
            bloomMonths: plantData.miesiace_kwitnienia || '',
            fruitMonths: plantData.miesiace_owocowania || '',
            precipitation: {
                min: plantData.minimalne_opady || '',
                max: plantData.maksymalne_opady || ''
            },
            temperature: {
                min: plantData.minimalna_temperatura || '',
                max: plantData.maksymalna_temperatura || ''
            }
        } : {};

        const newPot = new Pot({
            potName,
            flowerName,
            waterAmount,
            wateringFrequency,
            potSize,
            shape,
            dimensions,
            otherParams,
            plantSpecifications, // Dodanie specyfikacji rośliny do doniczki
            owner: req.user.id,
        });
        const userId = req.user.id;

        await newPot.save();

        await User.findByIdAndUpdate(req.user.id, {
            $push: { pots: newPot._id }
        });

        res.status(201).json({ success: true, data: newPot });
        sendPotListToUser(userId);
    } catch (error) {
        console.error("Błąd dodawania doniczki:", error.message);
        res.status(500).json({ success: false, message: "Błąd serwera podczas dodawania doniczki." });
    }
};


// Aktualizacja doniczki użytkownika
export const updatePot = async (req, res) => {
    const userId = req.user.id;; // Pobierz userId z authMiddleware
    const { potId } = req.params;
    const potData = req.body;

    if (!mongoose.Types.ObjectId.isValid(potId)) {
        return res.status(404).json({ success: false, message: "Nie ma doniczki o takim Id" });
    }

    try {
        const updatedPot = await Pot.findOneAndUpdate(
            { _id: potId, owner: userId },
            potData,
            { new: true }
        );
        if (!updatedPot) return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        res.status(200).json({ success: true, data: updatedPot });
    } catch (error) {
        console.error("Błąd aktualizacji doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Usuwanie doniczki użytkownika
export const deletePot = async (req, res) => {
    const userId = req.user.id; // Pobierz userId z authMiddleware
    const { potId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(potId)) {
        return res.status(404).json({ success: false, message: "Nie ma doniczki o takim Id" });
    }

    try {
        const deletedPot = await Pot.findOneAndDelete({ _id: potId, owner: userId });
        if (!deletedPot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { pots: potId }
        });

        res.status(200).json({ success: true, message: `Doniczka o id: ${potId} usunięta` });
        sendPotListToUser(userId);
    } catch (error) {
        console.error("Nie można usunąć doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getPlantData = async (req, res) => {
    const { query } = req.query || req.body;
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", query);
  
    try {
      const plantData = await fetchPlantData(query);
      if (!plantData || plantData.length === 0) {
        return res.status(404).json({ success: false, message: 'Nie znaleziono rośliny' });
      }
  
      const formattedData = await Promise.all(plantData.map(async plant => {
        const commonName = plant.common_name || 'Nieznana';
        const translatedCommonName = await translator.translateText(commonName, null, 'pl');
  
        const ligneousType = plant.specifications?.ligneous_type || 'Brak danych';
        const translatedLigneousType = await translator.translateText(ligneousType, null, 'pl');
  
        const growthForm = plant.growth?.growth_form || 'Brak danych';
        const translatedGrowthForm = await translator.translateText(growthForm, null, 'pl');
  
        const growthHabit = plant.growth?.growth_habit || 'Brak danych';
        const translatedGrowthHabit = await translator.translateText(growthHabit, null, 'pl');
  
        const growthRate = plant.growth?.growth_rate || 'Brak danych';
        const translatedGrowthRate = await translator.translateText(growthRate, null, 'pl');
  
        const shapeAndOrientation = plant.specifications?.shape_and_orientation || 'Brak danych';
        const translatedShapeAndOrientation = await translator.translateText(shapeAndOrientation, null, 'pl');
  
        const toxicity = plant.specifications?.toxicity || 'Brak danych';
        const translatedToxicity = await translator.translateText(toxicity, null, 'pl');
  
        const description = plant.growth?.description || 'Brak danych';
        const translatedDescription = await translator.translateText(description, null, 'pl');
  
        const sowing = plant.growth?.sowing || 'Brak danych';
        const translatedSowing = await translator.translateText(sowing, null, 'pl');
  
        const soilNutriments = plant.growth?.soil_nutriments || 'Brak danych';
        const translatedSoilNutriments = await translator.translateText(soilNutriments, null, 'pl');
  
        const soilSalinity = plant.growth?.soil_salinity || 'Brak danych';
        const translatedSoilSalinity = await translator.translateText(soilSalinity, null, 'pl');
  
        const soilTexture = plant.growth?.soil_texture || 'Brak danych';
        const translatedSoilTexture = await translator.translateText(soilTexture, null, 'pl');
  
        const averageHeight = plant.specifications?.average_height?.cm
          ? `${plant.specifications.average_height.cm} cm`
          : 'Brak danych';
  
        const maximumHeight = plant.specifications?.maximum_height?.cm
          ? `${plant.specifications.maximum_height.cm} cm`
          : 'Brak danych';
  
        const daysToHarvest = plant.growth?.days_to_harvest || 'Brak danych';
  
        const phMinimum = plant.growth?.ph_minimum || 'Brak danych';
        const phMaximum = plant.growth?.ph_maximum || 'Brak danych';
  
        const light = plant.growth?.light
          ? `${plant.growth.light} (0=brak światła, 10=intensywne światło)`
          : 'Brak danych';
  
        const atmosphericHumidity = plant.growth?.atmospheric_humidity
          ? `${plant.growth.atmospheric_humidity}%`
          : 'Brak danych';
  
        const growthMonths = plant.growth?.growth_months
          ? plant.growth.growth_months.join(', ')
          : 'Brak danych';
  
        const bloomMonths = plant.growth?.bloom_months
          ? plant.growth.bloom_months.join(', ')
          : 'Brak danych';
  
        const fruitMonths = plant.growth?.fruit_months
          ? plant.growth.fruit_months.join(', ')
          : 'Brak danych';
  
        const minimumPrecipitation = plant.growth?.minimum_precipitation?.mm
          ? `${plant.growth.minimum_precipitation.mm} mm`
          : 'Brak danych';
  
        const maximumPrecipitation = plant.growth?.maximum_precipitation?.mm
          ? `${plant.growth.maximum_precipitation.mm} mm`
          : 'Brak danych';
  
        const minimumTemperature = plant.growth?.minimum_temperature?.celsius
          ? `${plant.growth.minimum_temperature.celsius} °C`
          : 'Brak danych';
  
        const maximumTemperature = plant.growth?.maximum_temperature?.celsius
          ? `${plant.growth.maximum_temperature.celsius} °C`
          : 'Brak danych';
  
        const soilHumidity = plant.growth?.soil_humidity
          ? `${plant.growth.soil_humidity} (0=wyjątkowo sucho, 10=bagna)`
          : 'Brak danych';
  
        const imageUrl = plant.image_url || 'Brak obrazka';
  
        return {
          nazwa: translatedCommonName.text,
          typ_drzewa: translatedLigneousType.text,
          forma_wzrostu: translatedGrowthForm.text,
          nawyk_wzrostu: translatedGrowthHabit.text,
          tempo_wzrostu: translatedGrowthRate.text,
          srednia_wysokosc: averageHeight,
          maksymalna_wysokosc: maximumHeight,
          orientacja: translatedShapeAndOrientation.text,
          toksycznosc: translatedToxicity.text,
          dni_do_zbioru: daysToHarvest,
          opis: translatedDescription.text,
          zasiew: translatedSowing.text,
          ph_min: phMinimum,
          ph_max: phMaximum,
          swiatlo: light,
          wilgotnosc_powietrza: atmosphericHumidity,
          miesiace_wzrostu: growthMonths,
          miesiace_kwitnienia: bloomMonths,
          miesiace_owocowania: fruitMonths,
          minimalne_opady: minimumPrecipitation,
          maksymalne_opady: maximumPrecipitation,
          minimalna_temperatura: minimumTemperature,
          maksymalna_temperatura: maximumTemperature,
          wilgotnosc_gleby: soilHumidity,
          wartosci_odzywcze_gleby: translatedSoilNutriments.text,
          zasolenie_gleby: translatedSoilSalinity.text,
          tekstura_gleby: translatedSoilTexture.text,
          url_zdjecia: imageUrl,
        };
      }));
  
      res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
      console.error("Błąd podczas pobierania danych o roślinie:", error.message);
      res.status(500).json({ success: false, message: 'Błąd serwera podczas pobierania danych o roślinie' });
    }
  };
  
         
  
