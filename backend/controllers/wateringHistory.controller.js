import WateringHistory from '../models/WateringHistory.js';
import Pot from '../models/Pot.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Pobieranie historii podlewania dla konkretnej doniczki
export const getWateringHistory = async (req, res) => {
    const { potId } = req.params;
    const { page = 1, limit = 25 } = req.query; // domyślne wartości dla paginacji

    try {
        const pot = await Pot.findById(potId);
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        const sortedHistory = pot.wateringHistory
            .sort((a, b) => b.date - a.date)
            .slice((page - 1) * limit, page * limit);

        res.status(200).json({ 
            success: true, 
            data: sortedHistory, 
            totalCount: pot.wateringHistory.length // dla totalnej liczby wpisów
        });
    } catch (error) {
        console.error("Błąd pobierania historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Pobieranie konkretnego wpisu w historii podlewania
export const getWateringHistoryById = async (req, res) => {
    const { potId, historyId } = req.params;

    try {
        const pot = await Pot.findById(potId);
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        // Szukanie wpisu w historii podlewania w zagnieżdżonym dokumencie
        const wateringHistory = pot.wateringHistory.id(historyId);
        if (!wateringHistory) {
            return res.status(404).json({ success: false, message: "Wpis w historii nie znaleziony" });
        }

        res.status(200).json({ success: true, data: wateringHistory });
    } catch (error) {
        console.error("Błąd pobierania wpisu w historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getAllWateringHistoryForUser = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 25 } = req.query;

    try {
        const user = await User.findById(userId).populate('pots');
        if (!user || user.pots.length === 0) {
            return res.status(404).json({ success: false, message: "Brak doniczek dla tego użytkownika" });
        }

        const allWateringHistory = [];
        for (const pot of user.pots) {
            const potData = await Pot.findById(pot._id).lean();
            if (potData && potData.wateringHistory) {
                allWateringHistory.push(...potData.wateringHistory.map(entry => ({
                    ...entry,
                    potId: pot._id,
                    potName: potData.potName  // Dodanie nazwy doniczki do każdego wpisu
                })));
            }
        }

        const sortedHistory = allWateringHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        const paginatedHistory = sortedHistory.slice((page - 1) * limit, page * limit);

        res.status(200).json({ 
            success: true, 
            data: paginatedHistory, 
            totalCount: allWateringHistory.length 
        });
    } catch (error) {
        console.error("Błąd pobierania historii podlewania dla wszystkich doniczek", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Dodanie nowego podlania do historii
export const addWateringHistoryForMqtt = async (potId, waterAmount, soilMoisture) => {
    try {
      const pot = await Pot.findById(potId);
      if (!pot) {
        console.error(`Doniczka o ID ${potId} nie została znaleziona`);
        return;
      }
  
      const newWatering = {
        date: new Date(),
        waterAmount: waterAmount,
        soilMoisture: soilMoisture
      };
  
      pot.wateringHistory.push(newWatering);
      await pot.save();
  
      console.log(`[DEBUG] Dodano podlanie dla doniczki ${potId}: Woda = ${waterAmount}, Wilgotność = ${soilMoisture}`);
    } catch (error) {
      console.error("Problem z dodaniem wpisu do historii podlewania", error.message);
    }
  };

  export const addWateringHistory = async (req, res) => {
    const { potId } = req.params;
    const { waterAmount } = req.body;
    const { soilMoisture } = req.body

    try {
        const pot = await Pot.findById(potId);
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        // Utworzenie nowego wpisu w historii podlewania
        const newWatering = {
            date: new Date(),
            waterAmount: waterAmount,
            soilMoisture: soilMoisture

        };

        // Dodanie nowego wpisu do pola wateringHistory
        pot.wateringHistory.push(newWatering);
        
        // zapisanie
        await pot.save();

        res.status(201).json({ success: true, data: newWatering });
    } catch (error) {
        console.error("Problem z dodaniem wpisu do historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Aaktualizacja wpisu hisotrii podlewania
export const updateWateringHistory = async (req, res) => {
    const { potId, historyId } = req.params;
    const { waterAmount } = req.body;

    try {
        const pot = await Pot.findById(potId);
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        // Szukamy wpisu w historii podlewania i aktualizujemy go
        const wateringHistory = pot.wateringHistory.id(historyId);
        if (!wateringHistory) {
            return res.status(404).json({ success: false, message: "Wpis w historii nie znaleziony" });
        }

        wateringHistory.waterAmount = waterAmount;

        await pot.save();
        res.status(200).json({ success: true, data: wateringHistory });
    } catch (error) {
        console.error("Błąd aktualizacji wpisu w historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Usuwanie wpisu w historii podlewania
export const deleteWateringHistory = async (req, res) => {
    const { potId, historyId } = req.params;

    try {
        const pot = await Pot.findById(potId);
        if (!pot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        // Usuwanie wpisu z historii podlewania
        const historyEntry = pot.wateringHistory.id(historyId);
        if (!historyEntry) {
            return res.status(404).json({ success: false, message: "Wpis w historii nie znaleziony" });
        }

        pot.wateringHistory.pull({ _id: historyId }); // Usunięcie zagnieżdżonego dokumentu żeby było ładnie
        await pot.save();

        res.status(200).json({ success: true, message: `Wpis w historii o id: ${historyId} usunięty` });
    } catch (error) {
        console.error("Nie można usunąć wpisu w historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    getWateringHistory,
    addWateringHistoryForMqtt,
  };

