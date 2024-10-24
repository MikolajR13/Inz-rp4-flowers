import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Grommet } from 'grommet';
import customTheme from './styles/theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Grommet theme={customTheme} full>
    <App />
  </Grommet>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
