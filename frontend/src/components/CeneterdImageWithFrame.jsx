import React from 'react';
import { Box, Image } from 'grommet';
import flowerImage from '../assets/flower-watering4.jpg';

const CenteredImageWithFrame = () => {
  return (
    <Box
      align="center"
      justify="center"
      pad="medium"
      background="light-2"
      round="small"
      border={{ color: 'brand', size: 'medium' }}
      style={{
        width: '400px',
        height: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto'
      }}
    >
      <Image
        src={flowerImage}
        alt="Podlewanie kwiatów"
        fit="contain"
        style={{
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </Box>
  );
};

export default CenteredImageWithFrame;
