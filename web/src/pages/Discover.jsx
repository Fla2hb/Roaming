import { useState, useEffect, useRef } from 'react';
import TrailCard from '../components/TrailCard';
import TrailModal from '../components/TrailModal';
import RandomizerButton from '../components/RandomizerButton';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import Leaderboard from '../components/Leaderboard';
import Gear from '../components/Gear';
import HiddenGems from '../components/HiddenGems';
import Profile from './Profile';
import { fetchTrailsByPark, DEMO_TRAILS } from '../services/trailsApi';
import { NATIONAL_PARKS } from '../data/nationalParks';

const TABS = [
  { id: 'trails', label: 'Trails' },
  { id: 'map',    label: 'Map' },
  { id: 'board',  label: 'Leaderboard' },
  { id: 'gear',   label: 'Gear' },
  { id: 'gems',   label: 'Gems' },
];

const PER_PAGE_OPTIONS = [25, 50, 100, 'All'];

function applyClientFilters(list, filters) {
  return list.filter(t => {
    if (filters.difficulty && t.difficulty !== filters.difficulty) return false;
    if (filters.mood === 'dog-friendly' && !t.dogFriendly) return false;
    if (filters.mood === 'jaw-dropping' && t.stars < 4) return false;
    if (filters.mood === 'blow-off-steam' && t.length < 5) return false;
    if (filters.mood === 'peaceful' && t.difficulty === 'black') return false;
    return true;
  });
}

// ── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="trail-card trail-card--skeleton">
      <div className="trail-card__img-wrap" style={{ height: 200 }} />
      <div className="trail-card__body">
        <div className="skeleton-line skeleton-line--wide" />
        <div className="skeleton-line skeleton-line--narrow" />
        <div className="skeleton-line skeleton-line--medium" />
        <div style={{ display: 'flex', gap: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <div className="skeleton-line skeleton-line--short" style={{ flex: 1, marginBottom: 0 }} />
          <div className="skeleton-line skeleton-line--short" style={{ flex: 1, marginBottom: 0 }} />
          <div className="skeleton-line skeleton-line--short" style={{ flex: 1, marginBottom: 0 }} />
        </div>
      </div>
    </div>
  );
}

