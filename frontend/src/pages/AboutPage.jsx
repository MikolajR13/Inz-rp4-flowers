import React from 'react';
import { Box, Heading, Text } from 'grommet';

const AboutPage = () => {
  return (
    <Box fill align="center" justify="center" pad="large" background="light-2">
      <Heading level="2" color="brand">O Projekcie</Heading>
      <Box width="medium" pad="medium">
        <Text size="large">
          Nasza aplikacja umożliwia łatwe zarządzanie podlewaniem kwiatów, monitorowanie potrzeb roślin oraz planowanie ich pielęgnacji. 
          Celem projektu jest uproszczenie procesu dbania o rośliny dla każdego miłośnika kwiatów.
        </Text>
        <Text size="large" margin={{ top: 'medium' }}>
          Wykorzystujemy najnowsze technologie, takie jak MQTT, React, oraz Chakra UI, aby zapewnić płynne i przyjemne doświadczenia użytkownika.
        </Text>
      </Box>
    </Box>
  );
};

export default AboutPage;
