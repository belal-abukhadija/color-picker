import chroma from 'chroma-js';

export const generateRandomColor = () => chroma.random().hex();

export const generateRandomPalette = (count = 5) => {
    return Array.from({ length: count }, () => ({
        id: crypto.randomUUID(),
        hex: generateRandomColor(),
        locked: false,
    }));
};

export const getContrastText = (hex) => {
    return chroma.contrast(hex, 'white') > 4.5 ? '#ffffff' : '#111827';
};

export const getFormats = (hex) => {
    const color = chroma(hex);
    // chroma returns saturation and lightness as 0–1, plus an alpha channel
    const [h, s, l] = color.hsl();
    return {
        hex: color.hex().toUpperCase(),
        rgb: `RGB ${color.rgb().join(', ')}`,
        hsl: `HSL ${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`,
    };
};

export const getHarmonies = (hex) => {
    return {
        analogous: chroma.scale([chroma(hex).set('hsl.h', '-30'), hex, chroma(hex).set('hsl.h', '+30')]).colors(5),
        complementary: [hex, chroma(hex).set('hsl.h', '+180').hex()],
        splitComplementary: [hex, chroma(hex).set('hsl.h', '+150').hex(), chroma(hex).set('hsl.h', '+210').hex()],
        triadic: [hex, chroma(hex).set('hsl.h', '+120').hex(), chroma(hex).set('hsl.h', '+240').hex()],
        tetradic: [hex, chroma(hex).set('hsl.h', '+90').hex(), chroma(hex).set('hsl.h', '+180').hex(), chroma(hex).set('hsl.h', '+270').hex()],
        monochromatic: chroma.scale([chroma(hex).darken(2.5), hex, chroma(hex).brighten(2.5)]).colors(5),
    };
};
