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
router.get("/",authMiddleware, getWateringHistory);

// Pobieranie konkretnego wpisu w historii podlewania
router.get("/:historyId",authMiddleware, getWateringHistoryById);

router.get("/all", authMiddleware, getAllWateringHistoryForUser);

// Dodawanie nowego wpisu do historii podlewania dla danej doniczki
router.post("/",authMiddleware, addWateringHistory);

// Aktualizowanie konkretnego wpisu w historii podlewania
router.put("/:historyId",authMiddleware, updateWateringHistory);

// Usuwanie konkretnego wpisu w historii podlewania
router.delete("/:historyId",authMiddleware, deleteWateringHistory);

export default router;
