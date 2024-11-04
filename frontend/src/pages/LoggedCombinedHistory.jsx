import React, { useEffect, useState } from 'react';
import { Box, Table, TableHeader, TableRow, TableCell, TableBody, Heading, Pagination } from 'grommet';

const LoggedCombinedHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    fetchHistoryData(currentPage);
  }, [currentPage]);

  const fetchHistoryData = async (page) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/watering-history?page=${page}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log("Otrzymane dane z backendu:", data);  // Logowanie danych
      if (data.success) {
        setHistoryData(data.data);
        setTotalPages(Math.ceil(data.totalCount / rowsPerPage));
      }
    } catch (error) {
      console.error("Błąd pobierania historii podlewania:", error);
    }
  };

  return (
    <Box fill align="center" justify="start" pad="medium">
      <Heading level="2">Historia Podlewania</Heading>
      <Box width="large" overflow="auto" pad="small" border={{ color: 'light-4', size: 'xsmall' }} round="small">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell scope="col" border="bottom">Doniczka</TableCell>
            <TableCell scope="col" border="bottom">Data</TableCell>
            <TableCell scope="col" border="bottom">Ilość Wody (ml)</TableCell>
            <TableCell scope="col" border="bottom">Wilgotność Gleby (%)</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyData.map((entry) => (
            <TableRow key={entry._id}>
              <TableCell>{entry.potName || 'N/A'}</TableCell> {/* Wyświetlanie nazwy doniczki */}
              <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
              <TableCell>{entry.waterAmount}</TableCell>
              <TableCell>{entry.soilMoisture !== null ? entry.soilMoisture : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Box>
      <Pagination
        numberItems={totalPages * rowsPerPage}
        step={rowsPerPage}
        onChange={({ page }) => setCurrentPage(page)}
        page={currentPage}
      />
    </Box>
  );
};

export default LoggedCombinedHistory;
