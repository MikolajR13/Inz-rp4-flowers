import express from 'express';
import { addPot, updatePot, deletePot, getPotsByUser, getPotById, getSoilMoisture } from "../controllers/pot.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Pobieranie wszystkich doniczek użytkownika
router.get("/",authMiddleware, getPotsByUser);

// Pobieranie konkretnej doniczki użytkownika
router.get("/:potId",authMiddleware, getPotById);

// Pobieranie wilgotności gleby
router.get('/:potId/soil-moisture', getSoilMoisture);

// Tworzenie nowej doniczki dla użytkownika
router.post("/",authMiddleware, addPot);

// Aktualizowanie doniczki użytkownika
router.put("/:potId",authMiddleware, updatePot);

// Usuwanie doniczki użytkownika
router.delete("/:potId",authMiddleware, deletePot);

export default router;
