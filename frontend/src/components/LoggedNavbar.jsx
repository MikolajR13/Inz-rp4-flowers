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
    window.location.reload();
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
        <Link to="/account-settings">
          <Button
            label="Ustawienia Konta"
            hoverIndicator
            color={getButtonColor('/account-settings')}
          />
        </Link>
      </Box>

      <Nav direction="row" align="center" gap="medium">
        {userInfo && (
          <Text color="light-1" margin={{ right: 'small' }}>
            {`Zalogowany jako: ${userInfo.firstName} ${userInfo.lastName} (${userInfo.email})`}
          </Text>
        )}
        <Button label="Wyloguj" color="custom-cancel" onClick={handleLogout} />
      </Nav>
    </Header>
  );
};

export default LoggedNavbar;
