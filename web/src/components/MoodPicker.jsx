const MOODS = [
  { id: null, emoji: '🔍', label: 'All Trails' },
  { id: 'peaceful', emoji: '🌿', label: 'Peaceful' },
  { id: 'blow-off-steam', emoji: '💪', label: 'Blow Off Steam' },
  { id: 'jaw-dropping', emoji: '🤩', label: 'Jaw-Dropping' },
];

export default function MoodPicker({ selected, onChange }) {
  return (
    <div className="mood-picker" role="group" aria-label="Pick a mood">
      {MOODS.map(m => (
        <button
          key={String(m.id)}
          className={`mood-picker__btn ${selected === m.id ? 'mood-picker__btn--active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          <span className="mood-picker__emoji">{m.emoji}</span>
          <span className="mood-picker__label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
