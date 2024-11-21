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
