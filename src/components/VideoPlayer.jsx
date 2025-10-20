import React, { useEffect, useRef, useState } from 'react'

function formatTime(sec) {
  if (!isFinite(sec)) return '00:00';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(m)}:${pad(r)}`;
}

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [showUi, setShowUi] = useState(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrent(v.currentTime || 0);
    const onEnd = () => setPlaying(false);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const toggleMobileUi = () => {
    // Show/hide controls on tap for small screens; md+ uses hover via CSS
    setShowUi((prev) => {
      const next = !prev;
      try { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); } catch {}
      if (next) {
        hideTimerRef.current = setTimeout(() => setShowUi(false), 3000);
      }
      return next;
    });
  };

  const seek = (t) => {
    const v = videoRef.current; if (!v) return;
    const dur = duration || v.duration || 0;
    v.currentTime = Math.min(Math.max(0, t), dur);
  };
  const skip = (d) => seek(current + d);

  const onScrub = (e) => seek(Number(e.target.value));

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };
  const changeVolume = (val) => {
    const v = videoRef.current; if (!v) return;
    const clamped = Math.min(1, Math.max(0, val));
    v.volume = clamped; setVolume(clamped);
    if (clamped === 0 && !v.muted) { v.muted = true; setMuted(true); }
    if (clamped > 0 && v.muted) { v.muted = false; setMuted(false); }
  };

  const cycleRate = () => {
    const options = [0.5, 1, 1.25, 1.5];
    const idx = options.indexOf(rate);
    const next = options[(idx + 1) % options.length];
    const v = videoRef.current; if (!v) return;
    v.playbackRate = next; setRate(next);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current; if (!el) return;
    const doc = document;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement;
    try {
      if (isFs) {
        await (doc.exitFullscreen?.() || doc.webkitExitFullscreen?.());
      } else {
        await (el.requestFullscreen?.() || el.webkitRequestFullscreen?.());
      }
    } catch {}
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[500px] mt-5 group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="rounded-xl shadow-md w-full"
        playsInline
        onClick={toggleMobileUi}
        onTouchStart={toggleMobileUi}
      />

      <div
        className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl transition-opacity duration-200 ${showUi ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:opacity-0 md:group-hover:opacity-100 md:pointer-events-none md:group-hover:pointer-events-auto`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={onScrub}
          className="range range-xs w-full accent-pink-400"
        />

        <div className="mt-2 flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => skip(-10)} className="btn btn-ghost btn-xs text-white">-10s</button>
            <button onClick={togglePlay} className="btn btn-primary btn-xs bg-pink-400 border-none">
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => skip(10)} className="btn btn-ghost btn-xs text-white">+10s</button>
            <span className="ml-2 tabular-nums">{formatTime(current)} / {formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="btn btn-ghost btn-xs text-white">{muted || volume===0 ? 'Unmute' : 'Mute'}</button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e)=>changeVolume(Number(e.target.value))}
              className="range range-xs w-24 accent-pink-300"
            />
            <button onClick={cycleRate} className="btn btn-ghost btn-xs text-white">{rate}x</button>
            <button onClick={toggleFullscreen} className="btn btn-ghost btn-xs text-white">Full</button>
          </div>
        </div>
      </div>
    </div>
  )
}
