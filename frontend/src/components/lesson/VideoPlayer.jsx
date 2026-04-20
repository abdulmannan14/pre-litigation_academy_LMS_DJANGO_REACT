import ReactPlayer from 'react-player';
import { useState, useRef, useEffect } from 'react';

function isYouTubeUrl(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function isUnsupportedFileFormat(url) {
  return url && /\.(mov|avi|wmv|flv|mkv)$/i.test(url);
}

// ─── Native HTML5 player (local MP4/WebM/Ogg files) ───────────────────────────
function NativePlayer({ url, lessonId, savedPosition, onProgress }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hasSeeked = useRef(false);
  const seekingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset on lesson change
  useEffect(() => {
    setPlaying(false);
    setPlayed(0);
    setDuration(0);
    setError(false);
    hasSeeked.current = false;
  }, [lessonId]);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleLoadedMetadata = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setDuration(vid.duration);
    if (savedPosition > 0 && !hasSeeked.current) {
      vid.currentTime = savedPosition;
      hasSeeked.current = true;
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || seekingRef.current) return;
    const frac = vid.duration ? vid.currentTime / vid.duration : 0;
    setPlayed(frac);
    onProgress && onProgress(vid.currentTime);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  const handleSeekMouseDown = () => { seekingRef.current = true; };
  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseUp = (e) => {
    seekingRef.current = false;
    const frac = parseFloat(e.target.value);
    setPlayed(frac);
    if (videoRef.current) {
      videoRef.current.currentTime = frac * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(false);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-gray-400">Failed to load video. Make sure the file is MP4 format.</p>
            <button onClick={() => setError(false)} className="text-xs text-secondary underline">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-black rounded-2xl overflow-hidden shadow-lg" style={isFullscreen ? { display: 'flex', flexDirection: 'column' } : {}}>
      {/* Video element — 16:9 (flex-1 in fullscreen so it fills space above controls) */}
      <div className="relative" style={isFullscreen ? { flex: 1 } : { paddingTop: '56.25%' }}>
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            src={url}
            width="100%"
            height="100%"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setPlaying(false)}
            onError={() => setError(true)}
            onVolumeChange={() => {
              if (videoRef.current) setMuted(videoRef.current.muted);
            }}
            muted={muted}
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      {/* Custom controls */}
      <div className="bg-[#1a1a1a] px-4 py-3">
        {/* Seek bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 w-10 shrink-0 tabular-nums">
            {formatTime(played * duration)}
          </span>
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={handleSeekMouseDown}
            onTouchStart={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-secondary"
          />
          <span className="text-xs text-gray-400 w-10 shrink-0 text-right tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
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

            {/* Mute */}
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
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

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-secondary cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 tabular-nums">
              {Math.round(played * 100)}% watched
            </span>
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="text-white hover:text-primary transition-colors"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── YouTube player (unchanged) ────────────────────────────────────────────────
function YouTubePlayer({ url, lessonId, savedPosition, onProgress }) {
  const playerRef = useRef(null);
  const hasSeeked = useRef(false);
  const seekingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setReady(false);
    setPlaying(false);
    setPlayed(0);
    setDuration(0);
    setError(false);
    hasSeeked.current = false;
  }, [lessonId]);

  useEffect(() => {
    if (ready && savedPosition > 0 && !hasSeeked.current && playerRef.current) {
      playerRef.current.seekTo(savedPosition, 'seconds');
      hasSeeked.current = true;
    }
  }, [ready, savedPosition]);

  const handleProgress = (state) => {
    if (!seekingRef.current) {
      setPlayed(state.played);
      onProgress && onProgress(state.playedSeconds);
    }
  };

  const handleSeekMouseDown = () => { seekingRef.current = true; };
  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value));
  const handleSeekMouseUp = (e) => {
    seekingRef.current = false;
    playerRef.current?.seekTo(parseFloat(e.target.value));
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-gray-400">Failed to load video.</p>
            <button onClick={() => setError(false)} className="text-xs text-secondary underline">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
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
            progressInterval={5000}
            onReady={() => setReady(true)}
            onProgress={handleProgress}
            onDuration={setDuration}
            onEnded={() => setPlaying(false)}
            onError={() => setError(true)}
            config={{
              youtube: { playerVars: { modestbranding: 1, rel: 0 } },
            }}
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 w-10 shrink-0 tabular-nums">
            {formatTime(played * duration)}
          </span>
          <input
            type="range" min={0} max={0.999999} step="any" value={played}
            onMouseDown={handleSeekMouseDown}
            onTouchStart={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-secondary"
          />
          <span className="text-xs text-gray-400 w-10 shrink-0 text-right tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className="text-white hover:text-primary transition-colors">
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} className="text-white hover:text-primary transition-colors">
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.994 8.994 0 0017.73 18l2 2L21 18.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
              )}
            </button>
            <input
              type="range" min={0} max={1} step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
              className="w-20 h-1 accent-secondary cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-400 tabular-nums">{Math.round(played * 100)}% watched</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main export — picks the right player ─────────────────────────────────────
export default function VideoPlayer({ url, lessonId, savedPosition = 0, onProgress }) {
  // No URL
  if (!url) {
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
            </svg>
            <p className="text-sm">No video available for this lesson.</p>
          </div>
        </div>
      </div>
    );
  }

  // Unsupported format
  if (isUnsupportedFileFormat(url)) {
    const ext = url.split('.').pop().toUpperCase();
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-gray-300 font-medium">Unsupported format (.{ext})</p>
            <p className="text-xs text-gray-500">Browsers only support MP4, WebM, or Ogg.<br />Please re-upload this lesson as an MP4 file.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isYouTubeUrl(url)) {
    return <YouTubePlayer url={url} lessonId={lessonId} savedPosition={savedPosition} onProgress={onProgress} />;
  }

  return <NativePlayer url={url} lessonId={lessonId} savedPosition={savedPosition} onProgress={onProgress} />;
}
