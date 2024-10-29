import React, { useEffect, useState } from 'react';
import { Box, Table, TableHeader, TableRow, TableCell, TableBody, Heading, Pagination, Button } from 'grommet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoggedCombinedHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const rowsPerPage = 25;

  useEffect(() => {
    fetchHistoryData(currentPage);
  }, [currentPage]);

  const fetchHistoryData = async (page) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/pots/watering-history?page=${page}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistoryData(data.data);
        setTotalPages(Math.ceil(data.totalCount / rowsPerPage));
      }
    } catch (error) {
      console.error("Błąd pobierania historii podlewania:", error);
    }
  };

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" border="bottom">Data</TableCell>
          <TableCell scope="col" border="bottom">Ilość Wody (ml)</TableCell>
          <TableCell scope="col" border="bottom">Wilgotność Gleby</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historyData.map((entry) => (
          <TableRow key={entry._id}>
            <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
            <TableCell>{entry.waterAmount}</TableCell>
            <TableCell>{entry.soilMoisture !== null ? entry.soilMoisture : 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={historyData.sort((a, b) => new Date(b.date) - new Date(a.date))}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
        <YAxis />
        <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
        <Legend />
        <Line type="monotone" dataKey="waterAmount" stroke="#8884d8" name="Ilość Wody (ml)" />
        <Line type="monotone" dataKey="soilMoisture" stroke="#82ca9d" name="Wilgotność Gleby (%)" />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Box fill align="center" justify="start" pad="medium">
      <Heading level="2">Historia Podlewania</Heading>
      <Box direction="row" gap="small" margin={{ bottom: 'medium' }}>
        <Button label="Widok Tabeli" onClick={() => setViewMode('table')} primary={viewMode === 'table'} />
        <Button label="Widok Wykresu" onClick={() => setViewMode('chart')} primary={viewMode === 'chart'} />
      </Box>
      {viewMode === 'table' ? renderTable() : renderChart()}
      {viewMode === 'table' && (
        <Pagination
          numberItems={totalPages * rowsPerPage}
          step={rowsPerPage}
          onChange={({ page }) => setCurrentPage(page)}
          page={currentPage}
        />
      )}
    </Box>
  );
};

export default LoggedCombinedHistory;
