import express from "express";
import { createUser, deleteUser, getUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUser);
router.put("/:id", updateUser);
router.post("/", createUser);
router.delete("/:id", deleteUser);



export default router;