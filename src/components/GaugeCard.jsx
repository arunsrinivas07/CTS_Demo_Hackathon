import React from 'react';

// Interpolates between two hex colors, t in [0,1]
function interpolateColor(hexA, hexB, t) {
  const a = hexA.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16));
  const b = hexB.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16));
  const rgb = a.map((c, i) => Math.round(c + (b[i] - c) * t));
  return `rgb(${rgb.join(',')})`;
}

function GaugeArc({ colorFrom, colorTo, ticks = 40 }) {
  const cx = 100;
  const cy = 100;
  const rInner = 68;
  const rOuter = 86;

  const marks = [];
  for (let i = 0; i < ticks; i++) {
    const t = i / (ticks - 1);
    const angleDeg = 180 + 180 * t; // sweep left -> top -> right
    const angleRad = (angleDeg * Math.PI) / 180;
    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);

    marks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={interpolateColor(colorFrom, colorTo, t)}
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  }

  return (
    <svg viewBox="0 0 200 108" className="w-full h-auto">
      {marks}
    </svg>
  );
}

/**
 * GaugeCard - semi-circle "meter" card used for Fraud Rate / XAI Breakdown, etc.
 *
 * Props:
 *  - title: card heading
 *  - value: number (0-100), shown large in the center of the gauge
 *  - subtitle: small text under the value (optional)
 *  - colorFrom / colorTo: hex colors the tick gradient sweeps between
 *  - footer: any node rendered below the gauge (button, bars, etc.)
 *  - menu: whether to show the top-right "..." affordance (default true)
 */
export default function GaugeCard({
  title,
  value,
  subtitle,
  colorFrom = '#6EE7B7',
  colorTo = '#059669',
  footer,
  menu = true,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow card-hover flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-navy-900 tracking-tight">{title}</h3>
        {menu && (
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 px-1 leading-none"
            aria-label="More options"
          >
            •••
          </button>
        )}
      </div>

      <div className="relative flex flex-col items-center">
        <GaugeArc colorFrom={colorFrom} colorTo={colorTo} />
        <div className="absolute top-[54%] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-navy-900">{value}%</span>
          {subtitle && (
            <span className="text-xs text-slate-400 mt-0.5 text-center px-4">{subtitle}</span>
          )}
        </div>
      </div>

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}