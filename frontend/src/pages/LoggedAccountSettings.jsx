import React, { useState, useEffect } from 'react';
import { Box, Heading, TextInput, Button, FormField, Form, Layer, Text } from 'grommet';

const LoggedAccountSettings = () => {
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Zmiany zostały zapisane pomyślnie.');
      } else {
        alert('Wystąpił błąd podczas zapisywania zmian.');
      }
    } catch (error) {
      console.error('Błąd aktualizacji danych użytkownika:', error);
      alert('Wystąpił błąd podczas zapisywania zmian.');
    }
  };

  return (
    <Box pad="large" background="light-2" align="center">
      <Box width="medium" pad="medium" background="white" round="small" elevation="small">
        <Heading level="2" margin="none" color="brand">Ustawienia Konta</Heading>
        <Form onSubmit={handleSubmit}>
          <FormField label="Email" margin={{ top: 'medium' }}>
            <TextInput
              value={userData.email}
              onChange={(event) => setUserData({ ...userData, email: event.target.value })}
            />
          </FormField>
          <FormField label="Imię" margin={{ top: 'medium' }}>
            <TextInput
              value={userData.firstName}
              onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
            />
          </FormField>
          <FormField label="Nazwisko" margin={{ top: 'medium' }}>
            <TextInput
              value={userData.lastName}
              onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
            />
          </FormField>
          <Button type="submit" label="Zapisz zmiany" primary margin={{ top: 'medium' }} />
        </Form>
      </Box>

      {showConfirm && (
        <Layer
          onEsc={() => setShowConfirm(false)}
          onClickOutside={() => setShowConfirm(false)}
        >
          <Box pad="medium" gap="small" width="medium">
            <Heading level="3" margin="none">Potwierdzenie</Heading>
            <Text>Czy na pewno chcesz zapisać zmiany?</Text>
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
    </Box>
  );
};

export default LoggedAccountSettings;
