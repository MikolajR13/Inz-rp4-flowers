import React, { useState } from 'react';
import { Box, Button, Form, FormField, TextInput, Heading, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';
import dotenv from "dotenv";
dotenv.config();
const SERVER = process.env.SERVER;

const RegisterPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Hasła muszą być takie same.');
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,  
    };

    try {
      const response = await fetch(`${SERVER}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Błąd podczas rejestracji, spróbuj ponownie.');
    }
  };

  return (
    <Box pad="large" align="center">
      <Heading level="2">Rejestracja</Heading>
      <Form onSubmit={handleRegister}>
        <FormField label="Imię">
          <TextInput
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </FormField>
        <FormField label="Nazwisko">
          <TextInput
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </FormField>
        <FormField label="Email">
          <TextInput
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </FormField>
        <FormField label="Hasło">
          <TextInput
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </FormField>
        <FormField label="Potwierdź Hasło">
          <TextInput
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </FormField>
        {errorMessage && <Text color="status-critical">{errorMessage}</Text>}
        <Button type="submit" label="Zarejestruj" primary margin={{ top: 'medium' }} />
      </Form>
    </Box>
  );
};

export default RegisterPage;
