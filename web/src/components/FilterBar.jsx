import { useState, useRef, useEffect } from 'react';

export default function FilterBar({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeCount = [filters.mood, filters.difficulty, filters.radius !== 500 ? true : null]
    .filter(Boolean).length;

  return (
    <div className="filter-wrap" ref={ref}>
      <button
        className={`filter-toggle ${open ? 'filter-toggle--open' : ''} ${activeCount > 0 ? 'filter-toggle--active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        Filters {activeCount > 0 && <span className="filter-toggle__badge">{activeCount}</span>}
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-panel__group">
            <label>Trail Type</label>
            <select
              value={filters.mood || ''}
              onChange={e => set('mood', e.target.value || null)}
            >
              <option value="">All Trails</option>
              <option value="peaceful">Peaceful</option>
              <option value="blow-off-steam">Blow Off Steam</option>
              <option value="jaw-dropping">Jaw-Dropping</option>
              <option value="photo-worthy">Photo Worthy</option>
              <option value="dog-friendly">Dog Friendly</option>
              <option value="kid-friendly">Kid Friendly</option>
            </select>
          </div>

          <div className="filter-panel__group">
            <label>Difficulty</label>
            <select
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

          <div className="filter-panel__group">
            <div className="filter-panel__slider-label">
              <label>Radius</label>
              <span>{filters.radius || 500} mi</span>
            </div>
            <input
              type="range"
              className="filter-bar__slider"
              min={25}
              max={500}
              step={25}
              value={filters.radius || 500}
              onChange={e => set('radius', Number(e.target.value))}
            />
          </div>

          {activeCount > 0 && (
            <button
              className="filter-panel__clear"
              onClick={() => { onChange({ radius: 500, difficulty: null, mood: null }); setOpen(false); }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
