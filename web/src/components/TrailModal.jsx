import { useEffect, useState } from 'react';
import TrailMiniMap from './TrailMiniMap';
import { fetchTrailPhoto } from '../services/photoApi';

const DIFFICULTY_LABELS = {
  green:     { label: 'Easy',     color: '#22c55e' },
  blue:      { label: 'Moderate', color: '#3b82f6' },
  blueBlack: { label: 'Hard',     color: '#8b5cf6' },
  black:     { label: 'Expert',   color: '#ef4444' },
};

const GEAR_REQUIRED = {
  green:     [],
  blue:      ['Water (2L+)', 'Sunscreen', 'Trail snacks'],
  blueBlack: ['Trekking poles', 'Navigation', 'Extra layers', 'First aid'],
  black:     ['Trekking poles', 'Microspikes', 'Navigation', 'Emergency shelter', 'Headlamp'],
};

export default function TrailModal({ trail, onClose, isSaved, onSave, checkIn, onCheckIn, onCheckOut, onRollAgain }) {
  const diff = DIFFICULTY_LABELS[trail.difficulty] || { label: trail.difficulty, color: '#888' };
  const gear = GEAR_REQUIRED[trail.difficulty] || [];
  const hasCoords = trail.latitude && trail.longitude;

  const [photo, setPhoto]       = useState(trail.imgSmall || null);
  const [mediaTab, setMediaTab] = useState('photo');
  const [showCheckInPanel, setShowCheckInPanel] = useState(false);
  const [checkInDuration, setCheckInDuration]   = useState('2');

  // Is THIS trail the currently active check-in?
  const isCheckedInHere  = checkIn?.trailId === trail.id;
  // Checked in somewhere else?
  const isCheckedInOther = checkIn && !isCheckedInHere;

  function confirmCheckIn() {
    onCheckIn?.(trail, parseInt(checkInDuration, 10));
    setShowCheckInPanel(false);
  }

  // Try to upgrade to a real Wikipedia photo
  useEffect(() => {
    setPhoto(trail.imgSmall || null);
    let cancelled = false;
    fetchTrailPhoto(trail.name, trail.location, trail.imgSmall).then(url => {
      if (!cancelled && url) setPhoto(url);
    });
    return () => { cancelled = true; };
  }, [trail.id, trail.name]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* ── Media area (Photo / Map tabs) ── */}
        <div className="modal__media">
          {/* Tab toggle — only show if both options exist */}
          {trail.imgSmall && hasCoords && (
            <div className="modal__media-tabs">
              <button
                className={`modal__media-tab ${mediaTab === 'photo' ? 'modal__media-tab--active' : ''}`}
                onClick={() => setMediaTab('photo')}
              >
                Photo
              </button>
              <button
                className={`modal__media-tab ${mediaTab === 'map' ? 'modal__media-tab--active' : ''}`}
                onClick={() => setMediaTab('map')}
              >
                Map
              </button>
            </div>
          )}

          {mediaTab === 'photo' && (
            photo
              ? <img className="modal__img" src={photo} alt={trail.name} />
              : <div className="modal__img-placeholder" />
          )}

          {mediaTab === 'map' && hasCoords && (
            <TrailMiniMap
              lat={trail.latitude}
              lng={trail.longitude}
              name={trail.name}
              trailId={trail.id}
              osmType={trail.osmType}
            />
          )}
        </div>

        {/* ── Body ── */}
        <div className="modal__body">
          <div className="modal__header">
            <h2 className="modal__name">{trail.name}</h2>
            <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <p className="modal__location">{trail.location}</p>

          <span className="modal__badge" style={{ background: diff.color }}>
            {diff.label}
          </span>

          <div className="modal__stats">
            <div className="modal__stat">
              <div className="modal__stat-value">{trail.length?.toFixed(1)}</div>
              <div className="modal__stat-label">Miles</div>
            </div>
            <div className="modal__stat">
              <div className="modal__stat-value">{trail.ascent?.toLocaleString()}</div>
              <div className="modal__stat-label">Ft Gain</div>
            </div>
            <div className="modal__stat">
              <div className="modal__stat-value" style={{ color: '#f59e0b' }}>
                {trail.stars?.toFixed(1)}
              </div>
              <div className="modal__stat-label">Rating</div>
            </div>
          </div>

          <p className="modal__summary">{trail.summary}</p>

          {gear.length > 0 && (
            <div className="modal__gear">
              <div className="modal__gear-label">What to bring</div>
              <div className="modal__gear-chips">
                {gear.map(g => <span key={g} className="modal__gear-chip">{g}</span>)}
              </div>
            </div>
          )}

          {/* ── Check-In Panel ── */}
          {isCheckedInHere && (
            <div className="modal__checkin">
              <div className="modal__checkin-status">
                <div className="modal__checkin-status-dot" />
                <span className="modal__checkin-status-text">
                  Checked in · back in {checkIn.durationHours}h
                </span>
                <button className="modal__checkin-checkout" onClick={onCheckOut}>
                  Check Out
                </button>
              </div>
            </div>
          )}
          {isCheckedInOther && (
            <div className="modal__checkin">
              <p className="modal__checkin-other">
                You're currently checked in to <strong>{checkIn.trailName}</strong>.
                Check out before starting a new hike.
              </p>
            </div>
          )}
          {showCheckInPanel && !checkIn && (
            <div className="modal__checkin">
              <div className="modal__checkin-title">How long do you plan to hike?</div>
              <div className="modal__checkin-row">
                <select
                  className="modal__checkin-select"
                  value={checkInDuration}
                  onChange={e => setCheckInDuration(e.target.value)}
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">Full day (8h)</option>
                </select>
                <button className="modal__checkin-confirm" onClick={confirmCheckIn}>
                  Start Hike
                </button>
              </div>
            </div>
          )}

          {onRollAgain && (
            <button className="modal__roll-again" onClick={onRollAgain}>
              ↻ Roll Again
            </button>
          )}

          <div className="modal__actions">
            {isCheckedInHere ? (
              <button
                className="modal__action-btn modal__action-btn--secondary"
                onClick={onCheckOut}
              >
                Check Out
              </button>
            ) : (
              <button
                className="modal__action-btn modal__action-btn--primary"
                onClick={() => setShowCheckInPanel(v => !v)}
                disabled={!!isCheckedInOther}
                title={isCheckedInOther ? `Already checked in to ${checkIn.trailName}` : ''}
              >
                {showCheckInPanel ? 'Cancel' : 'Check In'}
              </button>
            )}
            <button
              className={`modal__action-btn modal__action-btn--secondary ${isSaved ? 'modal__action-btn--saved' : ''}`}
              onClick={() => onSave?.(trail)}
            >
              {isSaved ? 'Saved ♥' : 'Save Trail'}
            </button>
            <a
              className="modal__action-btn modal__action-btn--secondary"
              href={
                hasCoords
                  ? `https://www.google.com/maps/dir/?api=1&destination=${trail.latitude},${trail.longitude}&travelmode=driving`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trail.name + ' ' + trail.location)}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
