import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Form, FormField, TextInput, Select, Heading, Text } from 'grommet';
import { useParams, useNavigate } from 'react-router-dom';

const shapeOptions = [
  { label: 'Prostopadłościan', value: 'cuboid' },
  { label: 'Walec', value: 'cylinder' }
];

const EditPot = () => {
  const { potId } = useParams();
  const [formData, setFormData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOverrideButton, setShowOverrideButton] = useState(false);
  const [isWaterLimitIgnored, setIsWaterLimitIgnored] = useState(false);
  const [waterLimit, setWaterLimit] = useState(null);
  const navigate = useNavigate();
  const SERVER = process.env.SERVER;

  const fetchPotDetails = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER}/api/users/me/pots/${potId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów doniczki:', error);
    }
  }, [potId]);

  useEffect(() => {
    fetchPotDetails();
  }, [fetchPotDetails]);

  const calculateWaterLimit = useCallback(() => {
    const { height, width, depth, diameter } = formData?.dimensions || {};
    let volume;

    if (formData?.shape === 'cuboid' && height && width && depth) {
      volume = height * width * depth;
    } else if (formData?.shape === 'cylinder' && height && diameter) {
      volume = Math.PI * Math.pow(diameter / 2, 2) * height;
    }

    return volume ? (volume * 2) / 5 : null;
  }, [formData]);

  useEffect(() => {
    if (formData) {
      setWaterLimit(calculateWaterLimit());
    }
  }, [formData, calculateWaterLimit]);

  const handleWaterAmountChange = (value) => {
    const waterAmount = parseInt(value, 10);

    if (isNaN(waterAmount)) {
      setFormData({ ...formData, waterAmount: '' });
      return;
    }

    if (waterLimit && waterAmount > waterLimit && !isWaterLimitIgnored) {
      setShowOverrideButton(true);
    } else {
      setShowOverrideButton(false);
    }

    setFormData({ ...formData, waterAmount });
  };

  const handleOverrideLimit = () => {
    setIsWaterLimitIgnored(true);
    setShowOverrideButton(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${SERVER}/api/users/me/pots/${potId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/pot/${potId}`);
      } else {
        setErrorMessage('Nie udało się zaktualizować doniczki.');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji doniczki:', error);
    }
  };

  const handleChange = (field, value) => {
    const updatedFormData = { ...formData };

    if (field.includes('dimensions')) {
      const dimensionField = field.split('.')[1];
      updatedFormData.dimensions[dimensionField] = parseInt(value, 10) || '';
    } else {
      updatedFormData[field] = value;
    }

    setFormData(updatedFormData);
  };

  return (
    <Box fill align="center" justify="start" pad="medium" background="light-2">
      {formData ? (
        <Box width="medium">
          <Heading level="3">Edytuj Parametry Doniczki</Heading>
          <Form onSubmit={handleSubmit}>
            <FormField label="Nazwa Doniczki">
              <TextInput
                value={formData.potName}
                onChange={(e) => handleChange('potName', e.target.value)}
              />
            </FormField>
            <FormField label="Kwiat">
              <TextInput
                value={formData.flowerName}
                onChange={(e) => handleChange('flowerName', e.target.value)}
              />
            </FormField>
            <FormField label="Rozmiar Doniczki">
              <TextInput
                value={formData.potSize}
                onChange={(e) => handleChange('potSize', e.target.value)}
              />
            </FormField>
            <FormField label="Kształt Doniczki">
              <Select
                options={shapeOptions}
                labelKey="label"
                valueKey="value"
                value={shapeOptions.find((option) => option.value === formData.shape)}
                onChange={({ option }) => handleChange('shape', option.value)}
              />
            </FormField>
            <FormField label="Wysokość (cm)">
              <TextInput
                value={formData.dimensions.height || ''}
                onChange={(e) => handleChange('dimensions.height', e.target.value)}
              />
            </FormField>
            {formData.shape === 'cuboid' && (
              <>
                <FormField label="Szerokość (cm)">
                  <TextInput
                    value={formData.dimensions.width || ''}
                    onChange={(e) => handleChange('dimensions.width', e.target.value)}
                  />
                </FormField>
                <FormField label="Głębokość (cm)">
                  <TextInput
                    value={formData.dimensions.depth || ''}
                    onChange={(e) => handleChange('dimensions.depth', e.target.value)}
                  />
                </FormField>
              </>
            )}
            {formData.shape === 'cylinder' && (
              <FormField label="Średnica (cm)">
                <TextInput
                  value={formData.dimensions.diameter || ''}
                  onChange={(e) => handleChange('dimensions.diameter', e.target.value)}
                />
              </FormField>
            )}
            <FormField label="Ilość Wody (ml)">
              <TextInput
                value={formData.waterAmount || ''}
                onChange={(e) => handleWaterAmountChange(e.target.value)}
              />
            </FormField>
            {showOverrideButton && (
              <Box align="center" margin={{ top: 'small' }}>
                <Text color="status-critical">Przekroczono limit wody! Możliwe przelanie rośliny.</Text>
                <Button
                  label="Zignoruj Limit"
                  onClick={handleOverrideLimit}
                  margin={{ top: 'small' }}
                />
              </Box>
            )}
            <FormField label="Częstotliwość Podlewania (dni)">
              <TextInput
                value={formData.wateringFrequency}
                onChange={(e) => handleChange('wateringFrequency', e.target.value)}
              />
            </FormField>
            <Button type="submit" label="Zapisz Zmiany" primary margin={{ top: 'medium' }} />
          </Form>
          {errorMessage && <Text color="status-critical">{errorMessage}</Text>}
        </Box>
      ) : (
        <Text>Ładowanie szczegółów doniczki...</Text>
      )}
    </Box>
  );
};

export default EditPot;
