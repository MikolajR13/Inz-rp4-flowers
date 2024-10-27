import User from "../models/User.js"
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUser = async (req, res) =>{
    try{
        const users = await User.find({});
        res.status(200).json({ success: true, data: users});

    } catch (error){
        console.log("błąd pobierania użytkowników", error.message);
        res.status(500).json({ success: false, message: "Server error"});

    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Nie ma użytkownika o takim Id" });
    }

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "Użytkownik nie znaleziony" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.log("Błąd pobierania użytkownika", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// src/controllers/userController.js

export const getUserInfo = async (req, res) => {
    try {
        // Sprawdza czy req.userId istnieje (dzięki middleware)
        if (!req.userId) {
            return res.status(400).json({ success: false, message: 'Nie znaleziono użytkownika' });
        }

        // Zwraca tylko id użytkownika
        res.status(200).json({ success: true, data: { id: req.userId } });
    } catch (error) {
        console.error('Błąd pobierania informacji o użytkowniku:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
};



export const getUserByToken = async (req, res) => {
    try {
      const user = await User.findById(req.user.id); // authMiddleware
      if (!user) return res.status(404).json({ success: false, message: "Użytkownik nie znaleziony" });
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

export const updateUser = async (req, res) => {
    const {id} = req.params;
    const user = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(id))
    {
        return res.status(404).json({success: false, message: "Nie ma użytkownika o takim Id"});
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, user, {new:true});
        res.status(200).json({success: true, message: `User with userId: ${id} updated`})
    } catch (error) {
        res.status(500).json({ success: false, message: "Błąd serewera"});

    }
}

export const deleteUser = async (req, res) => {
    const {id} = req.params
    console.log("id:", id)

    if (!mongoose.Types.ObjectId.isValid(id))
    {
        res.status(404).json({success: false, message: `User with id: ${id} not found`})
    }
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({success: true, message: `User with id: ${id} deleted`})
        
    } catch(error) {
        console.log("Nie można usunąć użytkownika", error.message);
        res.status(500).json( { success: false, message:"Server Error"});
        
    }
}

export const createUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: "Proszę wypełnić wszystkie dane" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email jest już zarejestrowany" });
        }

        // Hashowanie hasła
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({ firstName, lastName, email, passwordHash });
        await newUser.save();

        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error("Problem z utworzeniem użytkownika", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};