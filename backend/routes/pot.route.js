import express from 'express';
import { createPot, updatePot, deletePot, getPotsByUser, getPotById } from "../controllers/pot.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Pobieranie wszystkich doniczek użytkownika
router.get("/",authMiddleware, getPotsByUser);

// Pobieranie konkretnej doniczki użytkownika
router.get("/:potId",authMiddleware, getPotById);

// Tworzenie nowej doniczki dla użytkownika
router.post("/",authMiddleware, createPot);

// Aktualizowanie doniczki użytkownika
router.put("/:potId",authMiddleware, updatePot);

// Usuwanie doniczki użytkownika
router.delete("/:potId",authMiddleware, deletePot);

export default router;

