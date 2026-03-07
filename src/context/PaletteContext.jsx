import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { generateRandomPalette, generateRandomColor, getHarmonies } from '../utils/colorUtils';
import chroma from 'chroma-js';

const PaletteContext = createContext();

export const usePalette = () => {
    const context = useContext(PaletteContext);
    if (!context) throw new Error("usePalette must be used within a PaletteProvider");
    return context;
};

export const PaletteProvider = ({ children }) => {
    const [palette, setPalette] = useState(() => {
        const saved = localStorage.getItem('chroma_tool_palette');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse", e);
            }
        }
        return generateRandomPalette(5);
    });

    const [harmonyMode, setHarmonyMode] = useState('analogous');
    const [colorCount, setColorCount] = useState(5);

    const [savedPalettes, setSavedPalettes] = useState(() => {
        const saved = localStorage.getItem('chroma_saved_palettes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (palette.length > 0) {
            localStorage.setItem('chroma_tool_palette', JSON.stringify(palette));
        }
    }, [palette]);

    useEffect(() => {
        localStorage.setItem('chroma_saved_palettes', JSON.stringify(savedPalettes));
    }, [savedPalettes]);

    const generateNewColors = useCallback((overrideCount = null) => {
        setPalette(prev => {
            let activePaletteLength = typeof overrideCount === 'number' ? overrideCount : colorCount;
            // First adjust length of prev palette if colorCount changed
            let current = [...prev];
            if (current.length < activePaletteLength) {
                while (current.length < activePaletteLength) {
                    current.push({ id: crypto.randomUUID(), hex: generateRandomColor(), locked: false });
                }
            } else if (current.length > activePaletteLength) {
                // If shrinking but some are locked, try to keep locked ones first, then slice
                current = current.slice(0, activePaletteLength);
            }

            if (harmonyMode === 'random') {
                return current.map(color =>
                    color.locked ? color : { ...color, hex: generateRandomColor() }
                );
            }

            const baseColorItem = current.find(c => c.locked) || { hex: generateRandomColor() };
            const harmoniesMap = getHarmonies(baseColorItem.hex);
            let harmonyColors = harmoniesMap[harmonyMode] || [];

            let paddedColors = [...harmonyColors];

            // Brighten/Darken factor logic for extended palettes
            let step = 1;
            while (paddedColors.length < current.length) {
                try {
                    const factor = (step * 0.4);
                    // alternate brighten and darken
                    if (step % 2 === 0) {
                        paddedColors.push(chroma(baseColorItem.hex).darken(factor).hex());
                    } else {
                        paddedColors.push(chroma(baseColorItem.hex).brighten(factor).hex());
                    }
                } catch {
                    paddedColors.push(generateRandomColor());
                }
                step++;
            }

            let availableHarmonyIndex = 0;

            return current.map((color) => {
                if (color.locked) {
                    return color;
                }

                const newHex = paddedColors[availableHarmonyIndex] || generateRandomColor();
                availableHarmonyIndex++;
                return { ...color, hex: newHex };
            });
        });
    }, [harmonyMode, colorCount]);

    const toggleLock = useCallback((id) => {
        setPalette(prev => prev.map(color =>
            color.id === id ? { ...color, locked: !color.locked } : color
        ));
    }, []);

    const updateColor = useCallback((id, newHex) => {
        setPalette(prev => prev.map(color =>
            color.id === id ? { ...color, hex: newHex } : color
        ));
    }, []);

    const setFullPalette = useCallback((newPalette) => {
        setPalette(newPalette);
    }, []);

    const reorderPalette = useCallback((activeIndex, overIndex) => {
        setPalette(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(activeIndex, 1);
            result.splice(overIndex, 0, removed);
            return result;
        });
    }, []);

    const saveCurrentPalette = useCallback((name = "My Palette") => {
        const colors = palette.map(c => c.hex);
        const newSaved = {
            id: crypto.randomUUID(),
            name,
            colors,
            createdAt: new Date().toISOString()
        };
        setSavedPalettes(prev => [newSaved, ...prev]);
    }, [palette]);

    const deleteSavedPalette = useCallback((id) => {
        setSavedPalettes(prev => prev.filter(p => p.id !== id));
    }, []);

    return (
        <PaletteContext.Provider value={{
            palette,
            generateNewColors,
            toggleLock,
            updateColor,
            setFullPalette,
            reorderPalette,
            harmonyMode,
            setHarmonyMode,
            colorCount,
            setColorCount,
            savedPalettes,
            saveCurrentPalette,
            deleteSavedPalette
        }}>
            {children}
        </PaletteContext.Provider>
    );
};
