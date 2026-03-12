import React, { useEffect, useState, useRef } from 'react';
import { usePalette } from '../context/PaletteContext';
import ColorSwatch from './ColorSwatch';
import { getContrastText, getFormats } from '../utils/colorUtils';
import { RefreshCw, Save, Download, Check, Image as ImageIcon, Code, FileJson, Wind } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import './PaletteGenerator.css';

const PaletteGenerator = () => {
    const { palette, generateNewColors, reorderPalette, harmonyMode, setHarmonyMode, saveCurrentPalette, colorCount, setColorCount } = usePalette();
    const [showExport, setShowExport] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const exportRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                generateNewColors();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [generateNewColors]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setShowExport(false);
            }
        };
        if (showExport) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExport]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = palette.findIndex((c) => c.id === active.id);
            const newIndex = palette.findIndex((c) => c.id === over.id);
            reorderPalette(oldIndex, newIndex);
        }
    };

    const handleSave = () => {
        saveCurrentPalette(`Palette ${Math.floor(Math.random() * 1000)}`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied to clipboard!`);
        setShowExport(false);
    };

    const exportCSS = () => {
        const vars = palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
        copyToClipboard(`:root {\n${vars}\n}`, 'CSS variables');
    };

    const exportJSON = () => {
        copyToClipboard(JSON.stringify(palette.map(c => c.hex), null, 2), 'JSON array');
    };

    const exportTailwind = () => {
        const tailwindColors = palette.reduce((acc, c, i) => {
            acc[`primary-${i + 1}`] = c.hex;
            return acc;
        }, {});

        const config = {
            theme: {
                extend: {
                    colors: tailwindColors,
                },
            },
        };
        copyToClipboard(`module.exports = ${JSON.stringify(config, null, 2)}`, 'Tailwind CSS config');
    };

    const exportImage = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1200;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        const swatchWidth = width / palette.length;

        palette.forEach((color, i) => {
            const formats = getFormats(color.hex);
            const textColor = getContrastText(color.hex);

            // Draw swatch
            ctx.fillStyle = color.hex;
            ctx.fillRect(i * swatchWidth, 0, swatchWidth, height);

            // Draw text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Hex
            ctx.fillStyle = textColor;
            ctx.font = '700 64px "Kalam", cursive';
            const centerX = i * swatchWidth + swatchWidth / 2;
            const centerY = height / 2;
            ctx.fillText(formats.hex, centerX, centerY - 20);

            // RGB & HSL
            ctx.font = '400 24px "Patrick Hand", cursive';
            ctx.fillText(formats.rgb, centerX, centerY + 40);
            ctx.fillText(formats.hsl, centerX, centerY + 80);
        });

        const link = document.createElement('a');
        link.download = `palette-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setShowExport(false);
    };

    return (
        <div className="generator-container">
            <div className="generator-header">
                <h2></h2>
                <div className="generator-actions">
                    <p className="hint hide-mobile">Press <strong>Spacebar</strong> to generate</p>

                    <div className="action-group">
                        <div className="count-selector">
                            <label>Colors:</label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={colorCount}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= 2 && val <= 10) {
                                        setColorCount(val);
                                        generateNewColors(val);
                                    }
                                }}
                            />
                        </div>

                        <select
                            className="harmony-select hide-mobile"
                            value={harmonyMode}
                            onChange={(e) => setHarmonyMode(e.target.value)}
                        >
                            <option value="random">Random (Random variations)</option>
                            <option value="analogous">Analogous (Adjacent on color wheel)</option>
                            <option value="monochromatic">Monochromatic (Shades & tints)</option>
                            <option value="complementary">Complementary (Opposite colors)</option>
                            <option value="splitComplementary">Split-Complementary (Opposite adjacent)</option>
                            <option value="triadic">Triadic (Three equidistant colors)</option>
                            <option value="tetradic">Tetradic (Two complementary pairs)</option>
                        </select>

                        <button className="secondary-btn" onClick={handleSave} disabled={saveSuccess}>
                            {saveSuccess ? <Check size={18} className="text-success" /> : <Save size={18} />}
                            <span className="hide-mobile">{saveSuccess ? 'Saved' : 'Save'}</span>
                        </button>

                        <div className="export-wrapper" ref={exportRef}>
                            <button
                                className={`secondary-btn ${showExport ? 'active' : ''}`}
                                onClick={() => setShowExport(!showExport)}
                            >
                                <Download size={18} />
                                <span className="hide-mobile">Export</span>
                            </button>

                            {showExport && (
                                <div className="export-menu">
                                    <button onClick={exportImage}>
                                        <ImageIcon size={18} /> Export as Image
                                    </button>
                                    <button onClick={exportCSS}>
                                        <Code size={18} /> Copy CSS Variables
                                    </button>
                                    <button onClick={exportJSON}>
                                        <FileJson size={18} /> Copy JSON Array
                                    </button>
                                    <button onClick={exportTailwind}>
                                        <Wind size={18} /> Copy Tailwind Config
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="primary-btn" onClick={generateNewColors}>
                            <RefreshCw size={18} />
                            <span className="hide-mobile">Generate</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="palette-swatches">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={palette.map(c => c.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {palette.map((color) => (
                            <ColorSwatch key={color.id} color={color} />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default PaletteGenerator;
