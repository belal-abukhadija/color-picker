import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/wb.css';
import './index.css';
import App from './App.jsx';
import { PaletteProvider } from './context/PaletteContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PaletteProvider>
      <App />
    </PaletteProvider>
  </StrictMode>
);
