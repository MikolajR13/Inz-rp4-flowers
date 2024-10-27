import React from 'react';
import { Box, Button, Header, Nav, Text } from 'grommet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/getUserInfo';

const isActive = (path, currentPath) => path === currentPath;

const LoggedNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = getUserInfo();

  const getButtonColor = (path) => {
    return isActive(path, location.pathname) ? 'accent-2' : 'brand';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Header background="brand" pad="medium">
      <Box direction="row" gap="medium">
        <Link to="/dashboard">
          <Button
            label="Panel Użytkownika"
            hoverIndicator
            color={getButtonColor('/dashboard')}
          />
        </Link>
        <Link to="/history">
          <Button
            label="Historia Podlewania"
            hoverIndicator
            color={getButtonColor('/history')}
          />
        </Link>
        <Link to="/project">
          <Button
            label="Projekt"
            hoverIndicator
            color={getButtonColor('/project')}
          />
        </Link>
        <a href="https://github.com/MikolajR13/Inz-rp4-flowers">
          <Button label="GitHub" hoverIndicator color="brand" />
        </a>
      </Box>
      <Nav direction="row">
        {userInfo ? (
          <Box direction="row" align="center" gap="small">
            <Text color="light-1">{`${userInfo.firstName} ${userInfo.lastName}`}</Text>
            <Button label="Wyloguj" color="custom-cancel" onClick={handleLogout} />
          </Box>
        ) : (
          <>
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
          </>
        )}
      </Nav>
    </Header>
  );
};

export default LoggedNavbar;
