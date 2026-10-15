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

const PaletteGenerator = () => {
    const { palette, generateNewColors, reorderPalette, harmonyMode, setHarmonyMode, saveCurrentPalette, colorCount, setColorCount } = usePalette();
    const [showExport, setShowExport] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [toast, setToast] = useState(null);
    const exportRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) {
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

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(t);
    }, [toast]);

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
        setToast('Saved to your gallery');
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setToast(`${label} copied`);
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
        copyToClipboard(`module.exports = ${JSON.stringify(config, null, 2)}`, 'Tailwind config');
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

            ctx.fillStyle = color.hex;
            ctx.fillRect(i * swatchWidth, 0, swatchWidth, height);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const centerX = i * swatchWidth + swatchWidth / 2;
            ctx.fillStyle = textColor;
            ctx.font = '600 40px "Readex Pro", "Segoe UI", sans-serif';
            ctx.fillText(formats.hex, centerX, height - 150);

            ctx.font = '400 18px "Readex Pro", "Segoe UI", sans-serif';
            ctx.fillText(formats.rgb, centerX, height - 100);
            ctx.fillText(formats.hsl, centerX, height - 72);
        });

        const link = document.createElement('a');
        link.download = `palette-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setShowExport(false);
    };

    return (
        <div>
            <h1 className="wb-sr">Palette generator</h1>
            <div className="cp-toolbar">
                <p className="wb-note" style={{ margin: 0 }}>
                    Press <kbd className="wb-chip" style={{ font: 'inherit', fontWeight: 600 }}>Space</kbd> for a new palette. Lock the colours you want to keep.
                </p>

                <div className="cp-toolbar-actions">
                    <div className="cp-count">
                        <label htmlFor="color-count" className="wb-note">Colours</label>
                        <input
                            id="color-count"
                            className="wb-input wb-num"
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

                    <label htmlFor="harmony" className="wb-sr">Harmony</label>
                    <select
                        id="harmony"
                        className="wb-select cp-harmony"
                        value={harmonyMode}
                        onChange={(e) => setHarmonyMode(e.target.value)}
                    >
                        <option value="random">Random</option>
                        <option value="analogous">Analogous: neighbours on the wheel</option>
                        <option value="monochromatic">Monochromatic: shades and tints</option>
                        <option value="complementary">Complementary: opposites</option>
                        <option value="splitComplementary">Split complementary</option>
                        <option value="triadic">Triadic: three evenly spaced</option>
                        <option value="tetradic">Tetradic: two opposite pairs</option>
                    </select>

                    <button className="wb-btn" onClick={handleSave} disabled={saveSuccess}>
                        {saveSuccess ? <Check /> : <Save />}
                        {saveSuccess ? 'Saved' : 'Save'}
                    </button>

                    <div className="cp-export" ref={exportRef}>
                        <button
                            className="wb-btn"
                            aria-expanded={showExport}
                            aria-haspopup="menu"
                            onClick={() => setShowExport(!showExport)}
                        >
                            <Download /> Export
                        </button>

                        {showExport && (
                            <div className="wb-menu" role="menu">
                                <button role="menuitem" onClick={exportImage}>
                                    <ImageIcon /> Download as PNG
                                </button>
                                <button role="menuitem" onClick={exportCSS}>
                                    <Code /> Copy CSS variables
                                </button>
                                <button role="menuitem" onClick={exportJSON}>
                                    <FileJson /> Copy JSON array
                                </button>
                                <button role="menuitem" onClick={exportTailwind}>
                                    <Wind /> Copy Tailwind config
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="wb-btn wb-btn--primary" onClick={() => generateNewColors()}>
                        <RefreshCw /> Generate
                    </button>
                </div>
            </div>

            <div className="cp-swatches">
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

            {toast && (
                <div className="wb-toast" role="status">
                    <span className="wb-toast-dot"><Check /></span>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default PaletteGenerator;