export default function Discover({ user, onLogout, onUpdateUser }) {
  const [tab, setTab]                   = useState('trails');
  const [showProfile, setShowProfile]   = useState(false);
  const [trails, setTrails]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [selectedPark, setSelectedPark] = useState(null);
  const [parkSearch, setParkSearch]     = useState('');
  const [filters, setFilters]           = useState({ radius: 500, difficulty: null, mood: null });
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [perPage, setPerPage]           = useState(25);
  const [splitView, setSplitView]       = useState(false);
  const randomizerRef = useRef(null);

  // ── Saved trails (localStorage-backed) ────────────────────────────────────
  const [savedTrails, setSavedTrails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('roaming_saved') || '[]'); }
    catch { return []; }
  });

  function toggleSaved(trail) {
    setSavedTrails(prev => {
      const isSaved = prev.some(t => t.id === trail.id);
      const next    = isSaved ? prev.filter(t => t.id !== trail.id) : [...prev, trail];
      localStorage.setItem('roaming_saved', JSON.stringify(next));
      return next;
    });
  }

  // ── Check-in state (localStorage-backed) ─────────────────────────────────
  const [checkIn, setCheckIn] = useState(() => {
    try { return JSON.parse(localStorage.getItem('roaming_checkin') || 'null'); }
    catch { return null; }
  });

  function handleCheckIn(trail, durationHours) {
    const data = { trailId: trail.id, trailName: trail.name, checkedInAt: Date.now(), durationHours };
    setCheckIn(data);
    localStorage.setItem('roaming_checkin', JSON.stringify(data));
  }

  function handleCheckOut() {
    setCheckIn(null);
    localStorage.removeItem('roaming_checkin');
  }

  // ── Roll Again (from modal) ───────────────────────────────────────────────
  function handleRollAgain() {
    setSelectedTrail(null);
    setTimeout(() => randomizerRef.current?.spin(), 80);
  }

  // ── Fetch trails when park or filters change ──────────────────────────────
  useEffect(() => {
    if (!selectedPark) return;
    setLoading(true);
    fetchTrailsByPark(selectedPark)
      .then(data => setTrails(applyClientFilters(data, filters)))
      .catch(() => setTrails(applyClientFilters(DEMO_TRAILS, filters)))
      .finally(() => setLoading(false));
  }, [selectedPark, filters]);

  function handleTabChange(id) {
    setTab(id);
    if (id !== 'trails') setSplitView(false);
  }

  // ── Park picker filter ────────────────────────────────────────────────────
  const filteredParks = NATIONAL_PARKS.filter(p => {
    const q = parkSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.state.toLowerCase().includes(q);
  });

  // ── Profile overlay ─────────────────────────────────────────────────────
  if (showProfile) {
    return (
      <Profile
        user={user}
        onBack={() => setShowProfile(false)}
        onLogout={onLogout}
        onUpdate={onUpdateUser}
      />
    );
  }

  const showFilters   = tab === 'trails' || tab === 'map';
  const visibleTrails = perPage === 'All' ? trails : trails.slice(0, perPage);
  const mapCenter     = selectedPark ? { lat: selectedPark.lat, lng: selectedPark.lng } : null;

  // ── Park picker ──────────────────────────────────────────────────────────
  if (!selectedPark) {
    return (
      <div className="discover">
        <header className="discover__header">
          <div className="discover__logo">Roaming</div>
          <button className="discover__user-btn" onClick={() => setShowProfile(true)}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </header>

        <div className="park-picker">
          <div className="park-picker__card">
            <h2 className="park-picker__title">Choose a National Park</h2>
            <p className="park-picker__sub">Browse trails from all 63 US national parks</p>
            <input
              className="park-picker__search"
              type="text"
              placeholder="Search by park name or state…"
              value={parkSearch}
              onChange={e => setParkSearch(e.target.value)}
              autoFocus
            />
            <div className="park-picker__grid">
              {filteredParks.map(park => (
                <button
                  key={park.id}
                  className="park-card"
                  onClick={() => { setSelectedPark(park); setParkSearch(''); }}
                >
                  <div className="park-card__state">{park.state}</div>
                  <div className="park-card__name">{park.name}</div>
                  <div className="park-card__tagline">{park.tagline}</div>
                </button>
              ))}
              {filteredParks.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
                  No parks match "{parkSearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main app ────────────────────────────────────────────────────────────
  return (
    <div className="discover">

      {/* ── Header ── */}
      <header className="discover__header">
        <div className="discover__header-left">
          <div className="discover__logo">Roaming</div>
          <button
            className="discover__park-switch"
            onClick={() => setSelectedPark(null)}
            title="Change national park"
          >
            <span className="discover__park-switch-icon">⛰</span>
            {selectedPark.name.replace(' National Park', '').replace(' National Monument and Preserve', '').replace(' National Monument', '')}
            <span className="discover__park-switch-caret">▾</span>
          </button>
        </div>

        {checkIn && (
          <button
            className="discover__checkin-pill"
            onClick={() => {
              const t = trails.find(tr => tr.id === checkIn.trailId);
              if (t) setSelectedTrail(t);
            }}
            title={`Checked in to ${checkIn.trailName} — click to view`}
          >
            <span className="discover__checkin-dot" />
            {checkIn.trailName}
          </button>
        )}
        <button
          className="discover__user-btn"
          onClick={() => setShowProfile(true)}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </header>

      {/* ── Tab Bar ── */}
      <div className="discover__tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`discover__tab ${tab === t.id ? 'discover__tab--active' : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filter / Controls bar ── */}
      {showFilters && (
        <div className="discover__controls">
          <FilterBar filters={filters} onChange={setFilters} />

          {/* Park pill — clicking returns to picker */}
          <button
            className="discover__park-pill"
            onClick={() => setSelectedPark(null)}
            title="Change park"
          >
            {selectedPark.name.replace(' National Park', ' NP').replace(' National Monument and Preserve', ' NMP')} ✕
          </button>

          <div className="discover__controls-right">
            {tab === 'trails' && (
              <button
                className={`discover__split-btn ${splitView ? 'discover__split-btn--active' : ''}`}
                onClick={() => setSplitView(v => !v)}
              >
                {splitView ? 'List View' : 'Map + Trails'}
              </button>
            )}
            {tab === 'trails' && (
              <RandomizerButton ref={randomizerRef} trails={trails} onResult={setSelectedTrail} />
            )}
          </div>
        </div>
      )}

      {/* ── Results bar ── */}
      {tab === 'trails' && !loading && trails.length > 0 && (
        <div className="discover__results-bar">
          <span className="discover__results-count">
            Showing {visibleTrails.length} of {trails.length} trails
          </span>
          <div className="discover__per-page">
            {PER_PAGE_OPTIONS.map(n => (
              <button
                key={n}
                className={`discover__per-page-btn ${perPage === n ? 'discover__per-page-btn--active' : ''}`}
                onClick={() => setPerPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Trails — list ── */}
      {tab === 'trails' && !splitView && (
        <main className="discover__grid">
          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          {!loading && !trails.length && (
            <div className="discover__empty">
              <div className="discover__empty-icon">◎</div>
              <div className="discover__empty-title">No trails found in this park</div>
              <div className="discover__empty-sub">
                OpenStreetMap coverage varies by park. Try clearing filters or check back later.
              </div>
            </div>
          )}
          {!loading && visibleTrails.map(trail => (
            <TrailCard
              key={trail.id}
              trail={trail}
              highlighted={selectedTrail?.id === trail.id}
              onClick={setSelectedTrail}
              isSaved={savedTrails.some(t => t.id === trail.id)}
              onSave={toggleSaved}
            />
          ))}
          {!loading && trails.length > visibleTrails.length && (
            <div className="discover__load-more">
              <button
                className="discover__load-more-btn"
                onClick={() => {
                  const idx = PER_PAGE_OPTIONS.indexOf(perPage);
                  const next = PER_PAGE_OPTIONS[idx + 1];
                  if (next) setPerPage(next);
                }}
              >
                Show more trails
              </button>
            </div>
          )}
        </main>
      )}

      {/* ── Trails — split view ── */}
      {tab === 'trails' && splitView && (
        <div className="discover__split">
          <div className="discover__split-list">
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            {!loading && visibleTrails.map(trail => (
              <TrailCard
                key={trail.id}
                trail={trail}
                highlighted={selectedTrail?.id === trail.id}
                onClick={setSelectedTrail}
                isSaved={savedTrails.some(t => t.id === trail.id)}
                onSave={toggleSaved}
              />
            ))}
            {!loading && trails.length > visibleTrails.length && (
              <button
                className="discover__load-more-btn discover__load-more-btn--split"
                onClick={() => {
                  const idx = PER_PAGE_OPTIONS.indexOf(perPage);
                  const next = PER_PAGE_OPTIONS[idx + 1];
                  if (next) setPerPage(next);
                }}
              >
                Show more
              </button>
            )}
          </div>
          <div className="discover__split-map">
            <MapView
              trails={trails}
              center={mapCenter}
              highlightedId={selectedTrail?.id}
              onTrailClick={setSelectedTrail}
            />
          </div>
        </div>
      )}

      {tab === 'map' && (
        <div className="discover__map">
          <MapView
            trails={trails}
            center={mapCenter}
            highlightedId={selectedTrail?.id}
            onTrailClick={setSelectedTrail}
          />
        </div>
      )}

      {tab === 'board' && <Leaderboard user={user} />}
      {tab === 'gear'  && <Gear />}
      {tab === 'gems'  && <HiddenGems user={user} />}

      {selectedTrail && (
        <TrailModal
          trail={selectedTrail}
          onClose={() => setSelectedTrail(null)}
          isSaved={savedTrails.some(t => t.id === selectedTrail.id)}
          onSave={toggleSaved}
          checkIn={checkIn}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onRollAgain={trails.length > 1 ? handleRollAgain : null}
        />
      )}
    </div>
  );
}
