import React, { useEffect, useState, useCallback } from 'react';
import { Box, Table, TableHeader, TableRow, TableCell, TableBody, Heading, Button, Pagination  } from 'grommet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

const LoggedPotHistory = () => {
    const { potId } = useParams();
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    const [selectedViewCount, setSelectedViewCount] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 25;

    const fetchWateringHistory = useCallback(async () => {
        try {
            const response = await fetch(`https://flowersmanager.pl/api/users/me/pots/${potId}/watering?page=1&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error("Błąd pobierania historii podlewania:", error);
        }
    }, [potId]);

    useEffect(() => {
        fetchWateringHistory();
    }, [fetchWateringHistory]);

    const renderTable = () => {
      const paginatedData = history.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  
      return (
          <Box margin={{ top: '40px' }}> 
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableCell scope="col" border="bottom">Data</TableCell>
                          <TableCell scope="col" border="bottom">Ilość Wody (ml)</TableCell>
                          <TableCell scope="col" border="bottom">Wilgotność Gleby</TableCell>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedData.map((entry) => (
                          <TableRow key={entry._id}>
                              <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
                              <TableCell>{entry.waterAmount}</TableCell>
                              <TableCell>{entry.soilMoisture !== null ? `${entry.soilMoisture}%` : 'N/A'}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
              
              <Box align="center" margin={{ top: 'medium' }}> 
                  <Pagination
                      numberItems={history.length}
                      step={rowsPerPage}
                      page={currentPage}
                      onChange={({ page }) => setCurrentPage(page)}
                  />
              </Box>
          </Box>
      );
  };

    const renderChart = () => {
        const filteredData = history
            .slice(-selectedViewCount)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const dateFormatter = (date, index) => {
            const dateObj = new Date(date);
            if (selectedViewCount === 10 || (selectedViewCount === 25 && index % 2 === 0) || (selectedViewCount === 50 && index % 4 === 0)) {
                return dateObj.toLocaleDateString('pl-PL');
            }
            return '';
        };

        return (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={dateFormatter} />
                    <YAxis />
                    <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="waterAmount" stroke="#8884d8" name="Ilość Wody (ml)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="soilMoisture" stroke="#82ca9d" name="Wilgotność Gleby (%)" dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Box fill align="center" justify="start" pad="medium">
            <Heading level="2">Historia Podlewania dla Doniczki</Heading>
            <Box direction="row" gap="medium" margin={{ bottom: 'medium' }}>
                <Button label="Widok Tabeli" onClick={() => setViewMode('table')} primary={viewMode === 'table'} />
                <Button label="Widok Wykresu" onClick={() => setViewMode('chart')} primary={viewMode === 'chart'} />
                {viewMode === 'chart' && (
                    <>
                        <Button label="10 wyników" onClick={() => setSelectedViewCount(10)} primary={selectedViewCount === 10} />
                        <Button label="25 wyników" onClick={() => setSelectedViewCount(25)} primary={selectedViewCount === 25} />
                        <Button label="50 wyników" onClick={() => setSelectedViewCount(50)} primary={selectedViewCount === 50} />
                    </>
                )}
            </Box>
            {viewMode === 'table' ? renderTable() : renderChart()}
        </Box>
    );
};

export default LoggedPotHistory;
