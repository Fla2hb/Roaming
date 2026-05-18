import { useRef, useState } from 'react';

const FEATURES = [
  {
    title: "Can't Decide? Let Us Pick",
    desc: "Hit Surprise Me and we'll pick a trail for you based on your filters. No more decision fatigue.",
  },
  {
    title: 'Hidden Gems',
    desc: "Discover secret spots submitted by the community and verified by our team — places most people never find.",
  },
  {
    title: 'Safety Built In',
    desc: "Check in before you hike. If you don't check out on time, your emergency contact gets your last location automatically.",
  },
  {
    title: 'Discovery First',
    desc: 'Browse by trail type — jaw-dropping views, peaceful escapes, or a workout that clears your head.',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.',  trails: 19, miles: 238 },
  { rank: 2, name: 'Marcus T.', trails: 16, miles: 201 },
  { rank: 3, name: 'Lily C.',   trails: 14, miles: 172 },
  { rank: 4, name: 'Jake M.',   trails: 12, miles: 147 },
  { rank: 5, name: 'Elena R.',  trails: 11, miles: 134 },
];

// 2-step auth states: 'email' → 'password' (existing) or 'signup' (new)
export default function Landing({ onLogin }) {
  const loginRef = useRef(null);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function scrollToLogin() {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    // In Phase 2 this hits POST /auth/check-email
    // For now: simulate — treat any @demo.com as existing, everything else as new
    const exists = email.endsWith('@demo.com');
    setStep(exists ? 'password' : 'signup');
  }

  function handleFinalSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    onLogin({ email, name: name || email.split('@')[0] });
  }

  return (
    <div className="landing">

      {/* ── Hero ── */}
      <section className="landing__hero">
        <div className="landing__hero-bg" />
        <nav className="landing__nav">
          <div className="landing__nav-logo">Roaming</div>
          <button className="landing__nav-cta" onClick={scrollToLogin}>Sign In</button>
        </nav>
        <div className="landing__hero-content">
          <p className="landing__hero-eyebrow">California Trail Discovery</p>
          <h1 className="landing__hero-title">Find your next<br />great hike.</h1>
          <button className="landing__hero-btn" onClick={scrollToLogin}>
            Start Exploring →
          </button>
        </div>
        <div className="landing__hero-scroll">scroll to explore ↓</div>
      </section>

      {/* ── Features ── */}
      <section className="landing__features">
        <div className="landing__section-header">
          <h2>Why Roaming?</h2>
          <p>Built for hikers who want discovery, not a spreadsheet.</p>
        </div>
        <div className="landing__features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="landing__feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section className="landing__leaderboard">
        <div className="landing__section-header">
          <h2>Top Explorers</h2>
          <p>The most active hikers in the Roaming community this month.</p>
        </div>
        <div className="landing__lb-table">
          <div className="landing__lb-header">
            <span>#</span><span>Hiker</span><span>Trails</span><span>Miles</span>
          </div>
          {LEADERBOARD.map(u => (
            <div key={u.rank} className={`landing__lb-row ${u.rank === 1 ? 'landing__lb-row--gold' : ''}`}>
              <span className="landing__lb-rank">#{u.rank}</span>
              <span className="landing__lb-name">{u.name}</span>
              <span>{u.trails}</span>
              <span>{u.miles.toLocaleString()} mi</span>
            </div>
          ))}
        </div>
        <p className="landing__lb-note">Sign up to appear on the leaderboard.</p>
      </section>

      {/* ── Login ── */}
      <section className="landing__login" ref={loginRef}>
        <div className="landing__login-card">
          <h2 className="landing__login-title">Join Roaming</h2>
          <p className="landing__login-sub">Free to use. No credit card required.</p>

          {/* Step 1 — email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <div className="login__field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {error && <p className="login__error">{error}</p>}
              <button className="login__btn" type="submit">Continue →</button>
              <div className="login__skip">
                Just browsing?{' '}
                <button type="button" onClick={() => onLogin({ email: '', name: 'Explorer' })}>
                  Continue as guest
                </button>
              </div>
            </form>
          )}

          {/* Step 2a — existing account */}
          {step === 'password' && (
            <form onSubmit={handleFinalSubmit}>
              <div className="login__step-back">
                <button type="button" onClick={() => { setStep('email'); setError(''); }}>← {email}</button>
              </div>
              <div className="login__field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {error && <p className="login__error">{error}</p>}
              <button className="login__btn" type="submit">Sign In</button>
            </form>
          )}

          {/* Step 2b — new account */}
          {step === 'signup' && (
            <form onSubmit={handleFinalSubmit}>
              <div className="login__step-back">
                <button type="button" onClick={() => { setStep('email'); setError(''); }}>← {email}</button>
              </div>
              <p className="login__new-msg">No account found — let's create one.</p>
              <div className="login__field">
                <label>Your name</label>
                <input
                  type="text"
                  placeholder="Trail name or real name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="login__field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="login__error">{error}</p>}
              <button className="login__btn" type="submit">Create Account</button>
            </form>
          )}
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-logo">Roaming</div>
        <p>Discover your next trail · California</p>
      </footer>
    </div>
  );
}
