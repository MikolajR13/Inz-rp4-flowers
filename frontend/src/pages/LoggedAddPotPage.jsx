import React, { useState } from 'react';
import { Box, Button, Heading, Form, FormField, TextInput, Select, Text, Tip, Grid, Grommet } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { Help } from 'grommet-icons';

const theme = {
  global: {
    colors: {
      'custom-dark-green': '#006400',
      'custom-cancel': '#FF4040'
    }
  },
  tip: {
    content: {
      background: 'white',
      border: { color: 'custom-dark-green' },
      pad: 'small',
      elevation: 'small'
    },
    plain: {
      color: 'custom-dark-green',
    },
  },
};

// Opcje w języku polskim
const shapeOptions = [
  { label: 'Prostopadłościan', value: 'cuboid' },
  { label: 'Walec', value: 'cylinder' }
];
const unitOptions = ['Godziny', 'Dni'];

const LoggedAddPotPage = () => {
  const [formData, setFormData] = useState({
    potName: '',
    flowerName: '',
    waterAmount: '',
    wateringFrequency: '',
    potSize: '',
    shape: 'cuboid', // Domyślnie ustawiamy na "cuboid"
    dimensions: {
      height: '',
      width: '',
      depth: '',
      diameter: ''
    }
  });

  const [unit, setUnit] = useState('');
  const [frequencyInputVisible, setFrequencyInputVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.potName || !formData.flowerName || !formData.waterAmount || !formData.wateringFrequency || !formData.potSize) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane pola.');
      return false;
    }

    if (!Number.isInteger(parseInt(formData.waterAmount)) || !Number.isInteger(parseInt(formData.wateringFrequency))) {
      setErrorMessage('Ilość wody i częstotliwość podlewania muszą być liczbami całkowitymi.');
      return false;
    }

    if (typeof formData.potName !== 'string' || typeof formData.flowerName !== 'string' || typeof formData.potSize !== 'string') {
      setErrorMessage('Niektóre pola muszą zawierać tekst.');
      return false;
    }

    return true;
  };

  const handleUnitSelect = (nextUnit) => {
    setUnit(nextUnit);
    setFrequencyInputVisible(true);
  };

  const handleCancelFrequencyInput = () => {
    setFrequencyInputVisible(false);
    setUnit('');
    setFormData({ ...formData, wateringFrequency: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/users/me/pots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Doniczka została dodana!');
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

  const handleShapeChange = (selectedOption) => {
    setFormData({
      ...formData,
      shape: selectedOption.value,
      dimensions: { height: '', width: '', depth: '', diameter: '' }
    });
  };

  return (
    <Grommet theme={theme}>
      <Box fill align="center" justify="center" pad="large" background="light-1">
        <Heading level="2" color="brand">Dodaj Nową Doniczkę</Heading>
        <Box width="large" pad="medium">
          <Form onSubmit={handleSubmit}>
            <Grid columns={['flex', 'flex']} gap="medium">
              <Box>
                <FormField label={<Box direction="row" gap="small" align="center"><Text>Nazwa Doniczki</Text><Tip content="Wprowadź unikalną nazwę dla swojej doniczki."><Help size="small" /></Tip></Box>}>
                  <TextInput placeholder="Wprowadź nazwę doniczki" value={formData.potName} onChange={(e) => setFormData({ ...formData, potName: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                </FormField>

                <FormField label={<Box direction="row" gap="small" align="center"><Text>Nazwa Kwiatka</Text><Tip content="Wprowadź nazwę kwiatka."><Help size="small" /></Tip></Box>}>
                  <TextInput placeholder="Wprowadź nazwę kwiatka" value={formData.flowerName} onChange={(e) => setFormData({ ...formData, flowerName: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                </FormField>

                <FormField label={<Box direction="row" gap="small" align="center"><Text>Ilość Wody (ml)</Text><Tip content="Podaj ilość wody w ml."><Help size="small" /></Tip></Box>}>
                  <TextInput placeholder="Ilość wody do podlania" value={formData.waterAmount} onChange={(e) => setFormData({ ...formData, waterAmount: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                </FormField>

                <FormField label="Jednostka Czasu Podlewania">
                  {!frequencyInputVisible ? (
                    <Select options={unitOptions} placeholder="Wybierz jednostkę" value={unit} onChange={({ option }) => handleUnitSelect(option)} />
                  ) : (
                    <Box direction="row" gap="small" align="center">
                      <TextInput placeholder={`Podaj wartość w ${unit.toLowerCase()}`} value={formData.wateringFrequency} onChange={(e) => setFormData({ ...formData, wateringFrequency: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                      <Button label="Anuluj" color="custom-cancel" onClick={handleCancelFrequencyInput} />
                    </Box>
                  )}
                </FormField>
              </Box>

              <Box>
                <FormField label={<Box direction="row" gap="small" align="center"><Text>Rozmiar Doniczki</Text><Tip content="Podaj rozmiar doniczki."><Help size="small" /></Tip></Box>}>
                  <TextInput placeholder="Mała, Średnia, Duża" value={formData.potSize} onChange={(e) => setFormData({ ...formData, potSize: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                </FormField>

                <FormField label={<Box direction="row" gap="small" align="center"><Text>Kształt Doniczki</Text><Tip content="Wybierz kształt doniczki."><Help size="small" /></Tip></Box>}>
                  <Select
                    options={shapeOptions}
                    labelKey="label"
                    valueKey="value"
                    value={shapeOptions.find(option => option.value === formData.shape)}
                    onChange={({ option }) => handleShapeChange(option)}
                  />
                </FormField>

                {formData.shape === 'cuboid' && (
                  <>
                    <FormField label="Wysokość (cm)">
                      <TextInput placeholder="Wysokość" value={formData.dimensions.height} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    </FormField>
                    <FormField label="Szerokość (cm)">
                      <TextInput placeholder="Szerokość" value={formData.dimensions.width} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    </FormField>
                    <FormField label="Głębokość (cm)">
                      <TextInput placeholder="Głębokość" value={formData.dimensions.depth} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, depth: e.target.value } })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    </FormField>
                  </>
                )}

                {formData.shape === 'cylinder' && (
                  <>
                    <FormField label="Wysokość (cm)">
                      <TextInput placeholder="Wysokość" value={formData.dimensions.height} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    </FormField>
                    <FormField label="Średnica (cm)">
                      <TextInput placeholder="Średnica" value={formData.dimensions.diameter} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, diameter: e.target.value } })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    </FormField>
                  </>
                )}
              </Box>
            </Grid>

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

export default LoggedAddPotPage;
