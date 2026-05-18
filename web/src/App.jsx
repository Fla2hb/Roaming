import { useState } from 'react';
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Landing onLogin={setUser} />;
  return (
    <Discover
      user={user}
      onLogout={() => setUser(null)}
      onUpdateUser={updated => setUser(updated)}
    />
  );
}
