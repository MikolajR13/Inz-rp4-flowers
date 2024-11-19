import mqtt from 'mqtt';
import Pot from './models/Pot.js';
import User from './models/User.js';
import Weather from './models/Weather.js';
import { addWateringHistoryForMqtt } from './controllers/wateringHistory.controller.js';

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

const responsePromises = {
  watering: new Map(),
  soilMoisture: new Map(),
  weather: new Map(),
};

// Subskrypcje MQTT
client.on('connect', async () => {
  console.log('MQTT connected');
  client.subscribe('user/+/pot/+/wateringResponse');
  client.subscribe('user/+/pot/+/soilMoistureResponse');
  client.subscribe('user/+/weatherResponse');
});

// Obsługa wiadomości MQTT
client.on('message', async (topic, message) => {
  const [_, userId, section, potId, type] = topic.split('/');
  const data = JSON.parse(message.toString());

  try {
    if (section === 'pot' && type === 'wateringResponse') {
      const { waterAmount, soilMoisture } = data;

      if (responsePromises.watering.has(potId)) {
        responsePromises.watering.get(potId).resolve(data);
        responsePromises.watering.delete(potId);
      }

      console.log(`[DEBUG] Otrzymano odpowiedź na podlewanie doniczki ${potId}. Woda: ${waterAmount} ml, Wilgotność gleby: ${soilMoisture}`);
      await addWateringHistoryForMqtt(potId, waterAmount, soilMoisture);

    } else if (section === 'pot' && type === 'soilMoistureResponse') {
      const { soilMoisture } = data;

      if (responsePromises.soilMoisture.has(potId)) {
        responsePromises.soilMoisture.get(potId).resolve(data);
        responsePromises.soilMoisture.delete(potId);
      }

      console.log(`[DEBUG] Otrzymano odpowiedź o wilgotności gleby dla doniczki ${potId}. Wilgotność: ${soilMoisture}`);
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

      if (responsePromises.weather.has(userId)) {
        responsePromises.weather.get(userId).resolve(data);
        responsePromises.weather.delete(userId);
      }

      console.log(`[DEBUG] Dane pogodowe użytkownika ${userId} odebrane`, data);

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
      console.log(`[DEBUG] Dane pogodowe zapisane dla użytkownika ${userId}`);
    }
  } catch (error) {
    console.error(`[ERROR] Błąd przetwarzania wiadomości MQTT:`, error);
  }
});


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

// Funkcja wysyłania żądań
export const fetchWeatherData = async () => {
  try {
    console.log(`[DEBUG] Rozpoczynanie zbierania danych pogodowych...`);
    const users = await User.find();

    const promises = users.map(user => {
      return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Wysyłanie żądania o dane pogodowe dla użytkownika ${user._id}`);
        responsePromises.weather.set(user._id, { resolve, reject });

        client.publish(`user/${user._id}/weatherRequest`, JSON.stringify({ request: "fetchWeather" }));

        setTimeout(() => {
          if (responsePromises.weather.has(user._id)) {
            responsePromises.weather.get(user._id).reject(new Error(`Timeout: Brak odpowiedzi na dane pogodowe dla użytkownika ${user._id}`));
            responsePromises.weather.delete(user._id);
          }
        }, 10000); // Timeout 10 sekund
      });
    });

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[ERROR] Brak odpowiedzi dla użytkownika ${users[index]._id}: ${result.reason}`);
      } else {
        console.log(`[DEBUG] Odpowiedź dla użytkownika ${users[index]._id}:`, result.value);
      }
    });

    console.log(`[DEBUG] Wszystkie żądania pogodowe zostały przetworzone.`);
  } catch (error) {
    console.error(`[ERROR] Błąd przy zbieraniu danych pogodowych:`, error);
  }
};

// Funkcja do sprawdzania harmonogramu podlewania
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
        requestWatering(pot.userId, pot._id, pot.waterAmount).catch(err => {
          console.error(`[ERROR] Błąd podczas automatycznego podlewania doniczki ${pot._id}:`, err);
        });
      }
    });
  } catch (error) {
    console.error(`[ERROR] Błąd przy sprawdzaniu harmonogramu podlewania:`, error);
  }
};

export default client;
