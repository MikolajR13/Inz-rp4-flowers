import Pot from '../models/Pot.js';
import mongoose from 'mongoose';

// Pobierz wszystkie doniczki dla konkretnego użytkownika
export const getPotsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pots = await Pot.find({ owner: userId });
        res.status(200).json({ success: true, data: pots });
    } catch (error) {
        console.error("Błąd pobierania doniczek", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Utwórz nowej doniczki dla konkretnego użytkownika
export const createPot = async (req, res) => {
    const { userId } = req.params;
    const potData = req.body;

    if (!potData.potName || !potData.flowerName || !potData.waterAmount || !potData.wateringFrequency || !potData.shape) {
        return res.status(400).json({ success: false, message: "Proszę wypełnić wszystkie dane doniczki" });
    }

    const newPot = new Pot({
        ...potData,
        owner: userId, // Powiązanie doniczki z użytkownikiem
    });

    try {
        await newPot.save();
        res.status(201).json({ success: true, data: newPot });
    } catch (error) {
        console.error("Problem z utworzeniem doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Aktualizacja doniczki użytkownika
export const updatePot = async (req, res) => {
    const { userId, potId } = req.params;
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
    const { userId, potId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(potId)) {
        return res.status(404).json({ success: false, message: "Nie ma doniczki o takim Id" });
    }

    try {
        const deletedPot = await Pot.findOneAndDelete({ _id: potId, owner: userId });
        if (!deletedPot) return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        res.status(200).json({ success: true, message: `Doniczka o id: ${potId} usunięta` });
    } catch (error) {
        console.error("Nie można usunąć doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
