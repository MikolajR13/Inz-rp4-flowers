import React from 'react';
import { Box, Button, Heading, Text } from 'grommet';
import { Link } from 'react-router-dom';
//import SliderImage from "../components/SliderImage";
//import flowerimg1 from '../assets/flower-watering1.jpg';
import CenteredImageWithFrame from '../components/CeneterdImageWithFrame';


const HomePage = () => {
  return (
    <Box fill align="center" justify="center" background="accent-1">
      <Box pad="large">
        <Heading level="1" color="brand">Zarządzanie Podlewaniem Kwiatów</Heading>
        <Text size="large" color="brand">
          Łatwe zarządzanie podlewaniem kwiatów za pomocą naszej aplikacji!
        </Text>
        <Link to="/register">
          <Button label="Get Started" primary color="brand" margin={{ top: 'medium' }} />
        </Link>
      </Box>
      <Box margin={{ top: 'large' }}>
      <CenteredImageWithFrame />
      </Box>
    </Box>
  );
};

export default HomePage;
