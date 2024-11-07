import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

export const translateText = async (text, targetLang = 'PL') => {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `DeepL-Auth-Key ${process.env.TRANSLATE_API}`
    },
    body: new URLSearchParams({
      text: text,
      target_lang: targetLang
    })
  });
  const data = await response.json();
  return data.translations[0].text;
};

