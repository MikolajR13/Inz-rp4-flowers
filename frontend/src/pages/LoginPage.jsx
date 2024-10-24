import React, { useState } from 'react';
import { Box, Button, Heading, TextInput, Form, FormField } from 'grommet';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Login data:', formData);
    // TODO: dodać logowanie do backendu
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
            />
          </FormField>
          <FormField name="password" label="Hasło">
            <TextInput
              name="password"
              type="password"
              placeholder="Podaj swoje hasło"
            />
          </FormField>
          <Box direction="row" justify="between" margin={{ top: 'medium' }}>
            <Button type="submit" primary label="Zaloguj się" color="brand" />
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export default LoginPage;
