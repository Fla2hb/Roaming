import { useState, useRef } from 'react';

const AVATAR_COLORS = [
  '#4ade80', '#60a5fa', '#f87171', '#fb923c',
  '#a78bfa', '#f472b6', '#34d399', '#facc15',
];

const PRESET_BANNERS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80', label: 'Mountain Peak' },
  { id: 2, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80', label: 'Starry Summit' },
  { id: 3, url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80', label: 'Redwood Forest' },
  { id: 4, url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=900&q=80', label: 'Coastal Cliffs' },
  { id: 5, url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=80', label: 'Valley View' },
  { id: 6, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900&q=80', label: 'Waterfall' },
];

const TRAIL_VIBES = ['All Trails', 'Peaceful', 'Jaw-Dropping', 'Blow Off Steam', 'Photo Worthy', 'Dog Friendly'];
const HIKE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CA_REGIONS = [
  '',
  'Bay Area',
  'Yosemite / Tuolumne Meadows',
  'Lake Tahoe',
  'Sierra Nevada',
  'Sequoia / Kings Canyon',
  'Eastern Sierra / Mammoth',
  'Big Sur / Central Coast',
  'Point Reyes / Marin',
  'Santa Cruz Mountains',
  'Shasta / Cascades',
  'Redwoods / Humboldt',
  'Angeles National Forest',
  'San Diego / Anza-Borrego',
  'Joshua Tree',
  'Death Valley',
  'Mojave Desert',
  'Channel Islands',
];

export default function Profile({ user, onBack, onLogout, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [showBannerInput, setShowBannerInput] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    avatarColor: user.avatarColor || '#4ade80',
    favoriteVibe: user.favoriteVibe || 'All Trails',
    hikeLevel: user.hikeLevel || 'Intermediate',
    region: user.region || '',
    banner: user.banner || null,
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSave() {
    onUpdate?.({ ...user, ...form });
    setEditing(false);
    setShowBannerInput(false);
  }

  function handleCustomBanner() {
    if (customBannerUrl.trim()) {
      set('banner', customBannerUrl.trim());
      setShowBannerInput(false);
    }
  }

  const avatarColor = editing ? form.avatarColor : (user.avatarColor || '#4ade80');
  const bannerUrl = editing ? form.banner : user.banner;
  const displayName = user.name || 'Explorer';

  return (
    <div className="profile-page">

      {/* ── Top Bar ── */}
      <div className="profile-page__topbar">
        <button className="profile-page__back" onClick={onBack}>← Back</button>
        {!editing
          ? <button className="profile-page__edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          : <button className="profile-edit__save-top" onClick={handleSave}>Save</button>
        }
      </div>

      {/* ── Banner ── */}
      <div className="profile-page__banner-wrap">
        {bannerUrl
          ? <img src={bannerUrl} className="profile-page__banner" alt="Profile banner" />
          : <div className="profile-page__banner profile-page__banner--empty" />
        }
        {editing && (
          <button className="profile-page__banner-edit-btn" onClick={() => setShowBannerInput(v => !v)}>
            Change Banner
          </button>
        )}
      </div>

      {/* ── Banner Picker (shown while editing) ── */}
      {editing && showBannerInput && (
        <div className="profile-edit__banner-picker">
          <p className="profile-edit__banner-label">Choose a preset</p>
          <div className="profile-edit__banner-presets">
            {PRESET_BANNERS.map(b => (
              <button
                key={b.id}
                className={`profile-edit__banner-option ${form.banner === b.url ? 'profile-edit__banner-option--active' : ''}`}
                onClick={() => { set('banner', b.url); setShowBannerInput(false); }}
                title={b.label}
              >
                <img src={b.url} alt={b.label} />
                <span>{b.label}</span>
              </button>
            ))}
          </div>
          <p className="profile-edit__banner-label" style={{ marginTop: 14 }}>Or paste an image URL</p>
          <div className="profile-edit__banner-url-row">
            <input
              className="profile-edit__input"
              placeholder="https://..."
              value={customBannerUrl}
              onChange={e => setCustomBannerUrl(e.target.value)}
            />
            <button className="profile-edit__banner-url-btn" onClick={handleCustomBanner}>Set</button>
          </div>
          {form.banner && (
            <button
              className="profile-edit__banner-remove"
              onClick={() => { set('banner', null); setShowBannerInput(false); }}
            >
              Remove banner
            </button>
          )}
        </div>
      )}

      {/* ── Avatar + Name ── */}
      <div className="profile-page__hero">
        <div className="profile-page__avatar" style={{ background: avatarColor }}>
          {displayName[0]?.toUpperCase()}
        </div>

        {editing ? (
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="profile-edit__input profile-edit__input--name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Display name"
              maxLength={30}
            />
            <input
              className="profile-edit__input"
              value={form.username}
              onChange={e => set('username', e.target.value.replace(/\s/g, '_').toLowerCase())}
              placeholder="@username"
              maxLength={20}
              style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}
            />
          </div>
        ) : (
          <>
            <h1 className="profile-page__name">{displayName}</h1>
            {user.username && <p className="profile-page__handle">@{user.username}</p>}
            {user.bio && <p className="profile-page__bio">{user.bio}</p>}
            <p className="profile-page__email">{user.email || 'Guest'}</p>
            <div className="profile-page__tags">
              {user.hikeLevel && <span className="profile-page__tag">{user.hikeLevel}</span>}
              {user.region && <span className="profile-page__tag">{user.region}</span>}
              {user.favoriteVibe && user.favoriteVibe !== 'All Trails' && (
                <span className="profile-page__tag">{user.favoriteVibe}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="profile-page__stats">
        {[['0', 'Trails Hiked'], ['0', 'Miles'], ['0', 'Hidden Gems'], ['0', 'Badges']].map(([val, label]) => (
          <div key={label} className="profile-page__stat">
            <span className="profile-page__stat-value">{val}</span>
            <span className="profile-page__stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <div className="profile-edit">
          <h2 className="profile-edit__title">Customize Your Page</h2>

          <div className="profile-edit__group">
            <label>Avatar Color</label>
            <div className="profile-edit__colors">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  className={`profile-edit__color ${form.avatarColor === c ? 'profile-edit__color--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('avatarColor', c)}
                />
              ))}
            </div>
          </div>

          <div className="profile-edit__group">
            <label>Bio <span style={{ color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 0 }}>· {form.bio.length}/160</span></label>
            <textarea
              className="profile-edit__textarea"
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Tell the community a bit about yourself..."
              maxLength={160}
              rows={3}
            />
          </div>

          <div className="profile-edit__group">
            <label>Hiking Level</label>
            <div className="profile-edit__vibes">
              {HIKE_LEVELS.map(v => (
                <button
                  key={v}
                  className={`profile-edit__vibe ${form.hikeLevel === v ? 'profile-edit__vibe--active' : ''}`}
                  onClick={() => set('hikeLevel', v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-edit__group">
            <label>Favorite Region</label>
            <select
              className="profile-edit__select"
              value={form.region}
              onChange={e => set('region', e.target.value)}
            >
              <option value="">— Select a region —</option>
              {CA_REGIONS.filter(r => r).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="profile-edit__group">
            <label>Favorite Vibe</label>
            <div className="profile-edit__vibes">
              {TRAIL_VIBES.map(v => (
                <button
                  key={v}
                  className={`profile-edit__vibe ${form.favoriteVibe === v ? 'profile-edit__vibe--active' : ''}`}
                  onClick={() => set('favoriteVibe', v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-edit__actions">
            <button className="profile-edit__save" onClick={handleSave}>Save Changes</button>
            <button className="profile-edit__cancel" onClick={() => { setEditing(false); setShowBannerInput(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── My Hikes / Badges ── */}
      {!editing && (
        <>
          <div className="profile-page__section">
            <h2>My Hikes</h2>
            <div className="profile-page__empty">
              No hikes logged yet. Check in on your next trail to start tracking.
            </div>
          </div>
          <div className="profile-page__section">
            <h2>Badges</h2>
            <div className="profile-page__empty">Complete hikes to earn badges.</div>
          </div>
        </>
      )}

      <div className="profile-page__actions">
        <button className="profile-page__btn profile-page__btn--danger" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
