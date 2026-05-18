import { useState, useRef, useEffect } from 'react';

const DEMO_GEMS = [
  {
    id: 1,
    name: 'Phantom Falls',
    location: 'Bidwell Park, Chico CA',
    category: 'Waterfall',
    desc: `A seasonal waterfall that only runs December through April. The canyon walls glow orange at sunset — most people never find it because there's no trail sign.`,
    photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
    submittedBy: 'Marcus T.',
  },
  {
    id: 2,
    name: 'Glass Beach Overlook',
    location: 'Fort Bragg, Mendocino CA',
    category: 'Viewpoint',
    desc: 'A hidden bluff above Glass Beach with an unobstructed view of the Pacific. Locals only know about it — park at the north lot and follow the fence line west.',
    photo: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&q=80',
    submittedBy: 'Priya S.',
  },
  {
    id: 3,
    name: 'Mirror Lake (Offseason)',
    location: 'Yosemite Valley, CA',
    category: 'Swimming Hole',
    desc: 'Most visitors skip Mirror Lake after July when it dries up — but the sandy flats and granite slabs left behind are perfect for solitude. Zero crowds from August on.',
    photo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
    submittedBy: 'Elena R.',
  },
  {
    id: 4,
    name: 'Telescope Peak Cold Spring',
    location: 'Death Valley NP, CA',
    category: 'Spring',
    desc: 'A cold freshwater spring at 10,000 ft in Death Valley — temperatures 40°F cooler than the valley floor. Pinyon pines and absolute silence.',
    photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=80',
    submittedBy: 'Jake M.',
  },
  {
    id: 5,
    name: 'Secret Tide Pools at Treasure Cove',
    location: 'Marin Headlands, CA',
    category: 'Tide Pools',
    desc: 'Accessible only at low tide via a short scramble. Ochre sea stars, purple urchins, and hermit crabs — bring a tide chart and go at -0.5 ft or lower.',
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80',
    submittedBy: 'Lily C.',
  },
];

const CATEGORIES = ['Viewpoint', 'Waterfall', 'Swimming Hole', 'Spring', 'Tide Pools', 'Cave', 'Meadow', 'Other'];

const EMPTY_FORM = { name: '', area: '', exactLocation: '', category: '', desc: '' };

export default function HiddenGems({ user }) {
  const [gems, setGems] = useState(DEMO_GEMS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  // Revoke object URL when it changes to avoid memory leaks
  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.area.trim() || !form.desc.trim()) {
      setFormError('Name, location, and description are required.');
      return;
    }
    // In Phase 2: upload photoFile to S3 via pre-signed URL, then POST /hidden-gems
    // For now just show the thank-you state
    setSubmitted(true);
    setForm(EMPTY_FORM);
    removePhoto();
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3500);
  }

  return (
    <div className="gems">

      {/* ── Header ── */}
      <div className="gems__header">
        <div>
          <h2 className="gems__title">Hidden Gems</h2>
          <p className="gems__sub">
            Secret spots submitted by the community and verified by our team.
          </p>
        </div>
        <button className="gems__submit-btn" onClick={() => { setShowForm(true); setSubmitted(false); }}>
          + Submit a Gem
        </button>
      </div>

      {/* ── Gem Cards ── */}
      <div className="gems__grid">
        {gems.map(gem => (
          <div
            key={gem.id}
            className={`gem-card ${expanded === gem.id ? 'gem-card--expanded' : ''}`}
            onClick={() => setExpanded(expanded === gem.id ? null : gem.id)}
          >
            <div className="gem-card__img-wrap">
              {gem.photo
                ? <img src={gem.photo} alt={gem.name} />
                : <div className="gem-card__img-placeholder" />
              }
              <span className="gem-card__category">{gem.category}</span>
            </div>
            <div className="gem-card__body">
              <div className="gem-card__name">{gem.name}</div>
              <div className="gem-card__location">{gem.location}</div>
              {expanded === gem.id && (
                <p className="gem-card__desc">{gem.desc}</p>
              )}
              <div className="gem-card__footer">
                <span className="gem-card__by">Found by {gem.submittedBy}</span>
                <span className="gem-card__toggle">
                  {expanded === gem.id ? 'Less' : 'Read more'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Submission Form Modal ── */}
      {showForm && (
        <div className="gems__overlay" onClick={() => setShowForm(false)}>
          <div className="gems__modal" onClick={e => e.stopPropagation()}>
            <div className="gems__modal-header">
              <h3>Submit a Hidden Gem</h3>
              <button className="gems__modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            {submitted ? (
              <div className="gems__thanks">
                <div className="gems__thanks-icon">✓</div>
                <div className="gems__thanks-title">Thanks for sharing!</div>
                <p className="gems__thanks-msg">
                  Your gem is under review. Once approved by our team it'll appear here for the community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="gems__form">
                <p className="gems__form-note">
                  Submissions are reviewed before going live. Please don't share exact GPS coordinates — a general area is enough.
                </p>

                <div className="gems__field">
                  <label>What do you call this place?</label>
                  <input
                    placeholder="e.g. Secret Waterfall above Muir Woods"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    maxLength={60}
                  />
                </div>

                <div className="gems__field">
                  <label>General area or park</label>
                  <input
                    placeholder="e.g. Point Reyes, Marin County CA"
                    value={form.area}
                    onChange={e => set('area', e.target.value)}
                    maxLength={80}
                  />
                </div>

                <div className="gems__field">
                  <label>
                    Exact spot
                    <span className="gems__optional">(optional)</span>
                  </label>
                  <input
                    placeholder="Address, trailhead name, or GPS coords (e.g. 37.8651, -119.5383)"
                    value={form.exactLocation}
                    onChange={e => set('exactLocation', e.target.value)}
                    maxLength={120}
                  />
                  <span className="gems__field-hint">
                    Only shared with our review team — not shown publicly.
                  </span>
                </div>

                <div className="gems__field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">— Select one —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="gems__field">
                  <label>
                    Describe it
                    <span className="gems__char-count">{form.desc.length}/280</span>
                  </label>
                  <textarea
                    placeholder="What makes this place special? How do you get there? Any tips?"
                    value={form.desc}
                    onChange={e => set('desc', e.target.value)}
                    maxLength={280}
                    rows={4}
                  />
                </div>

                <div className="gems__field">
                  <label>Photo <span className="gems__optional">(optional)</span></label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <div className="gems__photo-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button type="button" className="gems__photo-remove" onClick={removePhoto}>
                        × Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="gems__upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="gems__upload-icon">↑</span>
                      <span className="gems__upload-text">Click to upload a photo</span>
                      <span className="gems__upload-hint">JPG, PNG, WEBP · Max 10MB</span>
                    </button>
                  )}
                </div>

                {formError && <p className="gems__form-error">{formError}</p>}

                <div className="gems__form-actions">
                  <button type="submit" className="gems__form-submit">Submit for Review</button>
                  <button type="button" className="gems__form-cancel" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
