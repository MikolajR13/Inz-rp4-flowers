import User from "../models/User.js"
import mongoose from "mongoose";

export const getUser = async (req, res) =>{
    try{
        const users = await User.find({});
        res.status(200).json({ success: true, data: users});

    } catch (error){
        console.log("błąd pobierania użytkowników", error.message);
        res.status(500).json({ success: false, message: "Server error"});

    }
}

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
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({success: true, message: `User with id: ${id} deleted`})
        
    } catch(error) {
        console.log("Nie można usunąć użytkownika", error.message);
        res.status(404).json({success: false, message: `User with id: ${id} not found`})
        
    }
}

export const createUser = async (req, res) => {
    const user = req.body; // 

    if(!user.firstName || !user.lastName || !user.email || !user.passwordHash){
        return res.status(400).json({ success:false, message: "Proszę wypełnić wszystkie dane"});
    }

    const newUser = new User(user);

    try {
        await newUser.save();
        res.status(201).json({ success: true, data: newUser});
    } catch(error) {
            console.error("Problem z utworzeniem użytkownika", error.message);
            res.status(500).json( { success: false, message:"Server Error"});
        }
}