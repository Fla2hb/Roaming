import { useState } from 'react';

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    // Frontend-only for now — backend auth comes in Phase 2
    onLogin({ email: form.email, name: form.name || form.email.split('@')[0] });
  }

  return (
    <div className="login">
      <div className="login__bg" />
      <div className="login__card">
        <div className="login__logo">Roaming</div>
        <p className="login__tagline">Discover your next trail</p>

        <div className="login__tabs">
          <button className={`login__tab ${tab === 'signin' ? 'login__tab--active' : ''}`} onClick={() => setTab('signin')}>Sign In</button>
          <button className={`login__tab ${tab === 'signup' ? 'login__tab--active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="login__field">
              <label>Name</label>
              <input type="text" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
          )}
          <div className="login__field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="login__field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <button className="login__btn" type="submit">
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login__skip">
          Just browsing?{' '}
          <button onClick={() => onLogin({ email: '', name: 'Explorer' })}>Continue as guest</button>
        </div>
      </div>
    </div>
  );
}
