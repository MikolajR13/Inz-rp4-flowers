import React, { useState, useEffect } from 'react';
import { Box, Heading, TextInput, Button, FormField, Form } from 'grommet';

const LoggedAccountSettings = () => {
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      setUserData(data.user);
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  };

  return (
    <Box pad="medium">
      <Heading level="2">Ustawienia Konta</Heading>
      <Form onSubmit={handleSubmit}>
        <FormField label="Email">
          <TextInput
            value={userData.email}
            onChange={(event) => setUserData({ ...userData, email: event.target.value })}
          />
        </FormField>
        <FormField label="Imię">
          <TextInput
            value={userData.firstName}
            onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
          />
        </FormField>
        <FormField label="Nazwisko">
          <TextInput
            value={userData.lastName}
            onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
          />
        </FormField>
        <Button type="submit" label="Zapisz zmiany" primary />
      </Form>
    </Box>
  );
};

export default LoggedAccountSettings;
