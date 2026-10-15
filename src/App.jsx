import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import PaletteGenerator from './components/PaletteGenerator';
import ImageExtractor from './components/ImageExtractor';
import ContrastChecker from './components/ContrastChecker';
import Gallery from './components/Gallery';
import './App.css';

const tabs = [
  { id: 'generator', label: 'Generator' },
  { id: 'extract', label: 'From an image' },
  { id: 'contrast', label: 'Contrast' },
  { id: 'gallery', label: 'Gallery' },
];

function App() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="cp-app">
      <header className="wb-bar">
        <a className="wb-brand" href="/">
          <span className="wb-mark" aria-hidden="true"><Palette /></span>
          <span className="wb-brand-text">
            <span className="wb-brand-name">Colors</span>
            <span className="wb-brand-owner">Belal's tools</span>
          </span>
        </a>
        <nav className="wb-nav" aria-label="Sections" style={{ marginInlineStart: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="cp-main wb-page">
        {activeTab === 'generator' && <PaletteGenerator />}
        {activeTab === 'extract' && (
          <ImageExtractor onGoToGenerator={() => setActiveTab('generator')} />
        )}
        {activeTab === 'contrast' && <ContrastChecker />}
        {activeTab === 'gallery' && (
          <Gallery onGoToGenerator={() => setActiveTab('generator')} />
        )}
      </main>

      <footer className="wb-foot" style={{ width: '100%' }}>
        <span>Made by <a href="mailto:belalabukhadija97@gmail.com">Belal</a></span>
        <span>More free tools at <a href="https://belal.work" target="_blank" rel="noopener noreferrer">belal.work</a></span>
      </footer>
    </div>
  );
}

export default App;
