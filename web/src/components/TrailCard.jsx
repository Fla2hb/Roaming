import { useState, useEffect } from 'react';
import { fetchTrailPhoto } from '../services/photoApi';

const DIFFICULTY_LABELS = {
  green:     { label: 'Easy',     color: '#22c55e' },
  blue:      { label: 'Moderate', color: '#3b82f6' },
  blueBlack: { label: 'Hard',     color: '#8b5cf6' },
  black:     { label: 'Expert',   color: '#ef4444' },
};

export default function TrailCard({ trail, highlighted, onClick, isSaved, onSave }) {
  const diff = DIFFICULTY_LABELS[trail.difficulty] || { label: trail.difficulty, color: '#888' };
  const [photo, setPhoto]     = useState(trail.imgSmall || null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const fullStars  = Math.round(trail.stars || 0);
  const emptyStars = 5 - fullStars;

  useEffect(() => {
    // Reset when the trail changes
    setPhoto(trail.imgSmall || null);
    setImgLoaded(false);

    let cancelled = false;

    fetchTrailPhoto(trail.name, trail.location, trail.imgSmall).then(url => {
      if (!cancelled && url) setPhoto(url);
    });

    return () => { cancelled = true; };
  }, [trail.id, trail.name]);

  return (
    <div
      className={`trail-card ${highlighted ? 'trail-card--highlighted' : ''}`}
      onClick={() => onClick?.(trail)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(trail)}
    >
      <div className="trail-card__img-wrap">
        {photo ? (
          <img
            src={photo}
            alt={trail.name}
            loading="lazy"
            className={imgLoaded ? 'trail-card__img--loaded' : ''}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="trail-card__img-placeholder" />
        )}
        <span className="trail-card__badge" style={{ background: diff.color }}>
          {diff.label}
        </span>
        <button
          className={`trail-card__save-btn ${isSaved ? 'trail-card__save-btn--saved' : ''}`}
          onClick={e => { e.stopPropagation(); onSave?.(trail); }}
          title={isSaved ? 'Remove from saved' : 'Save trail'}
          aria-label={isSaved ? 'Remove from saved' : 'Save trail'}
        >
          {isSaved ? '♥' : '♡'}
        </button>
        <div className="trail-card__overlay" />
      </div>
      <div className="trail-card__body">
        <h3 className="trail-card__name">{trail.name}</h3>
        <p className="trail-card__location">{trail.location}</p>
        <p className="trail-card__summary">{trail.summary}</p>
        <div className="trail-card__stats">
          <div className="trail-card__stat">
            <span className="trail-card__stat-label">Distance</span>
            <span className="trail-card__stat-value">{trail.length?.toFixed(1)} mi</span>
          </div>
          <div className="trail-card__stat">
            <span className="trail-card__stat-label">Gain</span>
            <span className="trail-card__stat-value">{trail.ascent?.toLocaleString()} ft</span>
          </div>
          <div className="trail-card__stat">
            <span className="trail-card__stat-label">Rating</span>
            <span className="trail-card__stat-value">
              <span className="trail-card__stars-filled">{'★'.repeat(fullStars)}</span>
              <span className="trail-card__stars-empty">{'★'.repeat(emptyStars)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
