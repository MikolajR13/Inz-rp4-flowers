import mqtt from 'mqtt';
import Pot from './models/Pot.js';
import User from './models/User.js';
import Weather from './models/Weather.js'; // Import modelu pogody
import { addWateringHistoryForMqtt } from './controllers/wateringHistory.controller.js';

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

// Mapy do przechowywania obietnic dla poszczególnych żądań
const responsePromises = {
  watering: new Map(),
  soilMoisture: new Map(),
  weather: new Map(),
};

// Subskrypcje MQTT
client.on('connect', async () => {
  console.log('MQTT connected');
  client.subscribe('user/+/pot/+/wateringResponse'); // Subskrypcja na temat podlewania
  client.subscribe('user/+/pot/+/soilMoistureResponse'); // Subskrypcja na temat wilgotności gleby
  client.subscribe('user/+/weatherResponse'); // Subskrypcja na dane pogodowe
});

// Obsługa wiadomości MQTT
client.on('message', async (topic, message) => {
  const [_, userId, section, potId, type] = topic.split('/');
  const data = JSON.parse(message.toString());

  try {
    if (section === 'pot' && type === 'wateringResponse') {
      const { waterAmount, soilMoisture } = data;

      // Obsługa odpowiedzi MQTT dla podlewania
      if (responsePromises.watering.has(potId)) {
        responsePromises.watering.get(potId).resolve(data);
        responsePromises.watering.delete(potId);
      }

      console.log(`[DEBUG] MQTT: Otrzymano odpowiedź na podlewanie doniczki ${potId} użytkownika ${userId}. Woda: ${waterAmount} ml, Wilgotność gleby: ${soilMoisture}`);
      await addWateringHistoryForMqtt(potId, waterAmount, soilMoisture);

    } else if (section === 'pot' && type === 'soilMoistureResponse') {
      const { soilMoisture } = data;

      // Obsługa odpowiedzi MQTT dla wilgotności gleby
      if (responsePromises.soilMoisture.has(potId)) {
        responsePromises.soilMoisture.get(potId).resolve(data);
        responsePromises.soilMoisture.delete(potId);
      }

      console.log(`[DEBUG] MQTT: Otrzymano odpowiedź o wilgotności gleby dla doniczki ${potId} użytkownika ${userId}. Wilgotność: ${soilMoisture}`);
      await addWateringHistoryForMqtt(potId, null, soilMoisture);

    } else if (type === 'weatherResponse') {
      const {
        temperature,
        humidity,
        pressure,
        uvIndex,
        visibleLight,
        rain,
        gasLevel,
        tilt,
        latitude,
        longitude
      } = data;

      // Obsługa odpowiedzi MQTT dla danych pogodowych
      if (responsePromises.weather.has(userId)) {
        responsePromises.weather.get(userId).resolve(data);
        responsePromises.weather.delete(userId);
      }

      console.log(`[DEBUG] MQTT: Dane pogodowe użytkownika ${userId} odebrane`, data);

      const weatherEntry = new Weather({
        latitude,
        longitude,
        temperature,
        humidity,
        pressure,
        uvIndex,
        visibleLight,
        rain,
        gasLevel,
        tilt,
        timestamp: new Date(),
      });

      await weatherEntry.save();
      console.log(`[DEBUG] MQTT: Dane pogodowe zapisane dla użytkownika ${userId}`);
    }
  } catch (error) {
    console.error(`[ERROR] Błąd przetwarzania wiadomości MQTT:`, error);
  }
});

// Funkcja do wysyłania żądania podlewania z oczekiwaniem na odpowiedź
export const requestWatering = (userId, potId, waterAmount) => {
  return new Promise((resolve, reject) => {
    console.log(`[DEBUG] Wysyłanie żądania podlewania dla doniczki ${potId} użytkownika ${userId} z ilością wody: ${waterAmount} ml`);
    responsePromises.watering.set(potId, { resolve, reject });

    client.publish(`user/${userId}/pot/${potId}/watering`, JSON.stringify({ waterAmount }));

    setTimeout(() => {
      if (responsePromises.watering.has(potId)) {
        responsePromises.watering.get(potId).reject(new Error('Timeout: Brak odpowiedzi na podlewanie'));
        responsePromises.watering.delete(potId);
      }
    }, 10000); // Timeout 10 sekund
  });
};

