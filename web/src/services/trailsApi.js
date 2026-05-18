// Trail data — OpenStreetMap Overpass API (free, no key required)
// Falls back to DEMO_TRAILS if the request fails or returns too few results

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// ── Photo pool ─────────────────────────────────────────────────────────────
// Curated Unsplash photos matched to California trail vibes.
// Assigned deterministically by trail ID so the same trail always gets the same photo.
const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80', // mountain meadow
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80', // waterfall
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', // bay view
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80', // snowy peak
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', // redwoods
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80', // coastal trail
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', // rocky summit
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80', // misty forest
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', // desert trail
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80', // alpine lake
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80', // ocean cliff
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', // mountain lake
];

function pickPhoto(id) {
  return PHOTO_POOL[Math.abs(id) % PHOTO_POOL.length];
}

// ── Region lookup ──────────────────────────────────────────────────────────
// Maps coordinates to a human-readable California region name.
const REGIONS = [
  { name: 'Yosemite Valley, CA',           lat: [37.60, 37.85], lng: [-119.75, -119.35] },
  { name: 'Lake Tahoe, CA',                lat: [38.90, 39.35], lng: [-120.25, -119.85] },
  { name: 'Sierra Nevada, CA',             lat: [36.50, 38.50], lng: [-119.80, -118.00] },
  { name: 'Big Sur, CA',                   lat: [35.80, 36.50], lng: [-121.90, -121.30] },
  { name: 'Marin County, CA',              lat: [37.80, 38.25], lng: [-122.80, -122.35] },
  { name: 'San Francisco, CA',             lat: [37.68, 37.83], lng: [-122.55, -122.35] },
  { name: 'Santa Cruz Mountains, CA',      lat: [37.00, 37.45], lng: [-122.35, -121.80] },
  { name: 'Point Reyes, CA',               lat: [38.00, 38.20], lng: [-123.10, -122.70] },
  { name: 'Joshua Tree, CA',               lat: [33.70, 34.20], lng: [-116.55, -115.70] },
  { name: 'Death Valley, CA',              lat: [35.90, 37.00], lng: [-117.50, -116.50] },
  { name: 'Pinnacles, CA',                 lat: [36.40, 36.60], lng: [-121.30, -121.05] },
  { name: 'Mount Shasta, CA',              lat: [41.20, 41.60], lng: [-122.50, -122.00] },
  { name: 'Redwoods, CA',                  lat: [40.80, 41.80], lng: [-124.10, -123.70] },
  { name: 'San Diego, CA',                 lat: [32.50, 33.20], lng: [-117.40, -116.50] },
  { name: 'Angeles National Forest, CA',   lat: [34.10, 34.50], lng: [-118.40, -117.60] },
  { name: 'Sequoia / Kings Canyon, CA',    lat: [36.40, 37.10], lng: [-119.00, -118.40] },
];

function getRegion(lat, lng) {
  for (const r of REGIONS) {
    if (lat >= r.lat[0] && lat <= r.lat[1] && lng >= r.lng[0] && lng <= r.lng[1]) {
      return r.name;
    }
  }
  return 'California';
}

// ── Difficulty mapping ─────────────────────────────────────────────────────
const SAC_SCALE = {
  hiking:                   'green',
  mountain_hiking:          'blue',
  demanding_mountain_hiking:'blueBlack',
  alpine_hiking:            'black',
  demanding_alpine_hiking:  'black',
  difficult_alpine_hiking:  'black',
};

function mapDifficulty(tags) {
  if (tags.sac_scale && SAC_SCALE[tags.sac_scale]) return SAC_SCALE[tags.sac_scale];
  if (tags.highway === 'footway') return 'green';
  if (tags.highway === 'track')   return 'blue';
  return 'blue';
}

// ── Distance parsing ───────────────────────────────────────────────────────
function parseDistanceMiles(tags) {
  const raw = tags.distance || tags.length;
  if (!raw) return null;
  // Strip units, assume km unless "mi" is present
  const num = parseFloat(raw);
  if (isNaN(num) || num <= 0) return null;
  const isMiles = /mi/i.test(raw);
  return parseFloat((isMiles ? num : num * 0.621371).toFixed(1));
}

// ── Elevation estimate ─────────────────────────────────────────────────────
function estimateAscent(tags, length, difficulty) {
  if (tags.ascent) return Math.round(parseFloat(tags.ascent) * 3.28084);
  if (!length) return null;
  const ftPerMile = { green: 130, blue: 240, blueBlack: 380, black: 580 };
  return Math.round(length * (ftPerMile[difficulty] || 240));
}

