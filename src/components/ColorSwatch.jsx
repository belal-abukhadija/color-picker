import React, { useState, useEffect, useRef } from 'react';
import { usePalette } from '../context/PaletteContext';
import { getContrastText, getFormats } from '../utils/colorUtils';
import { Lock, Unlock, Copy, SlidersHorizontal, GripHorizontal, Pipette, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import chroma from 'chroma-js';
import './ColorSwatch.css';

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
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'none',
    };

    const formats = getFormats(color.hex);

    useEffect(() => {
        setTempHex(formats.hex);
    }, [formats.hex]);

    // Handle click outside to close editor
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
            className={`color-swatch ${isDragging ? 'dragging' : ''}`}
        >
            <div className="swatch-actions top-actions">
                <button
                    className="icon-btn drag-handle"
                    title="Drag to reorder"
                    style={{ color: textColor, cursor: 'grab' }}
                    {...attributes}
                    {...listeners}
                >
                    <GripHorizontal size={20} />
                </button>
                <button
                    className="icon-btn"
                    onClick={() => toggleLock(color.id)}
                    title={color.locked ? "Unlock color" : "Lock color"}
                    style={{ color: textColor }}
                >
                    {color.locked ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
            </div>

            <div className="swatch-info">
                <h2 className="hex-code" onClick={handleCopy}>
                    {formats.hex}
                </h2>
                {copied && <span className="copy-badge">Copied!</span>}

                <div className="color-formats">
                    <span>{formats.rgb}</span>
                    <span>{formats.hsl}</span>
                </div>
            </div>

            <div className="swatch-actions bottom-actions">
                <button
                    className="icon-btn"
                    onClick={handleCopy}
                    title="Copy HEX"
                    style={{ color: textColor }}
                >
                    <Copy size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Adjust color"
                    style={{ color: textColor }}
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                >
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {isEditing && (
                <div className="editor-popover" ref={editorRef} onClick={(e) => e.stopPropagation()}>
                    <button className="close-editor-btn" onClick={() => setIsEditing(false)}>
                        <X size={16} />
                    </button>

                    <div className="editor-row">
                        <label>HEX</label>
                        <input
                            type="text"
                            value={tempHex}
                            onChange={handleHexChange}
                            spellCheck="false"
                        />
                    </div>

                    <div className="editor-row">
                        <label>Picker</label>
                        <input
                            type="color"
                            value={chroma.valid(tempHex) ? chroma(tempHex).hex() : '#000000'}
                            onChange={(e) => updateColor(color.id, e.target.value)}
                            className="native-color-picker"
                        />
                    </div>

                    {window.EyeDropper && (
                        <button className="eyedropper-btn" onClick={handleEyeDropper}>
                            <Pipette size={16} /> Pick from screen
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ColorSwatch;
