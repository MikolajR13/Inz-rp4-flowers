import React, { useState } from 'react';
import { Box, Button, Heading, FormField, TextInput, Text, Image, Grommet, Spinner } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { usePlantData } from '../context/PlantDataContext.js';

const SERVER = process.env.REACT_APP_SERVER;

const theme = {
  global: {
    colors: {
      'custom-dark-green': '#006400',
      'custom-cancel': '#FF4040'
    }
  }
};

const LoggedPotSearchPage = () => {
  const [flowerNamePL, setFlowerNamePL] = useState('');
  const [flowerNameLAT, setFlowerNameLAT] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { plantData, setPlantData } = usePlantData();
  const navigate = useNavigate();

  const handleSearchFlower = async () => {
    setLoadingSearch(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${SERVER}/api/users/me/pots?query=${flowerNameLAT}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
      setLoadingSearch(false);
  
      if (data.success) {
        setPlantData(data.data[0]); // Ustawiamy dane rośliny w kontekście
      } else {
        setErrorMessage('Nie znaleziono rośliny w bazie danych.');
      }
    } catch (error) {
      setLoadingSearch(false);
      console.error('Błąd podczas pobierania danych rośliny:', error);
      setErrorMessage('Błąd podczas pobierania danych rośliny.');
    }
  };

  return (
    <Grommet theme={theme}>
      <Box fill align="center" justify="center" pad="large" background="light-1">
        <Heading level="2" color="brand">Dodaj Nową Doniczkę - Wyszukiwanie Kwiatka</Heading>
        <Box width="medium" pad="medium" gap="small">
          <FormField label="Nazwa Kwiatka (PL)">
            <TextInput placeholder="Wprowadź nazwę kwiatka" value={flowerNamePL} onChange={(e) => setFlowerNamePL(e.target.value)} />
          </FormField>
          <FormField label="Nazwa Kwiatka (łacińska)">
            <TextInput placeholder="Wprowadź nazwę naukową" value={flowerNameLAT} onChange={(e) => setFlowerNameLAT(e.target.value)} />
          </FormField>
          <Button label="Szukaj Kwiatka" onClick={handleSearchFlower} primary />

          {loadingSearch && <Spinner />}

          {errorMessage && (
            <Box pad="medium" gap="small" align="center">
              <Text color="status-error">{errorMessage}</Text>
              <Box direction="row" gap="small">
                <Button label="Spróbuj Ponownie" onClick={() => handleSearchFlower()} />
                <Button label="Dodaj Ręcznie" onClick={() => navigate('/add-pot-manual')} color="custom-cancel" />
              </Box>
            </Box>
          )}

          {/* Sprawdzenie, czy dane rośliny są dostępne */}
          {plantData ? (
            <Box pad="medium" gap="small">
              <Heading level="3" margin="none">Znaleziono Kwiatek</Heading>
              {plantData.url_zdjecia && <Image src={plantData.url_zdjecia} alt="Obraz kwiata" width="100%" />}
              
              {/* Wyświetlanie informacji o kwiatach */}
              <Text>Nazwa: {plantData.nazwa}</Text>
              <Text>Typ drzewa: {plantData.typ_drzewa}</Text>
              <Text>Forma wzrostu: {plantData.forma_wzrostu}</Text>
              <Text>Nawyk wzrostu: {plantData.nawyk_wzrostu}</Text>
              <Text>Tempo wzrostu: {plantData.tempo_wzrostu}</Text>
              <Text>Średnia wysokość: {plantData.srednia_wysokosc}</Text>
              <Text>Maksymalna wysokość: {plantData.maksymalna_wysokosc}</Text>
              <Text>Orientacja: {plantData.orientacja}</Text>
              <Text>Toksyczność: {plantData.toksycznosc}</Text>
              <Text>Dni do zbioru: {plantData.dni_do_zbioru}</Text>
              <Text>Opis: {plantData.opis}</Text>
              <Text>Zasiew: {plantData.zasiew}</Text>
              <Text>pH min: {plantData.ph_min}</Text>
              <Text>pH max: {plantData.ph_max}</Text>
              <Text>Światło: {plantData.swiatlo}</Text>
              <Text>Wilgotność powietrza: {plantData.wilgotnosc_powietrza}</Text>
              <Text>Miesiące wzrostu: {plantData.miesiace_wzrostu}</Text>
              <Text>Miesiące kwitnienia: {plantData.miesiace_kwitnienia}</Text>
              <Text>Miesiące owocowania: {plantData.miesiace_owocowania}</Text>
              <Text>Minimalne opady: {plantData.minimalne_opady}</Text>
              <Text>Maksymalne opady: {plantData.maksymalne_opady}</Text>
              <Text>Minimalna temperatura: {plantData.minimalna_temperatura}</Text>
              <Text>Maksymalna temperatura: {plantData.maksymalna_temperatura}</Text>
              <Text>Wilgotność gleby: {plantData.wilgotnosc_gleby}</Text>
              <Text>Wartości odżywcze gleby: {plantData.wartosci_odzywcze_gleby}</Text>
              <Text>Zasolenie gleby: {plantData.zasolenie_gleby}</Text>
              <Text>Tekstura gleby: {plantData.tekstura_gleby}</Text>

              <Box direction="row" gap="small">
                <Button label="Autopodlewanie" onClick={() => navigate(`/add-pot-auto`)} />
                <Button label="Własne Parametry" onClick={() => navigate(`/add-pot-manual`)} />
              </Box>
            </Box>
          ) : (
            <Text>Wprowadź nazwę kwiata i kliknij "Szukaj Kwiatka", aby wyszukać informacje.</Text>
          )}
        </Box>
      </Box>
    </Grommet>
  );
};

export default LoggedPotSearchPage;