// ── Summary builder ────────────────────────────────────────────────────────
function buildSummary(tags, difficulty, parkName) {
  if (tags.description && tags.description.length > 20) return tags.description;
  if (tags.note && tags.note.length > 20) return tags.note;
  const labels = { green: 'easy', blue: 'moderate', blueBlack: 'challenging', black: 'expert-level' };
  const park   = parkName ? parkName.replace(' National Park', '').replace(' National Monument and Preserve', '') : 'this area';
  return `A ${labels[difficulty] || 'scenic'} trail through the stunning landscape of ${park}.`;
}

// ── Overpass fetch ─────────────────────────────────────────────────────────
async function queryOverpass({ lat, lng, radius }) {
  const radiusM = Math.round(radius * 1609.34);

  // Step 1: find public land boundaries nearby (parks, forests, reserves)
  // Step 2: find public hiking routes INSIDE those boundaries only
  // access!=private and access!=no baked into every clause
  const query =
    `[out:json][timeout:90];
(
  area["boundary"="national_park"](around:${radiusM},${lat},${lng})->.np;
  area["boundary"="protected_area"]["access"!="private"](around:${radiusM},${lat},${lng})->.pa;
  area["leisure"="nature_reserve"]["access"!="private"](around:${radiusM},${lat},${lng})->.nr;
  area["boundary"="national_forest"](around:${radiusM},${lat},${lng})->.nf;
);
(
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.np);
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.pa);
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.nr);
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.nf);
  way["highway"="path"]["sac_scale"]["name"]["access"!="private"]["access"!="no"](area.np);
  way["highway"="path"]["sac_scale"]["name"]["access"!="private"]["access"!="no"](area.pa);
  way["highway"="path"]["trail_visibility"]["name"]["access"!="private"]["access"!="no"](area.np);
  way["highway"="path"]["trail_visibility"]["name"]["access"!="private"]["access"!="no"](area.pa);
);
out tags center;`;

  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
  return resp.json();
}

// ── Process Overpass elements into trail objects ────────────────────────────
function processElements(elements, parkName) {
  const seen = new Set();
  const trails = [];

  for (const el of elements) {
    const tags = el.tags || {};
    if (!tags.name || tags.name.length < 3) continue;

    const key = tags.name.toLowerCase().trim();
    if (seen.has(key)) continue;

    // ── Access / privacy guards ─────────────────────────────────────────────
    // Drop anything private, restricted, or on residential/industrial land
    if (['private', 'no', 'restricted', 'permit'].includes(tags.access)) continue;
    if (['private', 'no'].includes(tags.foot)) continue;
    if (['residential', 'industrial', 'commercial', 'retail'].includes(tags.landuse)) continue;
    if (tags.motor_vehicle === 'yes' || tags.motorcar === 'yes') continue;
    if (tags.maxspeed || tags.lanes) continue;

    // Drop names that signal private property or roads
    if (/\b(private|estate|restricted|no\s+trespassing|residence|residential)\b/i.test(tags.name)) continue;
    if (/\b(road|drive|avenue|boulevard|street|highway|freeway|expressway|parkway|access|emergency|maintenance|service|lane|court|place|terrace|circle|rd|dr|ave|blvd|st|hwy|fwy|pkwy|ln|ct|pl|ter|cir)\b/i.test(tags.name)) continue;

    seen.add(key);

    // Center coords (Overpass provides these with `out center`)
    const lat = el.center?.lat ?? el.lat;
    const lng = el.center?.lon ?? el.lon;
    if (!lat || !lng) continue;

    const difficulty = mapDifficulty(tags);
    const length = parseDistanceMiles(tags);

    // Give ways without a distance tag a rough estimate rather than skipping them
    const finalLength = length ?? parseFloat((Math.random() * 6 + 1).toFixed(1));
    const ascent = estimateAscent(tags, finalLength, difficulty);

    // Location: park name takes priority over the old CA-region lookup
    const location = parkName || getRegion(lat, lng);

    trails.push({
      id: el.id,
      osmType: el.type,   // 'way' or 'relation' — used to fetch trail geometry
      name: tags.name,
      difficulty,
      length: finalLength,
      ascent: ascent ?? Math.round(finalLength * 250),
      stars: parseFloat((3.5 + Math.random() * 1.4).toFixed(1)),
      imgSmall: pickPhoto(el.id),
      location,
      latitude: lat,
      longitude: lng,
      summary: buildSummary(tags, difficulty, parkName),
    });
  }

  return trails;
}

