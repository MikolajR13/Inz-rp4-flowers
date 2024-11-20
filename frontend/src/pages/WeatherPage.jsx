import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CheckBoxGroup,
  DateInput,
  Header,
  Heading,
  Text,
  RadioButtonGroup,
  Layer,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "grommet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SERVER = "http://localhost:5000";

const WeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [selectedFields, setSelectedFields] = useState([
    "temperature",
    "humidity",
    "pressure",
  ]);
  const [dateRange, setDateRange] = useState([
    new Date().toISOString().split("T")[0],
    new Date().toISOString().split("T")[0],
  ]);
  const [weatherData, setWeatherData] = useState([]);
  const [dataLimit, setDataLimit] = useState(10);
  const [expandedField, setExpandedField] = useState(null);
  const [displayType, setDisplayType] = useState("table"); // 'table' or 'chart'

  const availableFields = [
    "temperature",
    "humidity",
    "pressure",
    "uvIndex",
    "visibleLight",
    "rain",
    "gasLevel",
    "tilt",
  ];

  const chartColors = {
    temperature: "#ff7300",
    humidity: "#387908",
    pressure: "#8884d8",
    uvIndex: "#82ca9d",
    visibleLight: "#ffbb28",
    rain: "#ff8042",
    gasLevel: "#8dd1e1",
    tilt: "#a4de6c",
  };

  const fetchCurrentWeather = async () => {
    try {
      const response = await fetch(`${SERVER}/api/users/me/weather/current`);
      if (!response.ok) {
        throw new Error("Błąd przy pobieraniu najnowszej pogody");
      }
      const data = await response.json();
      setCurrentWeather(data);
    } catch (error) {
      console.error("[ERROR] Błąd podczas pobierania najnowszej pogody:", error);
    }
  };

  const simulateWeatherData = async () => {
    const startDate = new Date();
    try {
      for (let i = 0; i < 50; i++) {
        const simulatedEntry = {
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
          temperature: (Math.random() * 35).toFixed(2),
          humidity: Math.floor(Math.random() * 100),
          pressure: Math.floor(Math.random() * 40) + 960,
          uvIndex: Math.floor(Math.random() * 11),
          visibleLight: Math.floor(Math.random() * 1000),
          rain: Math.random() > 0.5,
          gasLevel: Math.floor(Math.random() * 500),
          tilt: Math.random() > 0.5,
          timestamp: new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000),
        };

        await fetch(`${SERVER}/api/users/me/weather`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(simulatedEntry),
        });
      }
      alert("Symulacja zakończona - dodano 50 wpisów pogodowych");
    } catch (error) {
      console.error("Błąd podczas symulacji danych pogodowych:", error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const query = `startDate=${dateRange[0]}&endDate=${dateRange[1]}&fields=${selectedFields.join(
        ","
      )}`;
      const response = await fetch(
        `${SERVER}/api/users/me/weather/date-range?${query}`
      );
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych pogodowych");
      }
      const data = await response.json();
      setWeatherData(data.slice(-dataLimit)); // Wyświetl ostatnie N wyników
    } catch (error) {
      console.error("[ERROR] Błąd podczas pobierania danych pogodowych:", error);
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
    const interval = setInterval(fetchCurrentWeather, 10000);
    return () => clearInterval(interval);
  }, []);

  // Odświeżanie danych po zmianie liczby danych lub zakresu dat
  useEffect(() => {
    fetchWeatherData();
  }, [dataLimit, dateRange, selectedFields]);

  const calculateTickInterval = () => {
    if (dataLimit === 10) return 2;
    if (dataLimit === 25) return 5;
    if (dataLimit === 50) return 10;
  };

  return (
    <Box pad="medium">
      <Header background="brand" pad="small">
        <Heading level="3" margin="none" color="light-1">
          Obecna Pogoda
        </Heading>
      </Header>
      <Box gap="medium" pad="medium">
        {currentWeather && (
          <Box
            background="light-2"
            pad="medium"
            round="small"
            margin={{ bottom: "medium" }}
          >
            <Heading level="4">Aktualne dane:</Heading>
            <Text>Temperatura: {currentWeather.temperature} °C</Text>
            <Text>Wilgotność: {currentWeather.humidity} %</Text>
            <Text>Ciśnienie: {currentWeather.pressure} hPa</Text>
            <Text>Światło widzialne: {currentWeather.visibleLight}</Text>
          </Box>
        )}
        <Box direction="row" gap="medium" justify="center" align="center">
          <DateInput
            format="yyyy-mm-dd"
            value={dateRange}
            onChange={({ value }) => {
              if (Array.isArray(value) && value.length === 2) {
                setDateRange(value);
              }
            }}
          />
          <Text>
            Wybrany okres: {dateRange[0]} - {dateRange[1]}
          </Text>
        </Box>
        <CheckBoxGroup
          options={availableFields}
          value={selectedFields}
          onChange={({ value }) => setSelectedFields(value)}
        />
        <Box direction="row" gap="medium" justify="center" margin={{ top: "medium" }}>
          <Button
            primary
            label="Symuluj dane pogodowe"
            onClick={simulateWeatherData}
          />
          <Button
            primary
            label="Tabela danych"
            onClick={() => setDisplayType("table")}
          />
          <Button
            primary
            label="Wykres danych"
            onClick={() => setDisplayType("chart")}
          />
        </Box>
        <Box margin={{ top: "medium" }} align="center">
          <Heading level="4" color="dark-3">
            Wybierz liczbę wyników:
          </Heading>
          <RadioButtonGroup
            name="dataLimit"
            options={[10, 25, 50]}
            value={dataLimit}
            onChange={(event) => setDataLimit(parseInt(event.target.value, 10))}
          />
        </Box>
        {displayType === "table" && (
  <Box margin={{ top: "medium" }} width="100%">
    <Heading level="4" alignSelf="center">Tabela danych:</Heading>
    <Box overflow="auto">
      <Table style={{ width: "100%", fontSize: "18px", borderCollapse: "collapse" }}>
        <TableHeader>
          <TableRow style={{ backgroundColor: "#f0f0f0" }}>
            <TableCell scope="col" style={{ fontWeight: "bold", padding: "10px", borderBottom: "2px solid #ccc" }}>
              Data
            </TableCell>
            {selectedFields.map((field) => (
              <TableCell
                key={field}
                scope="col"
                style={{
                  fontWeight: "bold",
                  padding: "10px",
                  borderBottom: "2px solid #ccc",
                  textAlign: "center",
                }}
              >
                {field}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {weatherData.map((entry, index) => (
            <TableRow
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                borderBottom: "1px solid #ddd",
              }}
            >
              <TableCell style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {new Date(entry.timestamp).toLocaleString()}
              </TableCell>
              {selectedFields.map((field) => (
                <TableCell
                  key={field}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  {entry[field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </Box>
)}
        {displayType === "chart" && (
          <Box margin={{ top: "medium" }} align="center">
            <Heading level="4" color="dark-3">
              Wykresy danych:
            </Heading>
            <Box direction="row" wrap gap="medium" justify="center">
              {selectedFields.map((field) => (
                <Box
                  key={field}
                  pad="small"
                  border={{ color: "light-3", size: "xsmall" }}
                  width="45%"
                  onClick={() => setExpandedField(field)}
                >
                  {weatherData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={weatherData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(tick) =>
                            new Date(tick).toLocaleString()
                          }
                          interval={calculateTickInterval()}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={field}
                          stroke={chartColors[field]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Text>Brak danych do wyświetlenia</Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
      {expandedField && (
        <Layer
          onEsc={() => setExpandedField(null)}
          onClickOutside={() => setExpandedField(null)}
        >
          <Box pad="large" align="center">
            <Heading level="3">{expandedField}</Heading>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(tick) =>
                    new Date(tick).toLocaleString()
                  }
                  interval={calculateTickInterval()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={expandedField}
                  stroke={chartColors[expandedField]}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Layer>
      )}
    </Box>
  );
};

export default WeatherPage;
