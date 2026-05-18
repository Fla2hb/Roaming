import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const SPIN_NAMES = [
  'Shadow Creek', 'Eagle Peak', 'Lost Coast', 'Crystal Basin', 'Mist Falls',
  'Thunder Ridge', 'Glass Mountain', 'Hidden Valley', 'Lone Pine Peak', 'Emerald Bay',
];

const RandomizerButton = forwardRef(function RandomizerButton({ trails, onResult }, ref) {
  const [spinning, setSpinning]     = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [winner, setWinner]         = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Expose spin() so parent can trigger it programmatically
  useImperativeHandle(ref, () => ({ spin: handleSpin }));

  function handleSpin() {
    if (spinning || !trails?.length) return;
    setSpinning(true);
    setWinner(null);

    let tick = 0;
    intervalRef.current = setInterval(() => {
      setDisplayName(SPIN_NAMES[tick % SPIN_NAMES.length]);
      tick++;
    }, 80);

    setTimeout(() => {
      clearInterval(intervalRef.current);
      const picked = trails[Math.floor(Math.random() * trails.length)];
      setDisplayName(picked.name);
      setWinner(picked);
      setSpinning(false);
      onResult?.(picked);
    }, 1600);
  }

  return (
    <div className="randomizer">
      <button
        className={`randomizer__btn ${spinning ? 'randomizer__btn--spinning' : ''}`}
        onClick={handleSpin}
        disabled={spinning || !trails?.length}
        aria-label="Pick a random trail"
      >
        {spinning ? 'Picking…' : 'Surprise Me'}
      </button>
      {displayName && (
        <div
          className={`randomizer__result ${spinning ? 'randomizer__result--spinning' : ''}`}
          onClick={() => !spinning && winner && onResult?.(winner)}
          title={!spinning ? 'Click to view trail' : undefined}
          style={!spinning ? { cursor: 'pointer' } : undefined}
        >
          {displayName}
        </div>
      )}
    </div>
  );
});

export default RandomizerButton;