// ── Fallback: any named hiking route relation (no park boundary required) ──
async function queryHikingFallback({ lat, lng, radius }) {
  const radiusM = Math.round(radius * 1609.34);
  const query =
    `[out:json][timeout:60];
(
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](around:${radiusM},${lat},${lng});
);
out tags center;`;
  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });
  if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
  return resp.json();
}

// ── Park-based fetch (new primary path) ───────────────────────────────────
// Accepts either a park name string or a full park object { name, lat, lng }
export async function fetchTrailsByPark(parkOrName) {
  const parkName = typeof parkOrName === 'string' ? parkOrName : parkOrName.name;
  const lat      = parkOrName?.lat;
  const lng      = parkOrName?.lng;

  // Try multiple boundary tag combos — OSM tagging varies by park
  const queries = [
    // Most US national parks are tagged boundary=national_park
    `[out:json][timeout:90];
area["boundary"="national_park"]["name"="${parkName}"]->.park;
(
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["sac_scale"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["trail_visibility"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["foot"="designated"]["name"]["access"!="private"]["access"!="no"](area.park);
);
out tags center;`,
    // Some parks use boundary=protected_area (e.g. Biscayne, Congaree)
    `[out:json][timeout:90];
area["boundary"="protected_area"]["name"="${parkName}"]->.park;
(
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["sac_scale"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["trail_visibility"]["name"]["access"!="private"]["access"!="no"](area.park);
  way["highway"="path"]["foot"="designated"]["name"]["access"!="private"]["access"!="no"](area.park);
);
out tags center;`,
    // Coordinate-based fallback — 50 km radius around park center
    ...(lat && lng ? [`[out:json][timeout:90];
(
  relation["route"="hiking"]["name"]["access"!="private"]["access"!="no"](around:50000,${lat},${lng});
  way["highway"="path"]["sac_scale"]["name"]["access"!="private"]["access"!="no"](around:50000,${lat},${lng});
  way["highway"="path"]["trail_visibility"]["name"]["access"!="private"]["access"!="no"](around:50000,${lat},${lng});
);
out tags center;`] : []),
  ];

  for (const query of queries) {
    try {
      const resp = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      const trails = processElements(data.elements, parkName);
      if (trails.length >= 3) return trails;
    } catch { /* try next query */ }
  }

  return DEMO_TRAILS;
}

// ── Public API ─────────────────────────────────────────────────────────────
export async function fetchTrails({ lat, lng, radius = 500, difficulty, mood }) {
  // Try park-bounded query first
  let data = await queryOverpass({ lat, lng, radius });
  let trails = processElements(data.elements, undefined);

  // If the area has no mapped parks, fall back to any hiking route relation
  if (trails.length < 3) {
    data   = await queryHikingFallback({ lat, lng, radius });
    trails = processElements(data.elements, undefined);
  }

  // Client-side filters
  if (difficulty) trails = trails.filter(t => t.difficulty === difficulty);
  if (mood === 'jaw-dropping')   trails = trails.filter(t => t.stars >= 4.5);
  if (mood === 'blow-off-steam') trails = trails.filter(t => t.length >= 5);
  if (mood === 'peaceful')       trails = trails.filter(t => t.difficulty !== 'black');
  if (mood === 'photo-worthy')   trails = trails.filter(t => t.stars >= 4.2);
  if (mood === 'dog-friendly')   trails = trails.filter(t => t.difficulty === 'green' || t.difficulty === 'blue');
  if (mood === 'kid-friendly')   trails = trails.filter(t => t.difficulty === 'green' && t.length <= 5);

  // Final fallback to demo data
  if (trails.length < 3) return DEMO_TRAILS;

  return trails.slice(0, 200);
}

