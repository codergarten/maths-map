import React from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Maths Map: #root not found');
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
