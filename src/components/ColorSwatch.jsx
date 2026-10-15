import React, { useState, useEffect, useRef } from 'react';
import { usePalette } from '../context/PaletteContext';
import { getContrastText, getFormats } from '../utils/colorUtils';
import { Lock, Unlock, Copy, SlidersHorizontal, GripVertical, Pipette, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import chroma from 'chroma-js';

const ColorSwatch = ({ color }) => {
    const { toggleLock, updateColor } = usePalette();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempHex, setTempHex] = useState('');

    const editorRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: color.id });

    const textColor = getContrastText(color.hex);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: color.hex,
        color: textColor,
        zIndex: isDragging ? 50 : (isEditing ? 40 : 1),
    };

    const formats = getFormats(color.hex);

    useEffect(() => {
        setTempHex(formats.hex);
    }, [formats.hex]);

    // Close the editor on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (editorRef.current && !editorRef.current.contains(e.target)) {
                setIsEditing(false);
            }
        };
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing]);

    const handleCopy = () => {
        navigator.clipboard.writeText(formats.hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleHexChange = (e) => {
        const val = e.target.value;
        setTempHex(val);
        if (chroma.valid(val)) {
            updateColor(color.id, chroma(val).hex());
        }
    };

    const handleEyeDropper = async () => {
        if (!window.EyeDropper) return;
        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            updateColor(color.id, result.sRGBHex);
        } catch (e) {
            console.log('Eyedropper cancelled', e);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`cp-swatch${color.locked ? ' is-locked' : ''}`}
        >
            <div className="cp-swatch-tools">
                <button
                    className="cp-tool"
                    title="Drag to reorder"
                    aria-label="Drag to reorder"
                    style={{ cursor: 'grab' }}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical />
                </button>
                <button
                    className={`cp-tool${color.locked ? ' is-on' : ''}`}
                    onClick={() => toggleLock(color.id)}
                    title={color.locked ? 'Unlock colour' : 'Lock colour'}
                    aria-label={color.locked ? 'Unlock colour' : 'Lock colour'}
                    aria-pressed={color.locked}
                >
                    {color.locked ? <Lock /> : <Unlock />}
                </button>
                <button className="cp-tool" onClick={handleCopy} title="Copy hex" aria-label="Copy hex">
                    <Copy />
                </button>
                <button
                    className="cp-tool"
                    title="Adjust colour"
                    aria-label="Adjust colour"
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                >
                    <SlidersHorizontal />
                </button>
            </div>

            <div className="cp-swatch-info">
                <button className="cp-hex" onClick={handleCopy} title="Copy hex">
                    {formats.hex}
                </button>
                <div className="cp-formats">
                    <span>{formats.rgb}</span>
                    <span>{formats.hsl}</span>
                </div>
            </div>

            {copied && <span className="cp-copied" role="status">Copied {formats.hex}</span>}

            {isEditing && (
                <div className="cp-editor wb-menu" ref={editorRef} onClick={(e) => e.stopPropagation()}>
                    <div className="cp-editor-head">
                        <span className="wb-h3">Adjust</span>
                        <button className="wb-btn wb-btn--quiet wb-btn--icon wb-btn--sm" onClick={() => setIsEditing(false)} aria-label="Close">
                            <X />
                        </button>
                    </div>

                    <div>
                        <label className="wb-label" htmlFor={`hex-${color.id}`}>Hex</label>
                        <input
                            id={`hex-${color.id}`}
                            className="wb-input wb-num"
                            type="text"
                            value={tempHex}
                            onChange={handleHexChange}
                            spellCheck="false"
                        />
                    </div>

                    <div>
                        <label className="wb-label" htmlFor={`pick-${color.id}`}>Picker</label>
                        <input
                            id={`pick-${color.id}`}
                            type="color"
                            value={chroma.valid(tempHex) ? chroma(tempHex).hex() : '#000000'}
                            onChange={(e) => updateColor(color.id, e.target.value)}
                            className="cp-native"
                        />
                    </div>

                    {window.EyeDropper && (
                        <button className="wb-btn wb-btn--sm" onClick={handleEyeDropper}>
                            <Pipette /> Pick from screen
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ColorSwatch;
