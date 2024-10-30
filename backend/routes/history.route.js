import express from 'express';
import {
  addWateringHistory,
  getWateringHistory,
  getWateringHistoryById,
  updateWateringHistory,
  deleteWateringHistory,
  getAllWateringHistoryForUser
} from "../controllers/wateringHistory.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Pobieranie całej historii podlewania dla danej doniczki
router.get("/pots/:potId/watering/",authMiddleware, getWateringHistory);

// Pobieranie konkretnego wpisu w historii podlewania
router.get("/pots/:potId/watering/:historyId",authMiddleware, getWateringHistoryById);

router.get('/watering-history', authMiddleware, getAllWateringHistoryForUser);

// Dodawanie nowego wpisu do historii podlewania dla danej doniczki
router.post("/pots/:potId/watering/",authMiddleware, addWateringHistory);

// Aktualizowanie konkretnego wpisu w historii podlewania
router.put("/pots/:potId/watering/:historyId",authMiddleware, updateWateringHistory);

// Usuwanie konkretnego wpisu w historii podlewania
router.delete("/pots/:potId/watering/:historyId",authMiddleware, deleteWateringHistory);

export default router;
