import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const CustomAudioPlayer = ({ src }) => {
  

const audioSrc = src.replace(/\.webm$/, ".mp3");


  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateDuration = () => {
      
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnd = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    };

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
      // Make sure to cancel animation frame on cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [src]);

  // Animation function for smooth progress updates
  const animateProgress = () => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const currentTime = audioRef.current.currentTime;
    setCurrentTime(currentTime);
    
    // Update progress bar width
    const progressPercent = (currentTime / duration) * 100;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressPercent}%`;
    }
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animateProgress);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(animateProgress);
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e) => {
    const time = parseFloat(e.target.value);
    if (!isNaN(time) && audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      
      // Update progress bar immediately for responsive feel
      const progressPercent = (time / duration) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progressPercent}%`;
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-900 to-blue-200 rounded-3xl shadow-sm border border-gray-100 w-full min-w-[160px] md:min-w-[200px] max-w-[320px] group relative">
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-300 shadow-lg z-2"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-2 relative h-12">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
          <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="absolute h-full bg-gradient-to-r from-purple-400 to-blue-400"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 1}
              value={currentTime}
              onChange={handleTimeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek audio position"
            />
          </div>
        </div>

        <div className="absolute bottom-0 right-0">
          <span className="text-sm text-white font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc} preload="metadata" />
    </div>
  );
};

export default CustomAudioPlayer;
