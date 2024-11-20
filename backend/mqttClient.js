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
  console.log('[DEBUG] MQTT connected');
  client.subscribe('user/+/pot/+/wateringResponse'); // Subskrypcja na odpowiedzi dla podlewania
  client.subscribe('user/+/pot/+/soilMoistureResponse'); // Subskrypcja na odpowiedzi dla wilgotności gleby
  client.subscribe('user/+/weatherResponse'); // Subskrypcja na dane pogodowe
});

// Obsługa wiadomości MQTT
client.on('message', async (topic, message) => {
  const [_, userId, section, potId, type] = topic.split('/');
  const data = JSON.parse(message.toString());

  console.log(`[DEBUG] Otrzymano wiadomość na temacie ${topic} z danymi:`, data);

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
        longitude,
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

      console.log(`[DEBUG] Zapisywanie danych pogodowych dla użytkownika ${userId}...`);
      await weatherEntry.save();
      console.log(`[DEBUG] Dane pogodowe zapisane w bazie dla użytkownika ${userId}`);
    }
  } catch (error) {
    console.error(`[ERROR] Błąd przetwarzania wiadomości MQTT:`, error);
  }
});

// Funkcja do wysyłania żądania podlewania
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
    }, 40000); // Timeout 40 sekund
  });
};

// Funkcja do wysyłania żądania o sprawdzenie wilgotności gleby
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
    }, 40000); // Timeout 40 sekund
  });
};

// Funkcja do wysyłania listy doniczek użytkownika
export const sendPotListToUser = async (userId) => {
  try {
    const user = await User.findById(userId).populate('pots');
    if (!user) {
      console.error(`[ERROR] Nie znaleziono użytkownika o ID: ${userId}`);
      return;
    }

    const potIds = user.pots.map(pot => pot._id.toString());
    const message = `Cześć, twoje doniczki to te, które mają Id: ${potIds.join(', ')}`;
    client.publish(`user/${userId}/pots`, message);

    console.log(`[DEBUG] Wysłano wiadomość MQTT z listą doniczek do użytkownika ${userId}: ${message}`);
  } catch (error) {
    console.error(`[ERROR] Błąd wysyłania listy doniczek do użytkownika ${userId}:`, error);
  }
};

// Funkcja do zbierania danych pogodowych
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
            responsePromises.weather.get(user._id).reject(new Error('Timeout: Brak odpowiedzi na dane pogodowe'));
            responsePromises.weather.delete(user._id);
          }
        }, 40000); // Timeout 40 sekund
      });
    });

    const results = await Promise.allSettled(promises);

    for (const [index, result] of results.entries()) {
      const userId = users[index]._id;
      if (result.status === 'rejected') {
        console.error(`[ERROR] Brak odpowiedzi dla użytkownika ${userId}: ${result.reason}`);
      } else {
        console.log(`[DEBUG] Odpowiedź dla użytkownika ${userId}:`, result.value);

        const weatherData = result.value;
        const weatherEntry = new Weather({
          latitude: weatherData.latitude,
          longitude: weatherData.longitude,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          pressure: weatherData.pressure,
          uvIndex: weatherData.uvIndex,
          visibleLight: weatherData.visibleLight,
          rain: weatherData.rain,
          gasLevel: weatherData.gasLevel,
          tilt: weatherData.tilt,
          timestamp: new Date(),
        });

        console.log(`[DEBUG] Zapisywanie danych pogodowych dla użytkownika ${userId}...`);
        await weatherEntry.save();
        console.log(`[DEBUG] Dane pogodowe zapisane w bazie dla użytkownika ${userId}`);
      }
    }

    console.log(`[DEBUG] Wszystkie żądania pogodowe zostały przetworzone.`);
  } catch (error) {
    console.error(`[ERROR] Błąd przy zbieraniu danych pogodowych:`, error);
  }
};

export default client;
