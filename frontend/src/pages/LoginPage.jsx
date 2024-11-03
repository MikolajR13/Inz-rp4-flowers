import React, { useState } from 'react';
import { Box, Button, Heading, TextInput, Form, FormField, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch('https://flowersmanager.pl/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Jeśli logowanie jest poprawne, zapisz token i przekieruj użytkownika
        localStorage.setItem('token', data.token);
        navigate('/dashboard'); // Przekierowanie na stronę użytkownika po zalogowaniu
        window.location.reload();
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Błąd podczas logowania, spróbuj ponownie.');
    }
  };

  return (
    <Box fill align="center" justify="center" pad="large" background="light-1">
      <Heading level="2" color="brand">Logowanie</Heading>
      <Box width="medium" pad="medium">
        <Form
          value={formData}
          onChange={(nextValue) => setFormData(nextValue)}
          onSubmit={handleSubmit}
        >
          <FormField name="email" label="Email">
            <TextInput
              name="email"
              type="email"
              placeholder="Podaj swój email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>
          <FormField name="password" label="Hasło">
            <TextInput
              name="password"
              type="password"
              placeholder="Podaj swoje hasło"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </FormField>
          {errorMessage && <Text color="status-critical">{errorMessage}</Text>}
          <Box direction="row" justify="between" margin={{ top: 'medium' }}>
            <Button type="submit" primary label="Zaloguj się" color="brand" />
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export default LoginPage;
