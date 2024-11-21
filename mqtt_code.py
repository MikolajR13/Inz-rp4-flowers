import json
import requests
from paho.mqtt.client import Client

# Stała userId
USER_ID = "HEHE_NIE"

# Klucz API OpenWeatherMap
API_KEY = "HEHE_RÓWNIEŻ_NIE"
DEFAULT_LAT = 51.107885
DEFAULT_LON = 17.038538

pot_ids = []

def handle_pot_list(message):
    global pot_ids
    received_pots = message.split(": ")[1].split(", ")

    for pot in received_pots:
        if pot not in pot_ids:
            pot_ids.append(pot)

    for pot in pot_ids.copy():
        if pot not in received_pots:
            pot_ids.remove(pot)

    pot_ids.sort(key=lambda p: received_pots.index(p))
    print(f"[DEBUG] Zaktualizowana lista doniczek: {pot_ids}")

def handle_soil_moisture_check(pot_id):
    print(f"[DEBUG] Symulacja odpowiedzi o wilgotności gleby dla doniczki {pot_id}")
    response = {"soilMoisture": 55}  # Symulowana odpowiedź
    mqtt_client.publish(f"pot/{pot_id}/soilMoistureResponse", json.dumps(response))
    print(f"[DEBUG] Odpowiedź wilgotności gleby wysłana: {response}")

def handle_watering(pot_id, water_amount):
    print(f"[DEBUG] Symulacja podlewania doniczki {pot_id} z ilością wody {water_amount} ml")
    handle_soil_moisture_check(pot_id)  # Wywołanie sprawdzenia wilgotności gleby
    response = {"waterAmount": water_amount, "soilMoisture": 55}  # Symulowana odpowiedź
    mqtt_client.publish(f"pot/{pot_id}/wateringResponse", json.dumps(response))
    print(f"[DEBUG] Odpowiedź podlewania wysłana: {response}")

def fetch_weather_from_api(lat, lon):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Błąd podczas pobierania danych z API OpenWeatherMap: {e}")
        return None

def handle_weather_data(user_id):
    if user_id != USER_ID:
        print(f"[DEBUG] Ignorowanie żądania o pogodę dla userId {user_id}, ponieważ nie zgadza się z naszym USER_ID")
        return

    lat = DEFAULT_LAT
    lon = DEFAULT_LON

    # Pobieranie danych z API
    weather_data = fetch_weather_from_api(lat, lon)

    response = {
        "latitude": lat,
        "longitude": lon,
        "temperature": 20.5,
        "humidity": 65,
        "pressure": 1013,
        "uvIndex": 3,
        "visibleLight": 250,
        "rain": 0,
        "gasLevel": 5,
        "tilt": 0,
    }

    if weather_data:
        response.update({
            "temperature": weather_data["main"]["temp"],
            "humidity": weather_data["main"]["humidity"],
            "pressure": weather_data["main"]["pressure"],
            "rain": weather_data["rain"]["1h"] if "rain" in weather_data and "1h" in weather_data["rain"] else 0,
        })

    mqtt_client.publish(f"user/{user_id}/weatherResponse", json.dumps(response))
    print(f"[DEBUG] Dane pogodowe wysłane dla userId {user_id}: {response}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode("utf-8")
    print(f"[DEBUG] Otrzymano wiadomość: {payload} na temacie: {topic}")

    if topic.startswith("pot/") and topic.endswith("/soilMoistureRequest"):
        pot_id = topic.split("/")[1]
        handle_soil_moisture_check(pot_id)
    elif topic.startswith("pot/") and topic.endswith("/watering"):
        pot_id = topic.split("/")[1]
        water_amount = int(json.loads(payload).get("waterAmount", 0))
        handle_watering(pot_id, water_amount)
    elif topic.startswith("user/") and topic.endswith("/weatherRequest"):
        user_id = topic.split("/")[1]
        handle_weather_data(user_id)
    elif topic.startswith("user/") and topic.endswith("/pots"):
        handle_pot_list(payload)

mqtt_client = Client()
mqtt_client.on_message = on_message

mqtt_client.connect("flowersmanager.pl", 1883, 60)  
mqtt_client.subscribe("pot/+/soilMoistureRequest")  
mqtt_client.subscribe("pot/+/watering")  
mqtt_client.subscribe(f"user/{USER_ID}/weatherRequest")  
mqtt_client.subscribe(f"user/{USER_ID}/pots") 
print("[DEBUG] Uruchomiono klienta MQTT. Oczekiwanie na wiadomości...")
mqtt_client.loop_forever()