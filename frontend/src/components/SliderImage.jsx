import React, { useState } from 'react';
import { Box, Image, RangeInput } from 'grommet';

const SliderImage = () => {
  const images = [
    "/assets/flower-watering1.jpg",
    "/assets/flower-watering2.jpg",
    "/assets/flower-watering3.jpg",
    "/assets/flower-watering4.jpg"
  ];

  const [imageIndex, setImageIndex] = useState(0);

  const handleSliderChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setImageIndex(value);
  };

  return (
    <Box align="center" justify="center" pad="large">
      <Image src={images[imageIndex]} alt="Podlewanie kwiatów" fit="contain" />
      <RangeInput
        min={0}
        max={images.length - 1}
        value={imageIndex}
        onChange={handleSliderChange}
      />
    </Box>
  );
};

export default SliderImage;
