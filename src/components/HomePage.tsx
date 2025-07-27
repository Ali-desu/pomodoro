import { useEffect, useState } from 'react';
import MusicPlayer from './MusicPlayer';
import '../styles/homepage.css';

export default function App() {
  const [timer, setTimer] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isRestMode, setIsRestMode] = useState<boolean>(false);
  const [workTime, setWorkTime] = useState<number>(25);
  const [restTime, setRestTime] = useState<number>(5);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // New theme state

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            if (isRestMode) {
              setIsRestMode(false);
              setTimer(workTime * 60);
            } else {
              setIsRestMode(true);
              setTimer(restTime * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isRestMode, workTime, restTime]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    const defaultTime = isRestMode ? restTime : workTime;
    setTimer(defaultTime * 60);
    setIsActive(false);
  };

  const handleModeSwitch = () => {
    const newMode = !isRestMode;
    setIsRestMode(newMode);
    const newTime = newMode ? restTime : workTime;
    setTimer(newTime * 60);
    setIsActive(false);
  };

  const adjustTime = (adjustment: number) => {
    if (isActive) return;
    const newSeconds = Math.max(60, timer + (adjustment * 60));
    setTimer(newSeconds);
    const newMinutes = Math.floor(newSeconds / 60);
    if (isRestMode) {
      setRestTime(newMinutes);
    } else {
      setWorkTime(newMinutes);
    }
  };

  const handleTimeInput = (value: string) => {
    const minutes = parseInt(value);
    if (minutes > 0 && minutes <= 180) {
      if (isRestMode) {
        setRestTime(minutes);
        setTimer(minutes * 60);
      } else {
        setWorkTime(minutes);
        setTimer(minutes * 60);
      }
    }
    setIsEditing(false);
  };

  const currentMinutes = Math.floor(timer / 60);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`home ${theme}`}>
      <div className="overlay">
        <div className="container">
          <h1 className="title">FocusFlow</h1>
          <p className="subtitle">Enter your zone. Stay productive.</p>

          <button
            className="btn theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          <div className="mode-indicator">
            <div className={`mode-badge ${isRestMode ? 'rest' : 'work'}`}>
              {isRestMode ? '☕ Rest Time' : '💪 Work Time'}
            </div>
          </div>

          <div className="timer">
            <div className="time-controls">
              <button 
                className="time-adjust-btn" 
                onClick={() => adjustTime(-1)}
                disabled={isActive}
                title="Decrease by 1 minute"
              >
                −
              </button>
              
              <div className="time-display-container">
                {isEditing ? (
                  <input
                    type="number"
                    className="time-input"
                    value={currentMinutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeInput(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        handleTimeInput((e.target as HTMLInputElement).value);
                      } else if (e.key === 'Escape') {
                        setIsEditing(false);
                      }
                    }}
                    min="1"
                    max="180"
                    autoFocus
                  />
                ) : (
                  <div 
                    className={`time-display ${isActive ? 'active' : ''}`}
                    onClick={() => !isActive && setIsEditing(true)}
                    title="Click to edit time"
                  >
                    {formatTime(timer)}
                  </div>
                )}
              </div>
              
              <button 
                className="time-adjust-btn" 
                onClick={() => adjustTime(1)}
                disabled={isActive}
                title="Increase by 1 minute"
              >
                +
              </button>
            </div>

            <div className="controls">
              {!isActive ? (
                <button className="btn btn-primary" onClick={() => setIsActive(true)}>
                  Start
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setIsActive(false)}>
                  Pause
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
              <button 
                className="btn btn-tertiary" 
                onClick={handleModeSwitch}
                disabled={isActive}
              >
                {isRestMode ? 'Switch to Work' : 'Take a Break'}
              </button>
            </div>
          </div>

          <div className="presets">
            <div className="preset-section">
              <h3>Quick Presets</h3>
              <div className="preset-buttons">
                <button 
                  className="preset-btn" 
                  onClick={() => {
                    if (!isActive) {
                      setWorkTime(25);
                      setRestTime(5);
                      setIsRestMode(false);
                      setTimer(25 * 60);
                    }
                  }}
                  disabled={isActive}
                >
                  25/5 Classic
                </button>
                <button 
                  className="preset-btn" 
                  onClick={() => {
                    if (!isActive) {
                      setWorkTime(50);
                      setRestTime(10);
                      setIsRestMode(false);
                      setTimer(50 * 60);
                    }
                  }}
                  disabled={isActive}
                >
                  50/10 Extended
                </button>
                <button 
                  className="preset-btn" 
                  onClick={() => {
                    if (!isActive) {
                      setWorkTime(15);
                      setRestTime(3);
                      setIsRestMode(false);
                      setTimer(15 * 60);
                    }
                  }}
                  disabled={isActive}
                >
                  15/3 Quick
                </button>
              </div>
            </div>
          </div>

          <div className="music-player-section">
            <MusicPlayer theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}