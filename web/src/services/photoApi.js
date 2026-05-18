// Photo fetching — tries sources in order:
// 1. Wikipedia (real trail photo, best quality)
// 2. Pexels search (relevant hiking photo by trail/region name)
// 3. Caller's fallback (assigned Unsplash stock photo)

const PEXELS_KEY = '48fOHV4OYZRbGTUa2ft1HUCyUAptmEQ8tObreIOpYpAnsBqnSrL1YtMO';

async function fetchWikiPhoto(trailName) {
  const queries = [trailName, `${trailName} trail`, `${trailName} hiking`];
  for (const q of queries) {
    try {
      const res  = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(q)}&prop=pageimages&format=json&pithumbsize=1200&origin=*`
      );
      const data = await res.json();
      const page = Object.values(data.query?.pages || {})[0];
      if (page?.pageid !== -1 && page?.thumbnail?.source) return page.thumbnail.source;
    } catch { /* skip */ }
  }
  return null;
}

async function fetchPexelsPhoto(trailName, location) {
  // Try specific trail name first, then broaden to region + hiking
  const regionBase = (location || '').split(',')[0].trim();
  const queries = [
    `${trailName} trail`,
    regionBase ? `${regionBase} hiking trail` : null,
    'hiking trail nature scenery',
  ].filter(Boolean);

  for (const q of queries) {
    try {
      const res  = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: PEXELS_KEY } }
      );
      const data = await res.json();
      const photo = data.photos?.[0];
      if (photo) return photo.src.large2x || photo.src.large;
    } catch { /* skip */ }
  }
  return null;
}

/**
 * Fetch the best available photo for a trail.
 * @param {string} trailName
 * @param {string} location   — e.g. "Yosemite Valley, CA"
 * @param {string} fallback   — stock photo URL to return if everything else fails
 * @param {number} thumbSize  — Wikipedia thumbnail size (default 1200)
 */
export async function fetchTrailPhoto(trailName, location, fallback = null) {
  const pexels = await fetchPexelsPhoto(trailName, location);
  if (pexels) return pexels;

  const wiki = await fetchWikiPhoto(trailName);
  if (wiki) return wiki;

  return fallback;
}
