import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Brak tokena, autoryzacja odmówiona' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next(); // Przekazujemy do następnej funkcji jeśli token jest poprawny
    } catch (error) {
        res.status(401).json({ success: false, message: 'Nieprawidłowy token' });
    }
};
