import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button } from 'grommet';
import { useParams, useNavigate } from 'react-router-dom';

const LoggedPotDetails = () => {
  const { potId } = useParams();
  const [potDetails, setPotDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPotDetails = async () => {
      const response = await fetch(`/api/pots/${potId}`);
      const data = await response.json();
      setPotDetails(data.pot);
    };

    fetchPotDetails();
  }, [potId]);

  return (
    <Box pad="medium">
      {potDetails ? (
        <>
          <Heading level="2">{potDetails.name}</Heading>
          <Text>{potDetails.description}</Text>
          <Text>Ostatnie podlewanie: {potDetails.lastWatered}</Text>
          <Button label="Zobacz historię podlewania" onClick={() => navigate(`/pot-history/${potId}`)} />
        </>
      ) : (
        <Text>Ładowanie szczegółów doniczki...</Text>
      )}
    </Box>
  );
};

export default LoggedPotDetails;