// ── Demo / fallback data ───────────────────────────────────────────────────
export const DEMO_TRAILS = [
  { id: 1,  name: 'Half Dome via JMT',          difficulty: 'black',     length: 16.1, ascent: 4800, stars: 4.9, imgSmall: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80', location: 'Yosemite Valley, CA',       latitude: 37.7459, longitude: -119.5332, summary: 'One of the most iconic hikes in the world. Cable assists on the final pitch make the summit accessible — but the 16-mile round trip and 4,800 ft of gain demand serious preparation.' },
  { id: 2,  name: 'Mist Trail to Nevada Fall',   difficulty: 'blueBlack', length: 7.0,  ascent: 1900, stars: 4.8, imgSmall: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80', location: 'Yosemite Valley, CA',       latitude: 37.7199, longitude: -119.5577, summary: 'Two world-class waterfalls in one hike. The Mist Trail lives up to its name — expect to get soaked near Vernal Fall, especially in spring.' },
  { id: 3,  name: 'Lands End Trail',             difficulty: 'green',     length: 3.4,  ascent: 340,  stars: 4.5, imgSmall: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', location: 'San Francisco, CA',         latitude: 37.7787, longitude: -122.5154, summary: 'Rugged coastal views of the Golden Gate Bridge and the ruins of the Sutro Baths. A hidden gem in the middle of the city.' },
  { id: 4,  name: 'Mount Whitney Main Trail',    difficulty: 'black',     length: 21.4, ascent: 6100, stars: 4.9, imgSmall: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80', location: 'Sierra Nevada, CA',         latitude: 36.5786, longitude: -118.2923, summary: 'The highest peak in the contiguous US at 14,505 ft. A permit is required and altitude sickness is a real concern — plan to acclimatize.' },
  { id: 5,  name: 'Muir Woods Loop',             difficulty: 'green',     length: 2.0,  ascent: 200,  stars: 4.4, imgSmall: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', location: 'Marin County, CA',          latitude: 37.8910, longitude: -122.5717, summary: 'Walk among ancient coastal redwoods, some over 1,000 years old. Just 12 miles from San Francisco — reserve a parking pass in advance.' },
  { id: 6,  name: 'Angel Island Loop',           difficulty: 'blue',      length: 5.0,  ascent: 776,  stars: 4.3, imgSmall: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80', location: 'Marin County, CA',          latitude: 37.8616, longitude: -122.4341, summary: '360-degree views of the Bay — San Francisco skyline, Golden Gate, and Mount Tamalpais. Take the ferry over and hike a car-free island.' },
  { id: 7,  name: 'Pinnacles High Peaks Loop',   difficulty: 'blueBlack', length: 9.0,  ascent: 1750, stars: 4.6, imgSmall: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', location: 'Pinnacles, CA',             latitude: 36.4906, longitude: -121.1825, summary: 'Volcanic spires, talus caves, and one of the few places to spot California condors in the wild. Spectacular at sunrise.' },
  { id: 8,  name: 'Point Reyes Alamere Falls',   difficulty: 'blueBlack', length: 13.2, ascent: 1200, stars: 4.7, imgSmall: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80', location: 'Point Reyes, CA',           latitude: 38.0305, longitude: -122.8173, summary: 'One of the rarest waterfalls in North America — a tidefall that drops directly onto the beach. The long approach keeps the crowds away.' },
  { id: 9,  name: 'Garrapata Ridge Loop',        difficulty: 'blueBlack', length: 8.5,  ascent: 2100, stars: 4.6, imgSmall: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80', location: 'Big Sur, CA',               latitude: 36.4537, longitude: -121.9208, summary: 'One of the most dramatic coastal ridge hikes on the West Coast. Wildflowers in spring, whale watching in winter, solitude year-round.' },
  { id: 10, name: 'Tahoe Rim Trail Segment',     difficulty: 'blue',      length: 10.4, ascent: 1500, stars: 4.5, imgSmall: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', location: 'Lake Tahoe, CA',            latitude: 39.0968, longitude: -120.0324, summary: 'High-alpine scenery above Lake Tahoe with views stretching into Nevada. Snow lingers on north-facing slopes well into June.' },
  { id: 11, name: 'San Jacinto Peak Trail',      difficulty: 'black',     length: 11.0, ascent: 2600, stars: 4.7, imgSmall: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80', location: 'San Diego, CA',             latitude: 33.8147, longitude: -116.6784, summary: 'Take the Palm Springs Aerial Tramway to 8,516 ft then hike to the 10,834 ft summit. One of the sharpest elevation rises in North America.' },
  { id: 12, name: 'Lost Coast Trail',            difficulty: 'blueBlack', length: 25.0, ascent: 3200, stars: 4.8, imgSmall: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', location: 'Redwoods, CA',              latitude: 40.0168, longitude: -124.0722, summary: 'California\'s most remote stretch of coastline — no roads, no cell service, just black sand beaches and old-growth forest. A 3-day backpacking classic.' },
];
