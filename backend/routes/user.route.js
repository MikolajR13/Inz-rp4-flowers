import express from "express";
import { createUser, deleteUser, getUser, updateUser, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUser); // Pobieranie wszystkich użytkowników
router.get("/:id", getUserById); // Pobieranie konkretnego użytkownika po ID
router.put("/:id", updateUser); // Aktualizowanie użytkownika po ID
router.post("/", createUser); // Tworzenie nowego użytkownika
router.delete("/:id", deleteUser); // Usuwanie użytkownika po ID

export default router;
