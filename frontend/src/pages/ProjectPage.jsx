import React from 'react';
import { Box, Heading, Grid, Text, Anchor, Image, Card, CardBody } from 'grommet';

// Import src/assets
import reactIcon from '../assets/react.png';
import grommetIcon from '../assets/grommet.png';
import nodejsIcon from '../assets/js.png';
import expressIcon from '../assets/express.png';
import mongodbIcon from '../assets/mongo.png';
import mqttIcon from '../assets/mqtt.png';

// Lista do pobierania z niej i wyświetlania 
const technologies = [
  {
    name: 'React',
    link: 'https://reactjs.org',
    icon: reactIcon,
  },
  {
    name: 'Grommet',
    link: 'https://v2.grommet.io',
    icon: grommetIcon,
  },
  {
    name: 'Node.js',
    link: 'https://nodejs.org',
    icon: nodejsIcon,
  },
  {
    name: 'Express',
    link: 'https://expressjs.com',
    icon: expressIcon,
  },
  {
    name: 'MongoDB',
    link: 'https://www.mongodb.com',
    icon: mongodbIcon,
  },
  {
    name: 'MQTT',
    link: 'https://mqtt.org',
    icon: mqttIcon,
  },
];

const ProjectPage = () => {
  return (
    <Box fill align="center" justify="center" pad="large" background="light-3">
      <Heading level="2" color="brand" alignSelf="center">Projekt</Heading>
      <Box width="large" pad="medium" align="center">
        <Text size="large" margin={{ bottom: 'medium' }} color="dark-2" textAlign="center">
          Nasz projekt wykorzystuje następujące technologie, aby zapewnić nowoczesne i łatwe w użyciu narzędzie do zarządzania roślinami:
        </Text>
        <Grid
          columns={{ count: 3, size: 'medium' }} 
          gap="medium"
          justifyContent="center"
        >
          {technologies.map((tech) => (
            <Card key={tech.name} background="light-1" pad="medium" hoverIndicator>
              <CardBody align="center">
                <Anchor href={tech.link} target="_blank">
                  <Box align="center" pad="small">
                    {/* Wyświetlenie ikony */}
                    <Image src={tech.icon} alt={`${tech.name} icon`} width="50px" height="50px" margin={{ bottom: 'small' }} />
                    <Text size="large" color="dark-3" margin={{ top: 'small' }}>{tech.name}</Text>
                  </Box>
                </Anchor>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProjectPage;
