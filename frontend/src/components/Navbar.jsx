import React from 'react';
import { Box, Button, Header, Nav } from 'grommet';
import { Link, useLocation } from 'react-router-dom';

// Czy przycisk jest aktywny
const isActive = (path, currentPath) => path === currentPath;

const Navbar = () => {
  const location = useLocation();

  // W zależności od aktywnej podstrony przycisk ma inny kolor
  const getButtonColor = (path) => {
    return isActive(path, location.pathname) ? 'accent-2' : 'brand';
  };

  return (
    <Header background="brand" pad="medium">
      <Box direction="row" gap="medium">
        <Link to="/">
          <Button
            label="Strona Główna"
            hoverIndicator
            color={getButtonColor('/')}
          />
        </Link>
        <Link to="/about">
          <Button
            label="O Projekcie"
            hoverIndicator
            color={getButtonColor('/about')}
          />
        </Link>
        <Link to="/project">
          <Button
            label="Projekt"
            hoverIndicator
            color={getButtonColor('/project')}
          />
        </Link>
        <a href="https://github.com/MikolajR13/InzynierkaKwiatki">
          <Button label="GitHub" hoverIndicator color="brand" />
        </a>
      </Box>
      <Nav direction="row">
        <Link to="/login">
          <Button
            label="Logowanie"
            hoverIndicator
            color={getButtonColor('/login')}
          />
        </Link>
        <Link to="/register">
          <Button
            label="Rejestracja"
            hoverIndicator
            color={getButtonColor('/register')}
          />
        </Link>
      </Nav>
    </Header>
  );
};

export default Navbar;
