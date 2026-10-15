import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { Trash2 } from 'lucide-react';

const TRENDING_PALETTES = [
    { name: 'Desert road', colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'] },
    { name: 'Harbour flags', colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'] },
    { name: 'Sugared almonds', colors: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'] },
    { name: 'Lifeguard tower', colors: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'] },
    { name: 'Citrus and mint', colors: ['#ff9f1c', '#ffbf69', '#ffffff', '#cbf3f0', '#2ec4b6'] },
    { name: 'Deep water', colors: ['#03045e', '#023e8a', '#0077b6', '#00b4d8', '#90e0ef'] },
];

const Gallery = ({ onGoToGenerator }) => {
    const { savedPalettes, setFullPalette, deleteSavedPalette } = usePalette();

    const handleUsePalette = (hexArray) => {
        setFullPalette(hexArray.map(hex => ({
            id: crypto.randomUUID(),
            hex,
            locked: false,
        })));
        onGoToGenerator();
    };

    const renderPalette = (colors, title, id = null) => (
        <div className="cp-palette" key={id || colors.join('')}>
            <button
                className="cp-palette-swatches"
                onClick={() => handleUsePalette(colors)}
                aria-label={`Open ${title} in the generator`}
                title="Open in generator"
            >
                {colors.map((hex, i) => (
                    <span key={i} style={{ backgroundColor: hex }} />
                ))}
            </button>
            <div className="cp-palette-foot">
                <span style={{ fontWeight: 500 }}>{title}</span>
                {id && (
                    <button
                        className="wb-btn wb-btn--danger wb-btn--icon wb-btn--sm"
                        onClick={() => deleteSavedPalette(id)}
                        title="Remove from saved"
                        aria-label={`Remove ${title}`}
                    >
                        <Trash2 />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="wb-stack" style={{ gap: 'var(--wb-s7)' }}>
            <div className="wb-head" style={{ paddingBottom: 0 }}>
                <h1 className="wb-title">Gallery</h1>
                <p className="wb-lede">Click any palette to open it in the generator.</p>
            </div>

            <section className="wb-stack">
                <h2 className="wb-h2">Your saved palettes</h2>
                {savedPalettes && savedPalettes.length > 0 ? (
                    <div className="cp-gallery">
                        {savedPalettes.map(sp => renderPalette(sp.colors, sp.name, sp.id))}
                    </div>
                ) : (
                    <div className="wb-empty">
                        <strong>Nothing saved yet</strong>
                        <span>Press Save in the generator and the palette lands here.</span>
                    </div>
                )}
            </section>

            <section className="wb-stack">
                <h2 className="wb-h2">To start from</h2>
                <div className="cp-gallery">
                    {TRENDING_PALETTES.map((p) => renderPalette(p.colors, p.name))}
                </div>
            </section>
        </div>
    );
};

export default Gallery;
