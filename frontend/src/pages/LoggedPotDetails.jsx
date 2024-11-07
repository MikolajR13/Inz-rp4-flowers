import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, Card, CardBody } from 'grommet';
import { useParams, useNavigate } from 'react-router-dom';

const SERVER = process.env.REACT_APP_SERVER;

const LoggedPotDetails = () => {
  const { potId } = useParams();
  const [potDetails, setPotDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPotDetails = async () => {
      try {
        const response = await fetch(`${SERVER}/api/users/me/pots/${potId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setPotDetails(data.data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania szczegółów doniczki:', error);
      }
    };

    fetchPotDetails();
  }, [potId]);

  const simulateWateringHistory = async () => {
    const startDate = new Date();
    try {
      for (let i = 0; i < 50; i++) {
        const simulatedEntry = {
          waterAmount: Math.floor(Math.random() * 500) + 100, 
          soilMoisture: Math.floor(Math.random() * 100), 
          date: new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
        };

        await fetch(`${SERVER}/api/users/me/pots/${potId}/watering`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simulatedEntry)
        });
      }
      alert('Symulacja zakończona - dodano 50 wpisów');
    } catch (error) {
      console.error('Błąd podczas dodawania wpisów do historii podlewania:', error);
    }
  };

  return (
    <Box fill align="center" justify="start" pad="medium" background="light-2">
      {potDetails ? (
        <Card width="large" background="light-1" pad="medium" round="small" elevation="small">
          <CardBody align="center">
            <Heading level="2" margin={{ bottom: 'small' }}>{potDetails.potName}</Heading>
            <Text size="medium" margin={{ bottom: 'small' }}>Kwiat: {potDetails.flowerName}</Text>
            <Text size="small" margin={{ bottom: 'small' }}>Rozmiar: {potDetails.potSize}</Text>
            <Text size="small" margin={{ bottom: 'small' }}>Kształt: {potDetails.shape === 'cuboid' ? 'Prostopadłościan' : 'Walec'}</Text>
            <Text size="small" margin={{ bottom: 'small' }}>Wysokość: {potDetails.dimensions.height} cm</Text>
            {potDetails.shape === 'cuboid' && (
              <>
                <Text size="small" margin={{ bottom: 'small' }}>Szerokość: {potDetails.dimensions.width} cm</Text>
                <Text size="small" margin={{ bottom: 'small' }}>Głębokość: {potDetails.dimensions.depth} cm</Text>
              </>
            )}
            {potDetails.shape === 'cylinder' && (
              <Text size="small" margin={{ bottom: 'small' }}>Średnica: {potDetails.dimensions.diameter} cm</Text>
            )}
            <Text size="small" margin={{ bottom: 'small' }}>Częstotliwość podlewania: {potDetails.wateringFrequency} dni</Text>
            <Text size="small" margin={{ bottom: 'small' }}>Ilość wody: {potDetails.waterAmount} ml</Text>

            {potDetails.plantSpecifications && (
              <>
                <Heading level="3" margin={{ top: 'medium', bottom: 'small' }}>Specyfika Gatunku</Heading>
                {potDetails.plantSpecifications.commonName && (
                  <Text size="small" margin={{ bottom: 'small' }}>Nazwa zwyczajowa: {potDetails.plantSpecifications.commonName}</Text>
                )}
                {potDetails.plantSpecifications.ligneousType && (
                  <Text size="small" margin={{ bottom: 'small' }}>Typ drzewa: {potDetails.plantSpecifications.ligneousType}</Text>
                )}
                {potDetails.plantSpecifications.growthForm && (
                  <Text size="small" margin={{ bottom: 'small' }}>Forma wzrostu: {potDetails.plantSpecifications.growthForm}</Text>
                )}
                {potDetails.plantSpecifications.growthHabit && (
                  <Text size="small" margin={{ bottom: 'small' }}>Nawyk wzrostu: {potDetails.plantSpecifications.growthHabit}</Text>
                )}
                {potDetails.plantSpecifications.growthRate && (
                  <Text size="small" margin={{ bottom: 'small' }}>Tempo wzrostu: {potDetails.plantSpecifications.growthRate}</Text>
                )}
                {potDetails.plantSpecifications.averageHeight && (
                  <Text size="small" margin={{ bottom: 'small' }}>Średnia wysokość: {potDetails.plantSpecifications.averageHeight}</Text>
                )}
                {potDetails.plantSpecifications.maximumHeight && (
                  <Text size="small" margin={{ bottom: 'small' }}>Maksymalna wysokość: {potDetails.plantSpecifications.maximumHeight}</Text>
                )}
                {potDetails.plantSpecifications.shapeAndOrientation && (
                  <Text size="small" margin={{ bottom: 'small' }}>Orientacja: {potDetails.plantSpecifications.shapeAndOrientation}</Text>
                )}
                {potDetails.plantSpecifications.toxicity && (
                  <Text size="small" margin={{ bottom: 'small' }}>Toksyczność: {potDetails.plantSpecifications.toxicity}</Text>
                )}
                {potDetails.plantSpecifications.daysToHarvest && (
                  <Text size="small" margin={{ bottom: 'small' }}>Dni do zbioru: {potDetails.plantSpecifications.daysToHarvest}</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.phMin && (
                  <Text size="small" margin={{ bottom: 'small' }}>Minimalne pH gleby: {potDetails.plantSpecifications.soilRequirements.phMin}</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.phMax && (
                  <Text size="small" margin={{ bottom: 'small' }}>Maksymalne pH gleby: {potDetails.plantSpecifications.soilRequirements.phMax}</Text>
                )}
                {potDetails.plantSpecifications.lightRequirements && (
                  <Text size="small" margin={{ bottom: 'small' }}>Wymagania dotyczące światła: {potDetails.plantSpecifications.lightRequirements}</Text>
                )}
                {potDetails.plantSpecifications.atmosphericHumidity && (
                  <Text size="small" margin={{ bottom: 'small' }}>Wilgotność powietrza: {potDetails.plantSpecifications.atmosphericHumidity}</Text>
                )}
                {potDetails.plantSpecifications.growthMonths && (
                  <Text size="small" margin={{ bottom: 'small' }}>Miesiące wzrostu: {potDetails.plantSpecifications.growthMonths}</Text>
                )}
                {potDetails.plantSpecifications.bloomMonths && (
                  <Text size="small" margin={{ bottom: 'small' }}>Miesiące kwitnienia: {potDetails.plantSpecifications.bloomMonths}</Text>
                )}
                {potDetails.plantSpecifications.fruitMonths && (
                  <Text size="small" margin={{ bottom: 'small' }}>Miesiące owocowania: {potDetails.plantSpecifications.fruitMonths}</Text>
                )}
                {potDetails.plantSpecifications.precipitation?.min && (
                  <Text size="small" margin={{ bottom: 'small' }}>Minimalne opady: {potDetails.plantSpecifications.precipitation.min} mm</Text>
                )}
                {potDetails.plantSpecifications.precipitation?.max && (
                  <Text size="small" margin={{ bottom: 'small' }}>Maksymalne opady: {potDetails.plantSpecifications.precipitation.max} mm</Text>
                )}
                {potDetails.plantSpecifications.temperature?.min && (
                  <Text size="small" margin={{ bottom: 'small' }}>Minimalna temperatura: {potDetails.plantSpecifications.temperature.min} °C</Text>
                )}
                {potDetails.plantSpecifications.temperature?.max && (
                  <Text size="small" margin={{ bottom: 'small' }}>Maksymalna temperatura: {potDetails.plantSpecifications.temperature.max} °C</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.soilNutriments && (
                  <Text size="small" margin={{ bottom: 'small' }}>Składniki odżywcze gleby: {potDetails.plantSpecifications.soilRequirements.soilNutriments}</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.soilSalinity && (
                  <Text size="small" margin={{ bottom: 'small' }}>Zasolenie gleby: {potDetails.plantSpecifications.soilRequirements.soilSalinity}</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.soilTexture && (
                  <Text size="small" margin={{ bottom: 'small' }}>Tekstura gleby: {potDetails.plantSpecifications.soilRequirements.soilTexture}</Text>
                )}
                {potDetails.plantSpecifications.soilRequirements?.soilHumidity && (
                  <Text size="small" margin={{ bottom: 'small' }}>Wilgotność gleby: {potDetails.plantSpecifications.soilRequirements.soilHumidity}</Text>
                )}
              </>
            )}

            <Text size="small" margin={{ bottom: 'small' }}>Automatyczne podlewanie: {potDetails.autoWateringEnabled ? 'Włączone' : 'Wyłączone'}</Text>
            
            {potDetails.otherParams && (
              <>
                <Text size="small" margin={{ bottom: 'small' }}>Nasłonecznienie: {potDetails.otherParams.sunlight}</Text>
                <Text size="small" margin={{ bottom: 'small' }}>Rodzaj gleby: {potDetails.otherParams.soilType}</Text>
                <Text size="small" margin={{ bottom: 'small' }}>Temperatura: {potDetails.otherParams.temperature}</Text>
              </>
            )}

            <Button
              label="Historia Podlewania"
              onClick={() => navigate(`/pot-history/${potId}`)}
              margin={{ bottom: 'small' }}
            />
            <Button
              label="Edytuj Parametry Podlewania"
              onClick={() => navigate(`/edit-pot/${potId}`)}
              primary
              margin={{ bottom: 'small' }}
            />
            <Button
              label="Dodaj Symulację Historii"
              onClick={simulateWateringHistory}
              color="status-ok"
              margin={{ top: 'small' }}
            />
          </CardBody>
        </Card>
      ) : (
        <Text>Ładowanie szczegółów doniczki...</Text>
      )}
    </Box>
  );
};

export default LoggedPotDetails;
