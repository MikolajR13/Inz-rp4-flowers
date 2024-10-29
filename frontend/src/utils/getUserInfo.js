import {jwtDecode} from 'jwt-decode';

export const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return {
      id: decodedToken.id,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Błąd dekodowania tokena:', error);
    return null;
  }
};
