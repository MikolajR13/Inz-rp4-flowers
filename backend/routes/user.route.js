import express from "express";
import { createUser, deleteUser, getUser, updateUser, getUserById, getUserByToken, getUserInfo } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", getUser); // Pobieranie wszystkich użytkowników
router.get("/me",authMiddleware, getUserById); // Pobieranie konkretnego użytkownika po ID
router.put("/me",authMiddleware, updateUser); // Aktualizowanie użytkownika po ID
router.post("/", createUser); // Tworzenie nowego użytkownika
router.delete("/me",authMiddleware, deleteUser); // Usuwanie użytkownika po ID
router.post("/login", loginUser);
router.get("/me", authMiddleware, getUserByToken);
router.get('/me/info', authMiddleware, getUserInfo);

export default router;
