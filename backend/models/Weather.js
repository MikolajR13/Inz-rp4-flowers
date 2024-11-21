import mongoose from 'mongoose';

const WeatherSchema = new mongoose.Schema({
    latitude: { type: Number, required: true }, // Szerokość geograficzna
    longitude: { type: Number, required: true }, // Długość geograficzna
    temperature: { type: Number }, // Temperatura w stopniach Celsjusza
    humidity: { type: Number }, // Wilgotność w %
    pressure: { type: Number }, // Ciśnienie w hPa
    uvIndex: { type: Number }, // Indeks UV
    visibleLight: { type: Number }, // Światło widzialne
    rain: { type: Boolean }, // Opady deszczu
    gasLevel: { type: Number }, // Wykrycie gazu
    tilt: { type: Boolean }, // Wstrząsy/pochylenie
    timestamp: { type: Date, default: Date.now }, // Data i czas zapisu
});

export default mongoose.model('Weather', WeatherSchema);
