import React, { useEffect, useState } from 'react';
import { Box, Heading, List } from 'grommet';
import { useParams } from 'react-router-dom';

const LoggedPotHistory = () => {
  const { potId } = useParams();
  const [potHistory, setPotHistory] = useState([]);

  useEffect(() => {
    const fetchPotHistory = async () => {
      const response = await fetch(`/api/pot-history/${potId}`);
      const data = await response.json();
      setPotHistory(data.history);
    };

    fetchPotHistory();
  }, [potId]);

  return (
    <Box pad="medium">
      <Heading level="2">Historia Podlewania - {potId}</Heading>
      <List
        data={potHistory}
        primaryKey="date"
        secondaryKey={(item) => `Ilość wody: ${item.amount} ml`}
      />
    </Box>
  );
};

export default LoggedPotHistory;
