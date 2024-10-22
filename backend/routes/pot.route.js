import express from 'express';
import { createPot, updatePot, deletePot, getPotsByUser, getPotById } from "../controllers/pot.controller.js";

const router = express.Router({ mergeParams: true });

// Pobieranie wszystkich doniczek użytkownika
router.get("/", getPotsByUser);

// Pobieranie konkretnej doniczki użytkownika
router.get("/:potId", getPotById);

// Tworzenie nowej doniczki dla użytkownika
router.post("/", createPot);

// Aktualizowanie doniczki użytkownika
router.put("/:potId", updatePot);

// Usuwanie doniczki użytkownika
router.delete("/:potId", deletePot);

export default router;
