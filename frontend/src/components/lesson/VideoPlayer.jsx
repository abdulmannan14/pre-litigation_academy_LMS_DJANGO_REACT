import ReactPlayer from 'react-player';
import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ url, lessonId, savedPosition = 0, onProgress }) {
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (ready && savedPosition > 0 && playerRef.current) {
      playerRef.current.seekTo(savedPosition, 'seconds');
    }
  }, [ready, savedPosition]);

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      onProgress && onProgress(state.playedSeconds);
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
      {/* Video wrapper with 16:9 aspect ratio */}
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        <div className="absolute inset-0">
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            muted={muted}
            onReady={() => setReady(true)}
            onProgress={handleProgress}
            onDuration={setDuration}
            progressInterval={5000}
            config={{
              youtube: { playerVars: { controls: 0, modestbranding: 1 } },
            }}
          />
        </div>
      </div>

      {/* Custom controls */}
      <div className="bg-[#1a1a1a] px-4 py-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 w-10 shrink-0">
            {formatTime(played * duration)}
          </span>
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-secondary"
          />
          <span className="text-xs text-gray-400 w-10 shrink-0 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying((p) => !p)}
              className="text-white hover:text-primary transition-colors"
            >
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-white hover:text-primary transition-colors"
            >
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.994 8.994 0 0017.73 18l2 2L21 18.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
              className="w-20 h-1 accent-secondary cursor-pointer"
            />
          </div>

          {/* Duration display */}
          <span className="text-xs text-gray-400">
            {Math.round(played * 100)}% watched
          </span>
        </div>
      </div>
    </div>
  );
}
