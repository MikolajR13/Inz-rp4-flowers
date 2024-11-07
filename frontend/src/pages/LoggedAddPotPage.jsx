import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Form, FormField, TextInput, Select, Text, Grid, Grommet } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { usePlantData } from '../context/PlantDataContext'; // Import kontekstu


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
const unitOptions = ['Godziny', 'Dni'];

const LoggedAddPotPage = () => {
  const { plantData, setPlantData } = usePlantData(); // Użycie kontekstu
  const [formData, setFormData] = useState({
    potName: '',
    flowerName: plantData ? plantData.nazwa : '', // Ustawienie nazwy kwiatka z kontekstu
    waterAmount: '',
    wateringFrequency: '',
    potSize: '',
    shape: 'cuboid',
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
  const [waterLimitExceeded, setWaterLimitExceeded] = useState(false);
  const [ignoreWaterLimit, setIgnoreWaterLimit] = useState(false);
  const [potLimitReached, setPotLimitReached] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (plantData && plantData.nazwa) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        flowerName: plantData.nazwa // Aktualizacja flowerName z kontekstu
      }));
    }

    const fetchPotCount = async () => {
      try {
        const response = await fetch(`${SERVER}/api/users/me/pots`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          if (data.data.length >= 3) {
            setPotLimitReached(true);
            setErrorMessage('Osiągnięto maksymalną liczbę doniczek (3).');
          }
        }
      } catch (error) {
        setErrorMessage('Błąd podczas sprawdzania liczby doniczek.');
      }
    };

    fetchPotCount();
  }, [plantData]);

  const calculateWaterLimit = () => {
    const { height, width, depth, diameter } = formData.dimensions;
    let volume;

    if (formData.shape === 'cuboid' && height && width && depth) {
      volume = height * width * depth;
    } else if (formData.shape === 'cylinder' && height && diameter) {
      volume = Math.PI * Math.pow(diameter / 2, 2) * height;
    }

    return volume ? (volume * 2) / 5 : null;
  };

  const checkWaterLimit = () => {
    const waterLimit = calculateWaterLimit();
    const waterAmount = parseInt(formData.waterAmount, 10);

    if (waterLimit && waterAmount > waterLimit && !ignoreWaterLimit) {
      setWaterLimitExceeded(true);
    } else {
      setWaterLimitExceeded(false);
    }
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

  const handleWaterAmountChange = (value) => {
    const waterAmount = parseInt(value, 10);
    setFormData({ ...formData, waterAmount: isNaN(waterAmount) ? '' : waterAmount });
    checkWaterLimit();
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData((prevData) => ({
      ...prevData,
      dimensions: { ...prevData.dimensions, [dimension]: parseInt(value, 10) || '' }
    }));
    checkWaterLimit();
  };

  const handleShapeChange = (selectedOption) => {
    setFormData({
      ...formData,
      shape: selectedOption.value,
      dimensions: { height: '', width: '', depth: '', diameter: '' }
    });
    setIgnoreWaterLimit(false);
    setWaterLimitExceeded(false);
  };

  const validateForm = () => {
    if (!formData.potName || !formData.flowerName || !formData.waterAmount || !formData.wateringFrequency || !formData.potSize) {
      setErrorMessage('Proszę wypełnić wszystkie wymagane pola.');
      return false;
    }

    if (!Number.isInteger(parseInt(formData.waterAmount)) || !Number.isInteger(parseInt(formData.wateringFrequency))) {
      setErrorMessage('Ilość wody i częstotliwość podlewania muszą być liczbami całkowitymi.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (potLimitReached) return;

    if (!validateForm()) return;

    try {
      const response = await fetch(`${SERVER}/api/users/me/pots`, {
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
          setPlantData(null); // Resetujemy kontekst po dodaniu doniczki
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
        <Heading level="2" color="brand">Dodaj Nową Doniczkę</Heading>
        <Box width="large" pad="medium">
          <Form onSubmit={handleSubmit}>
            <Grid columns={['flex', 'flex']} gap="medium">
              <Box>
                <FormField label="Nazwa Doniczki">
                  <TextInput
                    placeholder="Wprowadź nazwę doniczki"
                    value={formData.potName}
                    onChange={(e) => setFormData({ ...formData, potName: e.target.value })}
                  />
                </FormField>

                <FormField label="Nazwa Kwiatka">
                  <TextInput
                    placeholder="Wprowadź nazwę kwiatka"
                    value={formData.flowerName}
                    onChange={(e) => setFormData({ ...formData, flowerName: e.target.value })}
                  />
                </FormField>

                <FormField label="Ilość Wody (ml)">
                  <TextInput
                    placeholder="Ilość wody do podlania"
                    value={formData.waterAmount}
                    onChange={(e) => handleWaterAmountChange(e.target.value)}
                  />
                </FormField>

                {waterLimitExceeded && !ignoreWaterLimit && (
                  <Box pad="small" background="status-error" align="center">
                    <Text color="white">Przekroczono limit wody! Możliwe przelanie rośliny.</Text>
                    <Button label="Zignoruj Limit" onClick={() => setIgnoreWaterLimit(true)} color="light-1" />
                  </Box>
                )}

                <FormField label="Jednostka Czasu Podlewania">
                  {!frequencyInputVisible ? (
                    <Select options={unitOptions} placeholder="Wybierz jednostkę" value={unit} onChange={({ option }) => handleUnitSelect(option)} />
                  ) : (
                    <Box direction="row" gap="small" align="center">
                      <TextInput
                        placeholder={`Podaj wartość w ${unit.toLowerCase()}`}
                        value={formData.wateringFrequency}
                        onChange={(e) => setFormData({ ...formData, wateringFrequency: e.target.value })}
                      />
                      <Button label="Anuluj" color="custom-cancel" onClick={handleCancelFrequencyInput} />
                    </Box>
                  )}
                </FormField>
              </Box>

              <Box>
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

                {formData.shape === 'cuboid' && (
                  <>
                    <FormField label="Wysokość (cm)">
                      <TextInput
                        placeholder="Wysokość"
                        value={formData.dimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                      />
                    </FormField>
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
                  <>
                    <FormField label="Wysokość (cm)">
                      <TextInput
                        placeholder="Wysokość"
                        value={formData.dimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Średnica (cm)">
                      <TextInput
                        placeholder="Średnica"
                        value={formData.dimensions.diameter}
                        onChange={(e) => handleDimensionChange('diameter', e.target.value)}
                      />
                    </FormField>
                  </>
                )}
              </Box>
            </Grid>

            <Box direction="row" justify="between" margin={{ top: 'medium' }}>
              <Button type="submit" label="Dodaj Doniczkę" primary disabled={potLimitReached} />
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
