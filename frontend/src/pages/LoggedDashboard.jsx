import React, { useState, useEffect } from 'react';
import { Box, Heading, Grid, Text, Image, Card, CardBody, Button, Layer } from 'grommet';
import { useNavigate } from 'react-router-dom';
import potIcon from '../assets/pot.png'; // Ikona doniczki
import addIcon from '../assets/add.png'; // Ikona dodania nowej doniczki

const LoggedDashboard = () => {
  const [pots, setPots] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [potToDelete, setPotToDelete] = useState(null);
  const navigate = useNavigate();

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


  const handleCheckSoilMoisture = async (potId) => {
    try {
      await fetch(`http://localhost:5000/api/users/me/pots/${potId}/soil-moisture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Dodanie opóźnienia na odbiór odpowiedzi
      setTimeout(async () => {
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
      }, 5000); // Opóźnienie na odebranie odpowiedzi
    } catch (error) {
      console.error('Błąd podczas sprawdzania wilgotności gleby:', error);
    }
  };
  

  const handleDeletePot = async (potId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/pots/${potId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPots(pots.filter(pot => pot._id !== potId));
        setShowConfirmDelete(false);
      }
    } catch (error) {
      console.error('Błąd podczas usuwania doniczki:', error);
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
        {pots.map((pot) => (
          <Card
            key={pot._id}
            background="light-1"
            pad="medium"
            hoverIndicator
            onClick={() => navigate(`/pot/${pot._id}`)} 
          >
            <CardBody align="center">
              <Image src={potIcon} alt="Pot icon" width="70px" height="70px" margin={{ bottom: 'small' }} />
              <Text size="large" color="dark-3" margin={{ bottom: 'small' }}>{pot.potName}</Text>
              <Text size="medium" color="dark-4">Kwiat: {pot.flowerName}</Text>
              <Text size="small" color="dark-4">Ostatnie podlewanie: {new Date(pot.lastWateredDate).toLocaleDateString()}</Text>
              <Box direction="row" gap="small" margin={{ top: 'small' }}>
                <Button
                  label="Usuń Doniczkę"
                  color="status-critical"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPotToDelete(pot);
                    setShowConfirmDelete(true);
                  }}
                />
                <Button
                  label="Historia Podlewania"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/pot-history/${pot._id}`);
                  }}
                />
              </Box>
              <Button
                label="Sprawdź wilgotność gleby"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckSoilMoisture(pot._id);
                }}
                margin={{ top: 'small' }}
              />
            </CardBody>
          </Card>
        ))}

        <Card background="light-1" pad="medium" hoverIndicator onClick={() => navigate('/add-pot')}>
          <CardBody align="center">
            <Image src={addIcon} alt="Add Pot" width="70px" height="70px" margin={{ bottom: 'small' }} />
            <Text size="large" color="dark-3">Dodaj Nową Doniczkę</Text>
          </CardBody>
        </Card>
      </Grid>

      {showConfirmDelete && (
        <Layer
          onEsc={() => setShowConfirmDelete(false)}
          onClickOutside={() => setShowConfirmDelete(false)}
        >
          <Box pad="medium" gap="small">
            <Text>Czy na pewno chcesz usunąć doniczkę "{potToDelete.potName}"?</Text>
            <Box direction="row" justify="between">
              <Button label="Tak" onClick={() => handleDeletePot(potToDelete._id)} color="status-critical" />
              <Button label="Anuluj" onClick={() => setShowConfirmDelete(false)} />
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  );
};

export default LoggedDashboard;
