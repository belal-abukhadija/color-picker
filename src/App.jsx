import React, { useState } from 'react';
import PaletteGenerator from './components/PaletteGenerator';
import ImageExtractor from './components/ImageExtractor';
import ContrastChecker from './components/ContrastChecker';
import Gallery from './components/Gallery';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="app-container">
      <header className="navbar glass">
        <div className="logo">

          <h1>Colors Tool</h1>
        </div>
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            Generator
          </button>
          <button
            className={`nav-btn ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => setActiveTab('extract')}
          >
            Extract Image
          </button>
          <button
            className={`nav-btn ${activeTab === 'contrast' ? 'active' : ''}`}
            onClick={() => setActiveTab('contrast')}
          >
            Contrast Checker
          </button>
          <button
            className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'generator' && (
          <PaletteGenerator />
        )}
        {activeTab === 'extract' && (
          <ImageExtractor onGoToGenerator={() => setActiveTab('generator')} />
        )}
        {activeTab === 'contrast' && (
          <ContrastChecker />
        )}
        {activeTab === 'gallery' && (
          <Gallery onGoToGenerator={() => setActiveTab('generator')} />
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>
            Made with ❤️ by <a href="mailto:belalabukhadija97@gmail.com" className="author-link">Belal</a>
          </p>
          <p className="promo-text">
            For more free tools visit my main website:{' '}
            <a href="https://belal.work" target="_blank" rel="noopener noreferrer" className="main-site-link">
              belal.work
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
