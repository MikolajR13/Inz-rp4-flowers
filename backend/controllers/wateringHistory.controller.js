import WateringHistory from '../models/WateringHistory.js';
import Pot from '../models/Pot.js';
import mongoose from 'mongoose';

// Historia podlewania doniczki po Id (pobieranie)
export const getWateringHistory = async (req, res) => {
    const { potId } = req.params;

    try {
        const history = await WateringHistory.find({ pot: potId });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("Błąd pobierania historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Dodanie nowej operacji podlania
export const addWateringHistory = async (req, res) => {
    const { potId } = req.params;
    const { waterAmount } = req.body;

    try {
        const pot = await Pot.findById(potId);
        if (!pot) return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });

        const newWatering = new WateringHistory({
            date: new Date(),
            waterAmount,
            pot: potId
        });

        await newWatering.save();
        pot.wateringHistory.push(newWatering._id); // dodanie nowego wpisu do hisotrii dla danej doniczki
        await pot.save();

        res.status(201).json({ success: true, data: newWatering });
    } catch (error) {
        console.error("Problem z dodaniem wpisu do historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Aaktualizacja wpisu hisotrii podlewania
export const updateWateringHistory = async (req, res) => {
    const { historyId } = req.params;
    const wateringData = req.body;

    if (!mongoose.Types.ObjectId.isValid(historyId)) {
        return res.status(404).json({ success: false, message: "Nie ma wpisu w historii o takim Id" });
    }

    try {
        const updatedHistory = await WateringHistory.findByIdAndUpdate(historyId, wateringData, { new: true });
        if (!updatedHistory) return res.status(404).json({ success: false, message: "Wpis w historii nie znaleziony" });
        res.status(200).json({ success: true, data: updatedHistory });
    } catch (error) {
        console.error("Błąd aktualizacji wpisu w historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Usuwanie wpisu w historii podlewania
export const deleteWateringHistory = async (req, res) => {
    const { historyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(historyId)) {
        return res.status(404).json({ success: false, message: "Nie ma wpisu w historii o takim Id" });
    }

    try {
        await WateringHistory.findByIdAndDelete(historyId);
        res.status(200).json({ success: true, message: `Wpis w historii o id: ${historyId} usunięty` });
    } catch (error) {
        console.error("Nie można usunąć wpisu w historii podlewania", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
