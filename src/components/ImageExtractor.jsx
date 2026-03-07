import React, { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { Upload, ArrowRight } from 'lucide-react';
import { usePalette } from '../context/PaletteContext';
import chroma from 'chroma-js';
import './ImageExtractor.css';

const ImageExtractor = ({ onGoToGenerator }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [extractedColors, setExtractedColors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const { setFullPalette } = usePalette();
    const imgRef = useRef(null);

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setImageSrc(url);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const extractColors = () => {
        if (imgRef.current) {
            const colorThief = new ColorThief();
            if (imgRef.current.complete) {
                try {
                    // Get 5 dominant colors
                    const colors = colorThief.getPalette(imgRef.current, 5);
                    const hexColors = colors.map(rgb => chroma(rgb).hex());
                    setExtractedColors(hexColors);
                } catch (err) {
                    console.error("Extraction failed", err);
                }
            }
        }
    };

    const handleUsePalette = () => {
        const newPalette = extractedColors.map((hex) => ({
            id: crypto.randomUUID(),
            hex,
            locked: false,
        }));
        // Fill to 5 if less than 5
        while (newPalette.length < 5) {
            newPalette.push({
                id: crypto.randomUUID(),
                hex: chroma.random().hex(),
                locked: false,
            });
        }
        setFullPalette(newPalette.slice(0, 5));
        if (onGoToGenerator) onGoToGenerator();
    };

    return (
        <div className="extractor-container">
            <div className="extractor-header">
                <h2>Extract Colors from Image</h2>
                <p className="hint">Upload any image to generate a beautiful palette instantly.</p>
            </div>

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''} ${imageSrc ? 'has-image' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {!imageSrc ? (
                    <div className="dropzone-content">
                        <Upload size={48} className="upload-icon" />
                        <h3>Drag & drop an image here</h3>
                        <p>or click to browse from your device</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="file-input"
                        />
                    </div>
                ) : (
                    <div className="preview-container">
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Preview"
                            crossOrigin="anonymous"
                            onLoad={extractColors}
                        />
                        <button className="change-img-btn">
                            Change Image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files[0])}
                                className="file-input"
                            />
                        </button>
                    </div>
                )}
            </div>

            {extractedColors.length > 0 && (
                <div className="extracted-palette-section">
                    <h3>Extracted Palette</h3>
                    <div className="extracted-swatches">
                        {extractedColors.map((hex, i) => (
                            <div key={i} className="mini-swatch" style={{ backgroundColor: hex }}>
                                <span style={{ color: chroma.contrast(hex, 'white') > 4.5 ? '#fff' : '#000' }}>
                                    {hex.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="primary-btn use-palette-btn" onClick={handleUsePalette}>
                        Use in Generator <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageExtractor;