// Funkcja do wysyłania żądania o sprawdzenie wilgotności gleby z oczekiwaniem na odpowiedź
export const requestSoilMoistureCheck = (userId, potId) => {
  return new Promise((resolve, reject) => {
    console.log(`[DEBUG] Wysyłanie żądania o sprawdzenie wilgotności gleby dla doniczki ${potId} użytkownika ${userId}`);
    responsePromises.soilMoisture.set(potId, { resolve, reject });

    client.publish(`user/${userId}/pot/${potId}/soilMoistureRequest`, JSON.stringify({ request: "checkSoilMoisture" }));

    setTimeout(() => {
      if (responsePromises.soilMoisture.has(potId)) {
        responsePromises.soilMoisture.get(potId).reject(new Error('Timeout: Brak odpowiedzi na sprawdzenie wilgotności gleby'));
        responsePromises.soilMoisture.delete(potId);
      }
    }, 10000); // Timeout 10 sekund
  });
};

// Funkcja do wysyłania listy doniczek użytkownika
export const sendPotListToUser = async (userId) => {
  try {
    const user = await User.findById(userId).populate('pots'); // Pobierz użytkownika i jego doniczki
    if (!user) {
      console.error(`Nie znaleziono użytkownika o ID: ${userId}`);
      return;
    }

    const potIds = user.pots.map(pot => pot._id.toString()); // Mapowanie ID doniczek
    const message = `Cześć, twoje doniczki to te, które mają Id: ${potIds.join(', ')}`;
    client.publish(`user/${userId}/pots`, message); // Publikowanie wiadomości MQTT
    console.log(`Wysłano wiadomość MQTT z listą doniczek do użytkownika ${userId}: ${message}`);
  } catch (error) {
    console.error(`Błąd wysyłania listy doniczek do użytkownika ${userId}:`, error);
  }
};

// Funkcja sprawdzająca, czy minął czas podlewania dla każdej doniczki
export const checkAndWaterPots = async () => {
  try {
    const pots = await Pot.find();

    pots.forEach(pot => {
      const now = new Date();
      const lastWatering = pot.wateringHistory.length > 0 
        ? new Date(pot.wateringHistory[pot.wateringHistory.length - 1].date) 
        : new Date(0);

      const intervalInMs = pot.wateringFrequency * 60 * 60 * 1000;
      const timeSinceLastWatering = now - lastWatering;

      console.log(`[DEBUG] Sprawdzanie doniczki ${pot._id}: Czas od ostatniego podlewania = ${timeSinceLastWatering / 60000} minut, Wymagany odstęp = ${intervalInMs / 60000} minut`);

      if (timeSinceLastWatering >= intervalInMs) {
        console.log(`[DEBUG] Automatyczne podlewanie doniczki ${pot._id} z ilością wody: ${pot.waterAmount} ml`);
        requestWatering(pot.userId, pot._id, pot.waterAmount); // Przekazujemy `userId` i `potId`
      }
    });
  } catch (error) {
    console.error("Błąd przy sprawdzaniu harmonogramu podlewania:", error);
  }
};

// Funkcja do zbierania danych pogodowych
export const fetchWeatherData = async () => {
  try {
    console.log(`[DEBUG] Rozpoczynanie zbierania danych pogodowych...`);
    const users = await User.find(); // Pobierz wszystkich użytkowników

    const promises = users.map(user => {
      return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Wysyłanie żądania o dane pogodowe dla użytkownika ${user._id}`);
        responsePromises.weather.set(user._id, { resolve, reject });

        client.publish(`user/${user._id}/weatherRequest`, JSON.stringify({ request: "fetchWeather" }));

        setTimeout(() => {
          if (responsePromises.weather.has(user._id)) {
            responsePromises.weather.get(user._id).reject(new Error('Timeout: Brak odpowiedzi na dane pogodowe'));
            responsePromises.weather.delete(user._id);
          }
        }, 10000); // Timeout 10 sekund
      });
    });

    await Promise.all(promises); // Czekaj na wszystkie odpowiedzi
    console.log(`[DEBUG] Wszystkie dane pogodowe zostały odebrane.`);
  } catch (error) {
    console.error(`[ERROR] Błąd przy zbieraniu danych pogodowych:`, error);
  }
};

export default client;
