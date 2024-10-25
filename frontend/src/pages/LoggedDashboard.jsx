import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Grid, Card, CardBody } from 'grommet';
import { useNavigate } from 'react-router-dom';

const LoggedDashboard = () => {
  const [pots, setPots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPots = async () => {
      const response = await fetch('/api/pots');
      const data = await response.json();
      setPots(data.pots);
    };

    fetchUserPots();
  }, []);

  return (
    <Box pad="medium">
      <Heading level="2">Panel użytkownika</Heading>
      <Text margin={{ bottom: 'medium' }}>
        Witamy w panelu użytkownika! Poniżej możesz zobaczyć podgląd swoich doniczek.
      </Text>
      <Grid columns={{ count: 'fit', size: 'small' }} gap="medium">
        {pots.map((pot) => (
          <Card
            key={pot._id}
            onClick={() => navigate(`/pot/${pot._id}`)}
            hoverIndicator
            background="light-1"
          >
            <CardBody pad="medium">
              <Heading level="3" margin="none">
                {pot.name}
              </Heading>
              <Text>{pot.description}</Text>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Box>
  );
};

export default LoggedDashboard;
