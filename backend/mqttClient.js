import mqtt from 'mqtt';
import Pot from './models/Pot.js';
import User from './models/User.js';
import Weather from './models/Weather.js';
import { addWateringHistoryForMqtt } from './controllers/wateringHistory.controller.js';

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

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

      console.log(`[DEBUG] Otrzymano odpowiedź na podlewanie doniczki ${potId}. Woda: ${waterAmount} ml, Wilgotność gleby: ${soilMoisture}`);
      await addWateringHistoryForMqtt(potId, waterAmount, soilMoisture);

    } else if (section === 'pot' && type === 'soilMoistureResponse') {
      const { soilMoisture } = data;

      console.log(`[DEBUG] Otrzymano odpowiedź o wilgotności gleby dla doniczki ${potId}. Wilgotność: ${soilMoisture}`);
      await addWateringHistoryForMqtt(potId, null, soilMoisture);

    } else if (type === 'weatherResponse') {
      const {
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
      } = data;

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

// Funkcja do wysyłania żądania pogodowego dla jednego użytkownika
export const requestWeatherDataForUser = (userId) => {
  console.log(`[DEBUG] Wysyłanie żądania o dane pogodowe dla użytkownika ${userId}`);
  const topic = `user/${userId}/weatherRequest`;

  // Publikowanie żądania na temat
  client.publish(topic, JSON.stringify({ request: "fetchWeather" }));
};

// Funkcja do zbierania danych pogodowych dla wszystkich użytkowników
export const collectWeatherDataForAllUsers = async () => {
  try {
    console.log(`[DEBUG] Rozpoczynanie zbierania danych pogodowych...`);
    const users = await User.find();

    for (const user of users) {
      console.log(`[DEBUG] Wysyłanie żądania o dane pogodowe dla użytkownika ${user._id}`);
      const topic = `user/${user._id}/weatherRequest`;

      client.publish(topic, JSON.stringify({ request: "fetchWeather" }));
    }

    console.log(`[DEBUG] Zbieranie danych pogodowych zakończone.`);
  } catch (error) {
    console.error(`[ERROR] Błąd podczas zbierania danych pogodowych:`, error);
  }
};

// Funkcja do wysyłania żądania podlewania
export const requestWatering = (userId, potId, waterAmount) => {
  console.log(`[DEBUG] Wysyłanie żądania podlewania dla doniczki ${potId} użytkownika ${userId} z ilością wody: ${waterAmount} ml`);
  const topic = `user/${userId}/pot/${potId}/watering`;

  client.publish(topic, JSON.stringify({ waterAmount }));
};

// Funkcja do wysyłania żądania o sprawdzenie wilgotności gleby
export const requestSoilMoistureCheck = (userId, potId) => {
  console.log(`[DEBUG] Wysyłanie żądania o sprawdzenie wilgotności gleby dla doniczki ${potId} użytkownika ${userId}`);
  const topic = `user/${userId}/pot/${potId}/soilMoistureRequest`;

  client.publish(topic, JSON.stringify({ request: "checkSoilMoisture" }));
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

// Funkcja sprawdzająca, czy minął czas podlewania dla każdej doniczki
export const checkAndWaterPots = async () => {
  try {
    const pots = await Pot.find();

    for (const pot of pots) {
      const now = new Date();
      const lastWatering = pot.wateringHistory.length > 0 
        ? new Date(pot.wateringHistory[pot.wateringHistory.length - 1].date) 
        : new Date(0);

      const intervalInMs = pot.wateringFrequency * 60 * 60 * 1000;
      const timeSinceLastWatering = now - lastWatering;

      console.log(`[DEBUG] Sprawdzanie doniczki ${pot._id}: Czas od ostatniego podlewania = ${timeSinceLastWatering / 60000} minut, Wymagany odstęp = ${intervalInMs / 60000} minut`);

      if (timeSinceLastWatering >= intervalInMs) {
        console.log(`[DEBUG] Automatyczne podlewanie doniczki ${pot._id} z ilością wody: ${pot.waterAmount} ml`);
        try {
          requestWatering(pot.userId, pot._id, pot.waterAmount);
        } catch (err) {
          console.error(`[ERROR] Błąd podczas automatycznego podlewania doniczki ${pot._id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("[ERROR] Błąd przy sprawdzaniu harmonogramu podlewania:", error);
  }
};

export default client;
