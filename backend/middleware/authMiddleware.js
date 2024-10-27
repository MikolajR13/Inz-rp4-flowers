import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    // Logowanie nagłówka Authorization
    console.log('Nagłówek Authorization:', authHeader);
    
    if (!authHeader) {
        console.log('Brak nagłówka Authorization - brak tokena.');
        return res.status(401).json({ success: false, message: 'Brak tokena, autoryzacja odmówiona' });
    }

    const token = authHeader.split(' ')[1];

    // Logowanie wyodrębnionego tokena
    console.log('Wyodrębniony token:', token);

    if (!token) {
        console.log('Brak tokena po podziale nagłówka Authorization.');
        return res.status(401).json({ success: false, message: 'Brak tokena, autoryzacja odmówiona' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Logowanie zdekodowanego tokena
        console.log('Zdekodowany token:', decoded);
        
        req.userId = decoded.id;
        console.log('userId', decoded.id); 
        next();
    } catch (error) {
        console.log('Błąd weryfikacji tokena:', error.message);
        res.status(401).json({ success: false, message: 'Nieprawidłowy token' });
    }
};
