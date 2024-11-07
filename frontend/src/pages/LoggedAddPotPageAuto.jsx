import React, { useState } from 'react';
import { Box, Button, Heading, Form, FormField, TextInput, Select, Text, Grommet } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { usePlantData } from '../context/PlantDataContext'; 

const SERVER = process.env.REACT_APP_SERVER;

const theme = {
  global: {
    colors: {
      'custom-dark-green': '#006400',
      'custom-cancel': '#FF4040'
    }
  }
};

const shapeOptions = [
  { label: 'Prostopadłościan', value: 'cuboid' },
  { label: 'Walec', value: 'cylinder' }
];

const LoggedAddPotPageAuto = () => {
  const [formData, setFormData] = useState({
    potName: '',
    potSize: '',
    shape: 'cuboid',
    dimensions: {
      height: '',
      width: '',
      depth: '',
      diameter: ''
    }
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { plantData } = usePlantData(); // Pobieramy dane z kontekstu
  const navigate = useNavigate();

  const handleDimensionChange = (dimension, value) => {
    setFormData((prevData) => ({
      ...prevData,
      dimensions: { ...prevData.dimensions, [dimension]: parseInt(value, 10) || '' }
    }));
  };

  const handleShapeChange = (selectedOption) => {
    setFormData({
      ...formData,
      shape: selectedOption.value,
      dimensions: { height: '', width: '', depth: '', diameter: '' }
    });
  };

  const validateForm = () => {
    if (!formData.potName || !formData.potSize || !formData.dimensions.height) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane pola.');
      return false;
    }

    if (formData.shape === 'cuboid' && (!formData.dimensions.width || !formData.dimensions.depth)) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane wymiary dla prostopadłościanu.');
      return false;
    }

    if (formData.shape === 'cylinder' && !formData.dimensions.diameter) {
      setErrorMessage('Proszę wypełnić średnicę dla walca.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const response = await fetch(`${SERVER}/api/users/me/pots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          autoWateringEnabled: true, // Ustawienie autopodlewania
          plantSpecifications: plantData // Ustawienie specyfikacji rośliny z kontekstu
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Doniczka została dodana z włączonym autopodlewaniem!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Błąd podczas dodawania doniczki, spróbuj ponownie.');
    }
  };

  return (
    <Grommet theme={theme}>
      <Box fill align="center" justify="center" pad="large" background="light-1">
        <Heading level="2" color="brand">Dodaj Nową Doniczkę - Autopodlewanie</Heading>
        <Box width="large" pad="medium">
          <Form onSubmit={handleSubmit}>
            <FormField label="Nazwa Doniczki">
              <TextInput
                placeholder="Wprowadź nazwę doniczki"
                value={formData.potName}
                onChange={(e) => setFormData({ ...formData, potName: e.target.value })}
              />
            </FormField>

            <FormField label="Rozmiar Doniczki">
              <TextInput
                placeholder="Mała, Średnia, Duża"
                value={formData.potSize}
                onChange={(e) => setFormData({ ...formData, potSize: e.target.value })}
              />
            </FormField>

            <FormField label="Kształt Doniczki">
              <Select
                options={shapeOptions}
                labelKey="label"
                valueKey="value"
                value={shapeOptions.find(option => option.value === formData.shape)}
                onChange={({ option }) => handleShapeChange(option)}
              />
            </FormField>

            <FormField label="Wysokość (cm)">
              <TextInput
                placeholder="Wysokość"
                value={formData.dimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
              />
            </FormField>

            {formData.shape === 'cuboid' && (
              <>
                <FormField label="Szerokość (cm)">
                  <TextInput
                    placeholder="Szerokość"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                  />
                </FormField>
                <FormField label="Głębokość (cm)">
                  <TextInput
                    placeholder="Głębokość"
                    value={formData.dimensions.depth}
                    onChange={(e) => handleDimensionChange('depth', e.target.value)}
                  />
                </FormField>
              </>
            )}

            {formData.shape === 'cylinder' && (
              <FormField label="Średnica (cm)">
                <TextInput
                  placeholder="Średnica"
                  value={formData.dimensions.diameter}
                  onChange={(e) => handleDimensionChange('diameter', e.target.value)}
                />
              </FormField>
            )}

            <Box direction="row" justify="between" margin={{ top: 'medium' }}>
              <Button type="submit" label="Dodaj Doniczkę" primary />
              <Button label="Anuluj" color="custom-cancel" onClick={() => navigate('/dashboard')} />
            </Box>

            {errorMessage && <Text color="status-error" margin={{ top: 'small' }}>{errorMessage}</Text>}
            {successMessage && <Text color="status-ok" margin={{ top: 'small' }}>{successMessage}</Text>}
          </Form>
        </Box>
      </Box>
    </Grommet>
  );
};

export default LoggedAddPotPageAuto;
