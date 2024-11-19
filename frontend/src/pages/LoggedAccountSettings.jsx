import React, { useState, useEffect } from 'react';
import { Box, Heading, TextInput, Button, FormField, Form, Layer, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';



const LoggedAccountSettings = () => {
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState(null);
  const navigate = useNavigate();
  const SERVER = process.env.REACT_APP_SERVER;

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`${SERVER}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
      }
    };

    fetchUserData();
  }, []);

  const handleFieldSubmit = (field) => {
    setFieldToUpdate(field);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    if (!fieldToUpdate) return;

    try {
      const response = await fetch(`${SERVER}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldToUpdate]: userData[fieldToUpdate] }),
      });

      const data = await response.json();

      if (data.success) {
        setShowReturnPrompt(true);
        setUserData(data.data);
        setFieldToUpdate(null);
      } else {
        alert('Wystąpił błąd podczas zapisywania zmian.');
      }
    } catch (error) {
      console.error('Błąd aktualizacji danych użytkownika:', error);
      alert('Wystąpił błąd podczas zapisywania zmian.');
    }
  };

  const handleReturnPrompt = (shouldReturn) => {
    setShowReturnPrompt(false);
    if (shouldReturn) {
      navigate('/dashboard');
    }
  };

  return (
    <Box fill align="center" justify="center" pad="large" background="light-1">
      <Box width="medium" pad="medium" background="white" round="small" elevation="small">
        <Heading level="2" margin="none" color="brand">Ustawienia Konta</Heading>
        
        <Form>
          <Box margin={{ vertical: 'medium' }}>
            <FormField label="Email" margin={{ bottom: 'small' }}>
              <TextInput
                value={userData.email}
                onChange={(event) => setUserData({ ...userData, email: event.target.value })}
              />
            </FormField>
            <Box align="center" margin={{ top: 'small' }}>
              <Button
                label="Zapisz zmiany"
                primary
                onClick={() => handleFieldSubmit('email')}
              />
            </Box>
          </Box>

          <Box margin={{ vertical: 'medium' }}>
            <FormField label="Imię" margin={{ bottom: 'small' }}>
              <TextInput
                value={userData.firstName}
                onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
              />
            </FormField>
            <Box align="center" margin={{ top: 'small' }}>
              <Button
                label="Zapisz zmiany"
                primary
                onClick={() => handleFieldSubmit('firstName')}
              />
            </Box>
          </Box>

          <Box margin={{ vertical: 'medium' }}>
            <FormField label="Nazwisko" margin={{ bottom: 'small' }}>
              <TextInput
                value={userData.lastName}
                onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
              />
            </FormField>
            <Box align="center" margin={{ top: 'small' }}>
              <Button
                label="Zapisz zmiany"
                primary
                onClick={() => handleFieldSubmit('lastName')}
              />
            </Box>
          </Box>
        </Form>
      </Box>

      {showConfirm && (
        <Layer
          onEsc={() => setShowConfirm(false)}
          onClickOutside={() => setShowConfirm(false)}
        >
          <Box pad="medium" gap="small" width="medium">
            <Heading level="3" margin="none">Potwierdzenie</Heading>
            <Text>Czy na pewno chcesz zapisać zmiany dla {fieldToUpdate === 'email' ? 'Email' : fieldToUpdate === 'firstName' ? 'Imię' : 'Nazwisko'}?</Text>
            <Box direction="row" gap="small" justify="end" margin={{ top: 'medium' }}>
              <Button label="Anuluj" onClick={() => setShowConfirm(false)} />
              <Button
                label="Potwierdź"
                primary
                onClick={handleConfirmSave}
                color="status-critical"
              />
            </Box>
          </Box>
        </Layer>
      )}

      {showReturnPrompt && (
        <Layer
          onEsc={() => setShowReturnPrompt(false)}
          onClickOutside={() => setShowReturnPrompt(false)}
        >
          <Box pad="medium" gap="small" width="medium">
            <Heading level="3" margin="none">Powrót do menu</Heading>
            <Text>Czy chcesz wrócić do menu użytkownika?</Text>
            <Box direction="row" gap="small" justify="end" margin={{ top: 'medium' }}>
              <Button label="Nie" onClick={() => handleReturnPrompt(false)} />
              <Button
                label="Tak"
                primary
                onClick={() => handleReturnPrompt(true)}
                color="status-critical"
              />
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  );
};

export default LoggedAccountSettings;
