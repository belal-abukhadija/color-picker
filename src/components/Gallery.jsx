import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { ArrowRight, Trash2 } from 'lucide-react';
import './Gallery.css';

const TRENDING_PALETTES = [
    ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'],
    ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
    ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'],
    ['#ff9f1c', '#ffbf69', '#ffffff', '#cbf3f0', '#2ec4b6'],
    ['#03045e', '#023e8a', '#0077b6', '#00b4d8', '#90e0ef'],
];

const Gallery = ({ onGoToGenerator }) => {
    const { savedPalettes, setFullPalette, deleteSavedPalette } = usePalette();

    const handleUsePalette = (hexArray) => {
        const newPalette = hexArray.map(hex => ({
            id: crypto.randomUUID(),
            hex,
            locked: false,
        }));
        setFullPalette(newPalette);
        onGoToGenerator();
    };

    const renderPaletteCard = (colors, title, id = null) => (
        <div className="gallery-card" key={id || colors.join('')}>
            <div className="card-swatches" onClick={() => handleUsePalette(colors)}>
                {colors.map((hex, i) => (
                    <div key={i} className="card-swatch" style={{ backgroundColor: hex }}></div>
                ))}
                <div className="card-overlay">
                    <span>Use Palette <ArrowRight size={16} /></span>
                </div>
            </div>
            <div className="card-footer">
                <span className="card-title">{title}</span>
                {id && (
                    <button
                        className="delete-saved-btn"
                        onClick={() => deleteSavedPalette(id)}
                        title="Remove from saved"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h2>Inspiration Gallery & Saved</h2>
                <p className="hint">Discover trending palettes or access your saved collections.</p>
            </div>

            {savedPalettes && savedPalettes.length > 0 && (
                <section className="gallery-section">
                    <h3>Your Saved Palettes</h3>
                    <div className="gallery-grid">
                        {savedPalettes.map(sp => renderPaletteCard(sp.colors, sp.name, sp.id))}
                    </div>
                </section>
            )}

            <section className="gallery-section">
                <h3>Trending Now</h3>
                <div className="gallery-grid">
                    {TRENDING_PALETTES.map((colors, idx) =>
                        renderPaletteCard(colors, `Trending Palette #${idx + 1}`)
                    )}
                </div>
            </section>
        </div>
    );
};

export default Gallery;
