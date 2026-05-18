import { useEffect, useRef } from 'react';

export default function ProfileDropdown({ user, onClose, onLogout }) {
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="profile-dropdown" ref={ref}>
      <div className="profile-dropdown__header">
        <div className="profile-dropdown__name">{user.name}</div>
        <div className="profile-dropdown__email">{user.email || 'Guest'}</div>
      </div>

      <div className="profile-dropdown__stats">
        <div className="profile-dropdown__stat">
          <div className="profile-dropdown__stat-value">0</div>
          <div className="profile-dropdown__stat-label">Trails</div>
        </div>
        <div className="profile-dropdown__stat">
          <div className="profile-dropdown__stat-value">0</div>
          <div className="profile-dropdown__stat-label">Miles</div>
        </div>
        <div className="profile-dropdown__stat">
          <div className="profile-dropdown__stat-value">0</div>
          <div className="profile-dropdown__stat-label">Gems</div>
        </div>
      </div>

      <button className="profile-dropdown__item">⚙️ Settings</button>
      <button className="profile-dropdown__item">🏅 My Badges</button>
      <button className="profile-dropdown__item">📍 My Hikes</button>
      <button
        className="profile-dropdown__item profile-dropdown__item--danger"
        onClick={onLogout}
      >
        🚪 Sign Out
      </button>
    </div>
  );
}
