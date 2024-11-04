import mqtt from 'mqtt';
import Pot from './models/Pot.js';
import User from './models/User.js';
import { addWateringHistoryForMqtt } from './controllers/wateringHistory.controller.js';

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

client.on('connect', () => {
  console.log('MQTT connected');
  client.subscribe('user/+/pot/+/watering'); // Subskrypcja na temat podlewania
  client.subscribe('user/+/pot/+/soilMoisture'); // Subskrypcja na temat wilgotności gleby
});

client.on('message', async (topic, message) => {
  const [_, userId, __, potId, type] = topic.split('/');
  const data = JSON.parse(message.toString());

  if (type === 'watering') {
    const { waterAmount, soilMoisture } = data;
    console.log(`[DEBUG] Odebrano wiadomość MQTT dla podlewania doniczki ${potId} użytkownika ${userId}: Ilość wody = ${waterAmount}, Wilgotność gleby = ${soilMoisture}`);
    await addWateringHistoryForMqtt(potId, waterAmount, soilMoisture);
  } else if (type === 'soilMoisture') {
    const { soilMoisture } = data;
    console.log(`[DEBUG] Odebrano wiadomość MQTT o wilgotności gleby dla doniczki ${potId} użytkownika ${userId}: Wilgotność gleby = ${soilMoisture}`);
    await addWateringHistoryForMqtt(potId, null, soilMoisture);
  }
});

// Funkcja do wysyłania żądania podlewania
export const requestWatering = (userId, potId, waterAmount) => {
  console.log(`[DEBUG] Wysyłanie żądania podlewania dla doniczki ${potId} użytkownika ${userId} z ilością wody: ${waterAmount} ml`);
  client.publish(`user/${userId}/pot/${potId}/watering`, JSON.stringify({ waterAmount }));
};

// Funkcja do wysyłania żądania o sprawdzenie wilgotności gleby
export const requestSoilMoistureCheck = (userId, potId) => {
  console.log(`[DEBUG] Wysyłanie żądania o sprawdzenie wilgotności gleby dla doniczki ${potId} użytkownika ${userId}`);
  client.publish(`user/${userId}/pot/${potId}/soilMoistureRequest`, JSON.stringify({ request: "checkSoilMoisture" }));
};

export const sendPotListToUser = async (userId) => {
  try {
    const user = await User.findById(userId).populate('pots');
    if (!user) {
      console.error("Nie znaleziono użytkownika o ID:", userId);
      return;
    }

    const potIds = user.pots.map(pot => pot._id.toString());
    const message = `Cześć, twoje doniczki to te, które mają Id: ${potIds.join(', ')}`;
    client.publish(`user/${userId}/pots`, message);
    console.log(`Wysłano wiadomość MQTT z listą doniczek do użytkownika ${userId}: ${message}`);
  } catch (error) {
    console.error("Błąd wysyłania listy doniczek do użytkownika:", error);
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

export default client;
