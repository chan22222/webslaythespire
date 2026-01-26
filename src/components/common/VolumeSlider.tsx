import { useState, useEffect } from 'react';
import { setGlobalVolume } from '../../utils/sound';

export function VolumeSlider() {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('gameVolume');
    return saved !== null ? parseInt(saved) : 100;
  });

  useEffect(() => {
    // 초기 볼륨 적용
    setGlobalVolume(volume / 100);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setGlobalVolume(vol / 100);
    localStorage.setItem('gameVolume', vol.toString());
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70"
        style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
      >
        {volume === 0 ? '🔇' : '🔊'}
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        className="w-16 sm:w-20 h-1 appearance-none bg-[var(--gold-dark)]/30 rounded-full cursor-pointer"
        style={{
          accentColor: 'var(--gold)',
        }}
        onChange={handleVolumeChange}
      />
    </div>
  );
}
