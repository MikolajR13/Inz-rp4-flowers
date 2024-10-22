import express from 'express';
import {
  addWateringHistory,
  getWateringHistory,
  getWateringHistoryById,
  updateWateringHistory,
  deleteWateringHistory
} from "../controllers/wateringHistory.controller.js";

const router = express.Router({ mergeParams: true });

// Pobieranie całej historii podlewania dla danej doniczki
router.get("/", getWateringHistory);

// Pobieranie konkretnego wpisu w historii podlewania
router.get("/:historyId", getWateringHistoryById);

// Dodawanie nowego wpisu do historii podlewania dla danej doniczki
router.post("/", addWateringHistory);

// Aktualizowanie konkretnego wpisu w historii podlewania
router.put("/:historyId", updateWateringHistory);

// Usuwanie konkretnego wpisu w historii podlewania
router.delete("/:historyId", deleteWateringHistory);

export default router;
