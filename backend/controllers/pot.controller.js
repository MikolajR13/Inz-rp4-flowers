import Pot from '../models/Pot.js';
import User from '../models/User.js'
import mongoose from 'mongoose';

// Pobierz wszystkie doniczki dla konkretnego użytkownika
export const getPotsByUser = async (req, res) => {
    const {userId} = req.params;

    try {
        const pots = await Pot.find({ owner: userId });
        res.status(200).json({ success: true, data: pots });
    } catch (error) {
        console.error("Błąd pobierania doniczek", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Pobieranie konkretnej doniczki użytkownika
export const getPotById = async (req, res) => {
    const {userId, potId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(potId)) {
        return res.status(404).json({ success: false, message: "Nie ma doniczki o takim Id" });
    }

    try {
        const pot = await Pot.findOne({ _id: potId, owner: userId });
        if (!pot){
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        } 
        res.status(200).json({ success: true, data: pot });
    } catch (error) {
        console.error("Błąd pobierania doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Utwórz nowej doniczki dla konkretnego użytkownika
export const createPot = async (req, res) => {
    const { userId } = req.params;
    const potData = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Użytkownik nie znaleziony" });
        }

        // Tworzenie nowej doniczki i przypisanie userId do pola owner
        const newPot = new Pot({
            ...potData,
            owner: userId // Przypisanie właściciela doniczki
        });

        await newPot.save();

        user.pots.push(newPot._id); // Dodajemy referencję do doniczki u użytkownika
        await user.save();

        res.status(201).json({ success: true, data: newPot });
    } catch (error) {
        console.error("Problem z utworzeniem doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Aktualizacja doniczki użytkownika
export const updatePot = async (req, res) => {
    const {userId, potId} = req.params;
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
        // Usnięcie doniczki z kolekcji pots
        const deletedPot = await Pot.findOneAndDelete({ _id: potId, owner: userId });
        if (!deletedPot) {
            return res.status(404).json({ success: false, message: "Doniczka nie znaleziona" });
        }

        // Usunięcie referencji do doniczki z pola pots użytkownika
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { pots: potId } }, // Usunięcie odniesienia do doniczki
            { new: true }
        );

        res.status(200).json({ success: true, message: `Doniczka o id: ${potId} usunięta, odniesienie również usunięte z użytkownika` });
    } catch (error) {
        console.error("Nie można usunąć doniczki", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
