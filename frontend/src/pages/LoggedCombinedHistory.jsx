import React, { useEffect, useState } from 'react';
import { Box, Heading, List } from 'grommet';

const LoggedCombinedHistory = () => {
  const [wateringHistory, setWateringHistory] = useState([]);

  useEffect(() => {
    const fetchCombinedHistory = async () => {
      const response = await fetch('/api/history');
      const data = await response.json();
      setWateringHistory(data.history);
    };

    fetchCombinedHistory();
  }, []);

  return (
    <Box pad="medium">
      <Heading level="2">Historia Podlewania - Wszystkie Doniczki</Heading>
      <List
        data={wateringHistory}
        primaryKey="date"
        secondaryKey={(item) => `Doniczka: ${item.potName}, Ilość wody: ${item.amount} ml`}
      />
    </Box>
  );
};

export default LoggedCombinedHistory;
