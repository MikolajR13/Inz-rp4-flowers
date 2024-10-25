import express from "express";
import { createUser, deleteUser, getUser, updateUser, getUserById } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", getUser); // Pobieranie wszystkich użytkowników
router.get("/:id",authMiddleware, getUserById); // Pobieranie konkretnego użytkownika po ID
router.put("/:id",authMiddleware, updateUser); // Aktualizowanie użytkownika po ID
router.post("/", createUser); // Tworzenie nowego użytkownika
router.delete("/:id",authMiddleware, deleteUser); // Usuwanie użytkownika po ID
router.post("/login", loginUser);

export default router;
