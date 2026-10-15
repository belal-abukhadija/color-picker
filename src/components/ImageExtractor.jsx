import React, { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { ImageUp, ArrowRight } from 'lucide-react';
import { usePalette } from '../context/PaletteContext';
import chroma from 'chroma-js';

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
        handleImageUpload(e.dataTransfer.files[0]);
    };

    const extractColors = () => {
        if (imgRef.current && imgRef.current.complete) {
            try {
                // Five dominant colours
                const colors = new ColorThief().getPalette(imgRef.current, 5);
                setExtractedColors(colors.map(rgb => chroma(rgb).hex()));
            } catch (err) {
                console.error('Extraction failed', err);
            }
        }
    };

    const handleUsePalette = () => {
        const newPalette = extractedColors.map((hex) => ({
            id: crypto.randomUUID(),
            hex,
            locked: false,
        }));
        // Fill to 5 if fewer came back
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
        <div>
            <div className="wb-head">
                <h1 className="wb-title">Colours from an image</h1>
                <p className="wb-lede">Drop in a photo or a screenshot and get its five dominant colours as a palette.</p>
            </div>

            <div className="cp-extract">
                {!imageSrc ? (
                    <div
                        className={`wb-drop${isDragging ? ' is-over' : ''}`}
                        style={{ minHeight: 360 }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <span className="wb-drop-icon"><ImageUp /></span>
                        <p className="wb-drop-title">Drop an image here</p>
                        <p className="wb-drop-hint">or click to choose one. Nothing is uploaded.</p>
                        <input
                            type="file"
                            accept="image/*"
                            aria-label="Choose an image"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                        />
                    </div>
                ) : (
                    <div
                        className="cp-preview"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="The image colours were taken from"
                            crossOrigin="anonymous"
                            onLoad={extractColors}
                        />
                        <span className="wb-btn wb-btn--sm" role="button">
                            Change image
                            <input
                                type="file"
                                accept="image/*"
                                aria-label="Choose another image"
                                onChange={(e) => handleImageUpload(e.target.files[0])}
                            />
                        </span>
                    </div>
                )}

                <section className="wb-panel wb-stack" aria-labelledby="extracted-title">
                    <h2 id="extracted-title" className="wb-h2">Extracted palette</h2>
                    {extractedColors.length > 0 ? (
                        <>
                            <div className="cp-strip">
                                {extractedColors.map((hex, i) => (
                                    <div key={i} style={{ backgroundColor: hex, color: chroma.contrast(hex, 'white') > 4.5 ? '#fff' : '#000' }}>
                                        {hex.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <button className="wb-btn wb-btn--primary wb-btn--block" onClick={handleUsePalette}>
                                Open in generator <ArrowRight />
                            </button>
                        </>
                    ) : (
                        <p className="wb-note" style={{ margin: 0 }}>The colours appear here once an image is loaded.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ImageExtractor;
