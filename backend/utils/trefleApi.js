import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();


const TREFLE_API_URL = 'http://trefle.io/api/v1/species/search';
const API_KEY = process.env.TREFLE_API_KEY;

export const fetchPlantData = async (query) => {
  if (!query) {
      throw new Error("Brak parametru wyszukiwania 'query'");
  }
  try {
      const response = await axios.get('http://trefle.io/api/v1/species/search', {
          params: {
              q: query,
              token: process.env.TREFLE_API_KEY
          }
      });
      console.log("zapytanie", response)
      return response.data;
  } catch (error) {
      console.error("Błąd podczas pobierania danych z Trefle API:", error);
      throw error;
  }
};