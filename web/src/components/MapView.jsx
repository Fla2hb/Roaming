// Requires VITE_MAPBOX_TOKEN in web/.env
// Get a free token at https://account.mapbox.com
import Map, { Marker, Popup } from 'react-map-gl';
import { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const DIFF_COLORS = {
  green: '#2ecc71',
  blue: '#3498db',
  blueBlack: '#2c3e50',
  black: '#1a1a1a',
};

export default function MapView({ trails, center, highlightedId, onTrailClick }) {
  const [popup, setPopup] = useState(null);

  if (!TOKEN) {
    return (
      <div className="map-placeholder">
        <p>Add <code>VITE_MAPBOX_TOKEN</code> to <code>web/.env</code> to enable the map.</p>
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={TOKEN}
      initialViewState={{
        longitude: center?.lng ?? -119.5,
        latitude: center?.lat ?? 37.5,
        zoom: center ? 9 : 6,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
    >
      {trails.map(trail => (
        <Marker
          key={trail.id}
          longitude={trail.longitude}
          latitude={trail.latitude}
          anchor="bottom"
          onClick={e => { e.originalEvent.stopPropagation(); setPopup(trail); onTrailClick?.(trail); }}
        >
          <div
            className={`map-pin ${highlightedId === trail.id ? 'map-pin--active' : ''}`}
            style={{ background: DIFF_COLORS[trail.difficulty] || '#888' }}
          />
        </Marker>
      ))}

      {popup && (
        <Popup
          longitude={popup.longitude}
          latitude={popup.latitude}
          anchor="top"
          onClose={() => setPopup(null)}
          closeOnClick={false}
        >
          <strong>{popup.name}</strong>
          <br />
          {popup.length?.toFixed(1)} mi · {popup.difficulty}
        </Popup>
      )}
    </Map>
  );
}
