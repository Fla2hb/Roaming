import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function set(key, value) { onChange({ ...filters, [key]: value }); }

  const activeCount = [filters.mood, filters.difficulty, filters.radius !== 25 ? true : null]
    .filter(Boolean).length;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="filter-drop" ref={ref}>
      <button
        className={`filter-drop__btn ${open ? 'filter-drop__btn--open' : ''} ${activeCount ? 'filter-drop__btn--active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        ⚙ Filters {activeCount > 0 && <span className="filter-drop__badge">{activeCount}</span>}
      </button>

      {open && (
        <div className="filter-drop__panel">
          <div className="filter-drop__section">
            <label className="filter-drop__label">Vibe</label>
            <select
              className="filter-drop__select"
              value={filters.mood || ''}
              onChange={e => set('mood', e.target.value || null)}
            >
              <option value="">All Trails</option>
              <option value="peaceful">🌿 Peaceful</option>
              <option value="blow-off-steam">💪 Blow Off Steam</option>
              <option value="jaw-dropping">🤩 Jaw-Dropping</option>
              <option value="photo-worthy">📸 Photo Worthy</option>
              <option value="dog-friendly">🐕 Dog Friendly</option>
              <option value="kid-friendly">👧 Kid Friendly</option>
            </select>
          </div>

          <div className="filter-drop__section">
            <label className="filter-drop__label">Difficulty</label>
            <select
              className="filter-drop__select"
              value={filters.difficulty || ''}
              onChange={e => set('difficulty', e.target.value || null)}
            >
              <option value="">Any</option>
              <option value="green">Easy</option>
              <option value="blue">Moderate</option>
              <option value="blueBlack">Hard</option>
              <option value="black">Expert</option>
            </select>
          </div>

          <div className="filter-drop__section">
            <div className="filter-drop__slider-header">
              <label className="filter-drop__label">Radius</label>
              <span className="filter-drop__slider-val">{filters.radius || 25} mi</span>
            </div>
            <input
              type="range"
              className="filter-drop__slider"
              min={5} max={100} step={5}
              value={filters.radius || 25}
              onChange={e => set('radius', Number(e.target.value))}
            />
            <div className="filter-drop__slider-ticks">
              <span>5 mi</span><span>100 mi</span>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              className="filter-drop__clear"
              onClick={() => { onChange({ radius: 25, difficulty: null, mood: null }); setOpen(false); }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
