import React, { useState } from 'react';
import { Box, Button, Heading, TextInput, Form, FormField, CheckBox } from 'grommet';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Hasła muszą się zgadzać!');
      return;
    }
    console.log('Registration data:', formData);
    // TODO: w backendzie trzeba dorobić rejestrację
  };

  return (
    <Box fill align="center" justify="center" pad="large" background="light-2">
      <Heading level="2" color="brand">Rejestracja</Heading>
      <Box width="medium" pad="medium">
        <Form
          value={formData}
          onChange={(nextValue) => setFormData(nextValue)}
          onSubmit={handleSubmit}
        >
          <FormField name="firstName" label="Imię">
            <TextInput
              name="firstName"
              placeholder="Podaj swoje imię"
            />
          </FormField>
          <FormField name="lastName" label="Nazwisko">
            <TextInput
              name="lastName"
              placeholder="Podaj swoje nazwisko"
            />
          </FormField>
          <FormField name="email" label="Email">
            <TextInput
              name="email"
              type="email"
              placeholder="Podaj swój email"
            />
          </FormField>
          <FormField name="password" label="Hasło">
            <TextInput
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Podaj swoje hasło"
            />
          </FormField>
          <FormField name="confirmPassword" label="Potwierdź Hasło">
            <TextInput
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Potwierdź swoje hasło"
            />
          </FormField>
          <CheckBox
            label="Pokaż hasło"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <Box direction="row" justify="between" margin={{ top: 'medium' }}>
            <Button type="submit" primary label="Zarejestruj się" color="brand" />
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export default RegisterPage;
