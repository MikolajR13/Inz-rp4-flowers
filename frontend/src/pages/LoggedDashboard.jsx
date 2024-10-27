import React, { useEffect, useState } from 'react';
import { Box, Heading, Grid, Text, Image, Card, CardBody, Button } from 'grommet';
import { useNavigate } from 'react-router-dom';

// Ikona doniczki oraz ikona dodawania nowej doniczki
import potIcon from '../assets/pot.png'; // Ikona doniczki
import addIcon from '../assets/add.png'; // Ikona dodania nowej doniczki

const LoggedDashboard = () => {
  const [pots, setPots] = useState([]);
  const navigate = useNavigate();

  // Pobieranie doniczek użytkownika z backendu
  useEffect(() => {
    const fetchPots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me/pots', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setPots(data.data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania doniczek:', error);
      }
    };

    fetchPots();
  }, []);

  // Funkcja sprawdzania wilgotności gleby
  const handleCheckSoilMoisture = async (potId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/pots/${potId}/soil-moisture`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        alert(`Wilgotność gleby: ${data.soilMoisture}%`);
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania wilgotności gleby:', error);
    }
  };

  return (
    <Box fill align="center" justify="start" pad="small" background="light-2">
      <Heading level="2" color="brand" alignSelf="center" margin={{ vertical: 'small' }}>Moje Doniczki</Heading>
      <Grid
        columns={{ count: 3, size: 'medium' }}
        gap="medium"
        justifyContent="center"
        margin={{ top: 'small' }}
      >
        {/* Wyświetlanie kafelków dla każdej doniczki */}
        {pots.map((pot) => (
          <Card key={pot._id} background="light-1" pad="medium" hoverIndicator>
            <CardBody align="center">
              <Image src={potIcon} alt="Pot icon" width="70px" height="70px" margin={{ bottom: 'small' }} />
              <Text size="large" color="dark-3" margin={{ bottom: 'small' }}>{pot.name}</Text>
              <Text size="medium" color="dark-4">Kwiat: {pot.flowerName}</Text>
              <Text size="small" color="dark-4">Ostatnie podlewanie: {new Date(pot.lastWateredDate).toLocaleDateString()}</Text>
              <Button
                label="Sprawdź wilgotność gleby"
                onClick={() => handleCheckSoilMoisture(pot._id)}
                margin={{ top: 'small' }}
              />
            </CardBody>
          </Card>
        ))}

        {/* Kafelek dodania nowej doniczki */}
        <Card background="light-1" pad="medium" hoverIndicator onClick={() => navigate('/add-pot')}>
          <CardBody align="center">
            <Image src={addIcon} alt="Add Pot" width="70px" height="70px" margin={{ bottom: 'small' }} />
            <Text size="large" color="dark-3">Dodaj Nową Doniczkę</Text>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default LoggedDashboard;