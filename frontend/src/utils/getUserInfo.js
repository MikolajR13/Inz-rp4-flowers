import { jwtDecode } from 'jwt-decode';

export const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return {
      id: decodedToken.id 
    };
  } catch (error) {
    console.error('Błąd dekodowania tokena:', error);
    return null;
  }
};
