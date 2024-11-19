import express from 'express';
import { addPot, updatePot, deletePot, getPotsByUser, getPotById, getLatestSoilMoisture, requestSoilMoisture } from "../controllers/pot.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Pobieranie wszystkich doniczek użytkownika
router.get("/",authMiddleware, getPotsByUser);

// Pobieranie konkretnej doniczki użytkownika
router.get("/:potId",authMiddleware, getPotById);

// Pobieranie wilgotności gleby
router.get('/:potId/soil-moisture',authMiddleware,  getLatestSoilMoisture);

router.post('/:potId/soil-moisture', authMiddleware, requestSoilMoisture);

router.post("/",authMiddleware, addPot);

// Aktualizowanie doniczki użytkownika
router.put("/:potId",authMiddleware, updatePot);

// Usuwanie doniczki użytkownika
router.delete("/:potId",authMiddleware, deletePot);

export default router;

