import { useState, useRef, useEffect } from 'react';
import api from '../api/client';

export default function TickerAutocomplete({ value, onChange, placeholder, className, style, inputStyle, inputClassName, disabled }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (!value || value.length < 1) { setSuggestions([]); setOpen(false); return; }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tickers/search?q=${encodeURIComponent(value)}`);
        setSuggestions(data.tickers || []);
        setOpen((data.tickers || []).length > 0);
      } catch { /* silent */ } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(debounceTimer.current);
  }, [value]);

  function pick(symbol) {
    onChange(symbol);
    setOpen(false);
    setSuggestions([]);
  }

  function handleChange(e) {
    onChange(e.target.value.toUpperCase());
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    clearTimeout(blurTimer.current);
    if (suggestions.length > 0) setOpen(true);
  }

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={inputClassName}
        style={inputStyle}
      />
      {open && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          minWidth: 340,
          background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: 0, padding: 0,
          listStyle: 'none', maxHeight: 280, overflowY: 'auto',
        }}>
          {loading && (
            <li style={{ padding: '0.5rem 0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>Searching…</li>
          )}
          {!loading && suggestions.map(t => (
            <li
              key={t.symbol}
              onMouseDown={() => pick(t.symbol)}
              style={{
                padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex',
                gap: '0.5rem', alignItems: 'baseline', fontSize: '0.875rem',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <span style={{ fontWeight: 700, color: '#0f172a', minWidth: 60, flexShrink: 0 }}>{t.symbol}</span>
              <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
