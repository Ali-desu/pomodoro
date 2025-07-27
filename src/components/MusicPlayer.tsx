import { useState, useRef, useEffect } from 'react';
import '../styles/musicplayer.css';

interface Track {
  name: string;
  artist: string;
  url: string;
  cover: string;
}

interface MusicPlayerProps {
  theme: 'light' | 'dark';
}

export default function MusicPlayer({ theme }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.3);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks: Track[] = [
    {
      name: "acoustic breeze",
      artist: "Unknown",
      url: "/shared/playlist1.mp3",
      cover: "🌧️"
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e: Error) => {
          console.log("Audio play failed:", e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    setCurrentTrack(next);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e: Error) => console.log("Auto-play failed:", e));
    }
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e: Error) => console.log("Auto-play failed:", e));
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = Math.max(0, Math.min(percent * duration, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const handleAudioLoad = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e: Error) => console.log("Auto-play failed:", e));
    }
  };

  return (
    <div className={`music-player ${theme}`}>
      <button 
        className={`music-toggle ${showPlayer ? 'active' : ''}`}
        onClick={() => setShowPlayer(!showPlayer)}
        title="Toggle music player"
      >
        {tracks[currentTrack].cover}
      </button>
      
      {showPlayer && (
        <div className="music-panel">
          <div className="track-info">
            <div className="track-cover">{tracks[currentTrack].cover}</div>
            <div className="track-details">
              <div className="track-name">{tracks[currentTrack].name}</div>
              <div className="track-artist">{tracks[currentTrack].artist}</div>
            </div>
          </div>
          
          <div className="progress-section">
            <span className="time-display">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={seekTo}>
              <div 
                className="progress-fill"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="time-display">{formatTime(duration)}</span>
          </div>
          
          <div className="music-controls">
            <button className="music-btn" onClick={prevTrack} title="Previous track">
              ⏮️
            </button>
            <button 
              className={`music-btn play-btn ${isPlaying ? 'playing' : ''}`} 
              onClick={togglePlay} 
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button className="music-btn" onClick={nextTrack} title="Next track">
              ⏭️
            </button>
          </div>
          
          <div className="volume-control">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="volume-percentage">{Math.round(volume * 100)}%</span>
          </div>
          
          <div className="track-list">
            {tracks.map((track, index) => (
              <div 
                key={index}
                className={`track-item ${index === currentTrack ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTrack(index);
                  setCurrentTime(0);
                  if (isPlaying && audioRef.current) {
                    audioRef.current.play().catch((e: Error) => console.log("Auto-play failed:", e));
                  }
                }}
              >
                <span className="track-cover-small">{track.cover}</span>
                <div className="track-info-small">
                  <span className="track-name-small">{track.name}</span>
                  <span className="track-artist-small">{track.artist}</span>
                </div>
                {index === currentTrack && isPlaying && (
                  <span className="playing-indicator">🎵</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <audio
        ref={audioRef}
        src={tracks[currentTrack].url}
        onEnded={handleTrackEnd}
        onLoadedData={handleAudioLoad}
        preload="metadata"
      />
    </div>
  );
}