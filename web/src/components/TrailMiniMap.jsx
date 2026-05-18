import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon paths (broken in Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const TRAIL_COLOR = '#4ade80';

const TILES = {
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    maxZoom: 17,
    label: 'Topo',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    maxZoom: 18,
    label: 'Satellite',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
    maxZoom: 19,
    label: 'Street',
  },
};

// Fetch the trail's full path geometry from Overpass and return
// an array of polyline coordinate arrays: [ [[lat,lng], ...], ... ]
async function fetchTrailGeometry(id, osmType) {
  if (!id || !osmType) return null;

  try {
    if (osmType === 'way') {
      const body = `[out:json][timeout:15];\nway(${id});\nout geom;`;
      const res  = await fetch(OVERPASS, { method: 'POST', body });
      const data = await res.json();
      const el   = data.elements?.[0];
      if (el?.geometry?.length > 1) {
        return [el.geometry.map(n => [n.lat, n.lon])];
      }
    }

    if (osmType === 'relation') {
      // Expand the relation to get all member way geometries
      const body = `[out:json][timeout:25];\nrelation(${id});\n>;\nout geom;`;
      const res  = await fetch(OVERPASS, { method: 'POST', body });
      const data = await res.json();
      const lines = (data.elements || [])
        .filter(el => el.type === 'way' && el.geometry?.length > 1)
        .map(el => el.geometry.map(n => [n.lat, n.lon]));
      if (lines.length > 0) return lines;
    }
  } catch {
    // Geometry fetch failed — fall through to pin-only display
  }

  return null;
}

export default function TrailMiniMap({ lat, lng, name, trailId, osmType }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const tileRef       = useRef(null);
  const linesRef      = useRef([]);
  const [activeStyle, setActiveStyle] = useState('topo');
  const [geoStatus, setGeoStatus]     = useState('loading'); // 'loading' | 'ok' | 'fallback'

  // Init map + load geometry
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 13);
    mapRef.current = map;

    const cfg = TILES.topo;
    tileRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    // Fallback pin (shown until/unless geometry loads)
    const pinIcon = L.divIcon({
      className: '',
      html: '<div class="trail-map-pin"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    const marker = L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(name, { closeButton: false })
      .openPopup();

    // Try to load real trail geometry
    fetchTrailGeometry(trailId, osmType).then(lines => {
      if (!mapRef.current) return; // modal closed during fetch

      if (lines && lines.length > 0) {
        // Remove the fallback pin once we have a real line
        marker.remove();

        // Draw each segment of the trail
        linesRef.current = lines.map(coords =>
          L.polyline(coords, {
            color: TRAIL_COLOR,
            weight: 4,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(mapRef.current)
        );

        // Fit the map to the trail bounds
        const group = L.featureGroup(linesRef.current);
        mapRef.current.fitBounds(group.getBounds(), { padding: [24, 24] });

        // Add start/end markers
        const allCoords = lines.flat();
        const startPt   = allCoords[0];
        const endPt     = allCoords[allCoords.length - 1];

        const dot = (label) => L.divIcon({
          className: '',
          html: `<div class="trail-map-dot" title="${label}"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker(startPt, { icon: dot('Start') }).addTo(mapRef.current);
        L.marker(endPt,   { icon: dot('End')   }).addTo(mapRef.current);

        setGeoStatus('ok');
      } else {
        setGeoStatus('fallback');
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      linesRef.current = [];
    };
  }, [lat, lng, name, trailId, osmType]);

  function switchLayer(key) {
    if (!mapRef.current || !tileRef.current) return;
    const cfg = TILES[key];
    tileRef.current.remove();
    tileRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(mapRef.current);

    // Re-add trail lines on top after tile switch
    linesRef.current.forEach(line => line.addTo(mapRef.current));
    setActiveStyle(key);
  }

  return (
    <div className="trail-mini-map">
      {geoStatus === 'loading' && (
        <div className="trail-mini-map__loading">Loading trail route…</div>
      )}
      <div ref={containerRef} className="trail-mini-map__map" />
      <div className="trail-mini-map__style-btns">
        {Object.entries(TILES).map(([key, cfg]) => (
          <button
            key={key}
            className={`trail-mini-map__style-btn ${activeStyle === key ? 'trail-mini-map__style-btn--active' : ''}`}
            onClick={() => switchLayer(key)}
          >
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}
