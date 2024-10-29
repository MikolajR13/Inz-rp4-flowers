import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

// Funkcja logowania
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Nieprawidłowy email lub hasło" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Nieprawidłowy email lub hasło" });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Błąd podczas logowania", error.message);
    res.status(500).json({ success: false, message: "Błąd serwera" });
  }
};
