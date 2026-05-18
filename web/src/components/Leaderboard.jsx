import { useState } from 'react';

const DATA = {
  alltime: [
    { rank: 1,  name: 'Marcus T.',   trails: 186, miles: 2340 },
    { rank: 2,  name: 'Elena R.',    trails: 154, miles: 1890 },
    { rank: 3,  name: 'Jake M.',     trails: 127, miles: 1620 },
    { rank: 4,  name: 'Priya S.',    trails: 109, miles: 1380 },
    { rank: 5,  name: 'Chris W.',    trails: 93,  miles: 1140 },
    { rank: 6,  name: 'Devon P.',    trails: 78,  miles: 960  },
    { rank: 7,  name: 'Lily C.',     trails: 64,  miles: 790  },
    { rank: 8,  name: 'Ryan B.',     trails: 52,  miles: 640  },
    { rank: 9,  name: 'Mia T.',      trails: 41,  miles: 510  },
    { rank: 10, name: 'Sam O.',      trails: 33,  miles: 400  },
  ],
  monthly: [
    { rank: 1,  name: 'Priya S.',    trails: 19, miles: 238 },
    { rank: 2,  name: 'Marcus T.',   trails: 16, miles: 201 },
    { rank: 3,  name: 'Lily C.',     trails: 14, miles: 172 },
    { rank: 4,  name: 'Jake M.',     trails: 12, miles: 147 },
    { rank: 5,  name: 'Elena R.',    trails: 11, miles: 134 },
    { rank: 6,  name: 'Ryan B.',     trails: 9,  miles: 112 },
    { rank: 7,  name: 'Chris W.',    trails: 8,  miles: 97  },
    { rank: 8,  name: 'Devon P.',    trails: 7,  miles: 83  },
    { rank: 9,  name: 'Sam O.',      trails: 5,  miles: 61  },
    { rank: 10, name: 'Mia T.',      trails: 4,  miles: 48  },
  ],
  weekly: [
    { rank: 1,  name: 'Lily C.',     trails: 5, miles: 63 },
    { rank: 2,  name: 'Priya S.',    trails: 4, miles: 52 },
    { rank: 3,  name: 'Ryan B.',     trails: 4, miles: 47 },
    { rank: 4,  name: 'Jake M.',     trails: 3, miles: 38 },
    { rank: 5,  name: 'Marcus T.',   trails: 3, miles: 31 },
    { rank: 6,  name: 'Devon P.',    trails: 2, miles: 26 },
    { rank: 7,  name: 'Chris W.',    trails: 2, miles: 22 },
    { rank: 8,  name: 'Sam O.',      trails: 2, miles: 18 },
    { rank: 9,  name: 'Elena R.',    trails: 1, miles: 14 },
    { rank: 10, name: 'Mia T.',      trails: 1, miles: 11 },
  ],
};

const WEEKLY_CHALLENGES = [
  {
    id: 1,
    title: 'Hike 3 Trails This Week',
    desc: 'Complete any 3 hikes before Sunday midnight.',
    reward: 'Weekly Warrior badge',
    progress: 0,
    goal: 3,
    unit: 'trails',
  },
  {
    id: 2,
    title: 'Conquer 2,000 ft of Elevation',
    desc: 'Accumulate 2,000 ft of elevation gain across any hikes this week.',
    reward: 'Elevation badge',
    progress: 0,
    goal: 2000,
    unit: 'ft',
  },
  {
    id: 3,
    title: 'Find a Hidden Gem',
    desc: 'Submit or visit a hidden gem location this week.',
    reward: 'Gem Hunter badge',
    progress: 0,
    goal: 1,
    unit: 'gem',
  },
];

const PERIOD_LABELS = { alltime: 'All Time', monthly: 'This Month', weekly: 'This Week' };

export default function Leaderboard({ user }) {
  const [period, setPeriod] = useState('alltime');
  const rows = DATA[period];

  return (
    <div className="leaderboard">

      {/* ── Weekly Challenge ── */}
      <div className="leaderboard__challenges">
        <h2 className="leaderboard__section-title">Weekly Challenges</h2>
        <p className="leaderboard__section-sub">Resets every Monday. Complete them to earn badges.</p>
        <div className="leaderboard__challenge-grid">
          {WEEKLY_CHALLENGES.map(c => (
            <div key={c.id} className="challenge-card">
              <div className="challenge-card__title">{c.title}</div>
              <div className="challenge-card__desc">{c.desc}</div>
              <div className="challenge-card__progress-wrap">
                <div className="challenge-card__progress-bar">
                  <div
                    className="challenge-card__progress-fill"
                    style={{ width: `${Math.min((c.progress / c.goal) * 100, 100)}%` }}
                  />
                </div>
                <span className="challenge-card__progress-label">
                  {c.progress} / {c.goal.toLocaleString()} {c.unit}
                </span>
              </div>
              <div className="challenge-card__reward">{c.reward}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="leaderboard__section-title" style={{ marginBottom: 12 }}>Rankings</div>

      <div className="leaderboard__period-tabs">
        {Object.entries(PERIOD_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`leaderboard__period-tab ${period === key ? 'leaderboard__period-tab--active' : ''}`}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="leaderboard__table">
        <div className="leaderboard__row leaderboard__row--head">
          <span>#</span>
          <span>Hiker</span>
          <span>Trails</span>
          <span>Miles</span>
        </div>
        {rows.map(u => (
          <div
            key={u.rank}
            className={`leaderboard__row ${u.rank <= 3 ? 'leaderboard__row--top' : ''}`}
          >
            <span className="leaderboard__rank">
              {`#${u.rank}`}
            </span>
            <span className="leaderboard__name">{u.badge} {u.name}</span>
            <span>{u.trails}</span>
            <span>{u.miles.toLocaleString()} mi</span>
          </div>
        ))}
      </div>

      <div className="leaderboard__you">
        You're not on the board yet — start hiking to earn your spot.
      </div>
    </div>
  );
}
