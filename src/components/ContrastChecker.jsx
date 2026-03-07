import React, { useState } from 'react';
import chroma from 'chroma-js';
import { CheckCircle2, XCircle } from 'lucide-react';
import './ContrastChecker.css';

const ContrastChecker = () => {
    const [bgHex, setBgHex] = useState('#FFFFFF');
    const [textHex, setTextHex] = useState('#111827');

    const handleBgChange = (e) => setBgHex(e.target.value);
    const handleTextChange = (e) => setTextHex(e.target.value);

    const isValidBg = chroma.valid(bgHex);
    const isValidText = chroma.valid(textHex);

    const ratio = (isValidBg && isValidText)
        ? chroma.contrast(bgHex, textHex)
        : 1;

    const getStatus = (ratio, required) => {
        return ratio >= required;
    };

    const results = {
        aaNormal: getStatus(ratio, 4.5),
        aaLarge: getStatus(ratio, 3.0),
        aaaNormal: getStatus(ratio, 7.0),
        aaaLarge: getStatus(ratio, 4.5),
    };

    const Badge = ({ passes }) => (
        <span className={`status-badge ${passes ? 'pass' : 'fail'}`}>
            {passes ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {passes ? 'Pass' : 'Fail'}
        </span>
    );

    return (
        <div className="contrast-container">
            <div className="contrast-header">
                <h2>Contrast Checker</h2>
                <p className="hint">Ensure your colors meet WCAG accessibility standards.</p>
            </div>

            <div className="checker-layout">
                {/* Column 1: Color Inputs */}
                <div className="color-inputs">
                    <div className="input-group">
                        <label>Background Color</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={isValidBg ? chroma(bgHex).hex() : '#FFFFFF'}
                                onChange={handleBgChange}
                                className="native-color"
                            />
                            <input
                                type="text"
                                value={bgHex}
                                onChange={handleBgChange}
                                className="text-input"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Text Color</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={isValidText ? chroma(textHex).hex() : '#000000'}
                                onChange={handleTextChange}
                                className="native-color"
                            />
                            <input
                                type="text"
                                value={textHex}
                                onChange={handleTextChange}
                                className="text-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Column 2: Contrast Ratio & WCAG Scores */}
                <div className="results-panel">
                    <div className="ratio-score">
                        <h3>Contrast Ratio</h3>
                        <div className="score-value">{ratio.toFixed(2)}</div>
                        <p className={`rating ${ratio >= 4.5 ? 'good' : 'poor'}`}>
                            {ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good' : 'Poor'}
                        </p>
                    </div>

                    <div className="wcag-scores">
                        <div className="wcag-row">
                            <div className="wcag-info">
                                <h4>AA Standard</h4>
                                <p>Normal Text (4.5:1)</p>
                            </div>
                            <Badge passes={results.aaNormal} />
                        </div>
                        <div className="wcag-row">
                            <div className="wcag-info">
                                <h4>AA Standard</h4>
                                <p>Large Text (3.0:1)</p>
                            </div>
                            <Badge passes={results.aaLarge} />
                        </div>
                        <div className="wcag-row">
                            <div className="wcag-info">
                                <h4>AAA Standard</h4>
                                <p>Normal Text (7.0:1)</p>
                            </div>
                            <Badge passes={results.aaaNormal} />
                        </div>
                        <div className="wcag-row">
                            <div className="wcag-info">
                                <h4>AAA Standard</h4>
                                <p>Large Text (4.5:1)</p>
                            </div>
                            <Badge passes={results.aaaLarge} />
                        </div>
                    </div>
                </div>

                {/* Column 3: Live Preview */}
                <div
                    className="preview-box"
                    style={{
                        backgroundColor: isValidBg ? chroma(bgHex).hex() : '#FFFFFF',
                        color: isValidText ? chroma(textHex).hex() : '#000000'
                    }}
                >
                    <div className="preview-content">
                        <h3>Live Preview Example</h3>
                        <p>
                            This is how your text will look against this background.
                            Readable text is essential for an accessible web experience.
                            Make sure your contrast ratio is at least 4.5:1 for normal text.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContrastChecker;
