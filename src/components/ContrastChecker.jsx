import React, { useState } from 'react';
import chroma from 'chroma-js';
import { Check, X, ArrowUpDown } from 'lucide-react';

const ContrastChecker = () => {
    const [bgHex, setBgHex] = useState('#FFFFFF');
    const [textHex, setTextHex] = useState('#111827');

    const isValidBg = chroma.valid(bgHex);
    const isValidText = chroma.valid(textHex);

    const ratio = (isValidBg && isValidText)
        ? chroma.contrast(bgHex, textHex)
        : 1;

    const checks = [
        { level: 'AA', size: 'Normal text', need: 4.5 },
        { level: 'AA', size: 'Large text', need: 3.0 },
        { level: 'AAA', size: 'Normal text', need: 7.0 },
        { level: 'AAA', size: 'Large text', need: 4.5 },
    ];

    const verdict = ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good for body text' : ratio >= 3 ? 'Large text only' : 'Too low';

    const swap = () => {
        setBgHex(textHex);
        setTextHex(bgHex);
    };

    const ColorField = ({ id, label, value, onChange, fallback }) => (
        <div>
            <label className="wb-label" htmlFor={id}>{label}</label>
            <div className="cp-colorfield">
                <input
                    type="color"
                    aria-label={`${label} picker`}
                    value={chroma.valid(value) ? chroma(value).hex() : fallback}
                    onChange={(e) => onChange(e.target.value)}
                    className="cp-native"
                />
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-invalid={!chroma.valid(value) || undefined}
                    className="wb-input wb-num"
                    spellCheck="false"
                />
            </div>
        </div>
    );

    return (
        <div>
            <div className="wb-head">
                <h1 className="wb-title">Contrast checker</h1>
                <p className="wb-lede">Check a text colour against its background using the WCAG 2.1 ratios.</p>
            </div>

            <div className="cp-contrast">
                <div className="wb-panel wb-stack wb-stack--lg">
                    {ColorField({ id: 'bg', label: 'Background', value: bgHex, onChange: setBgHex, fallback: '#ffffff' })}
                    {ColorField({ id: 'fg', label: 'Text', value: textHex, onChange: setTextHex, fallback: '#000000' })}
                    <button className="wb-btn" onClick={swap}>
                        <ArrowUpDown /> Swap colours
                    </button>
                </div>

                <div className="wb-stack wb-stack--lg">
                    <div>
                        <div className="cp-ratio" aria-live="polite">
                            {ratio.toFixed(2)}<small>:1</small>
                        </div>
                        <p className="wb-lede" style={{ marginTop: 8 }}>{verdict}</p>
                    </div>

                    <div className="cp-wcag">
                        {checks.map((c) => {
                            const passes = ratio >= c.need;
                            return (
                                <div className="cp-wcag-item" key={`${c.level}-${c.size}`}>
                                    <div>
                                        <strong>{c.level} {c.size.toLowerCase()}</strong>
                                        <span className="wb-hint wb-num">Needs {c.need.toFixed(1)}:1</span>
                                    </div>
                                    <span className={`wb-chip ${passes ? 'wb-chip--ok' : 'wb-chip--bad'}`}>
                                        {passes ? <Check /> : <X />}
                                        {passes ? 'Pass' : 'Fail'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="cp-sample"
                        style={{
                            backgroundColor: isValidBg ? chroma(bgHex).hex() : '#FFFFFF',
                            color: isValidText ? chroma(textHex).hex() : '#000000'
                        }}
                    >
                        <h3>How the text reads</h3>
                        <p>
                            This paragraph is set in your text colour on your background. Body copy needs at least 4.5:1;
                            large headings can get by with 3:1.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContrastChecker;
