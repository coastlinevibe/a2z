"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleVideoPlayerProps {
  src: string;
  className?: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress and time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isFinite(prog) ? prog : 0);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  // Video ended
  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const time = (percent / 100) * (videoRef.current.duration || 0);
    if (isFinite(time)) {
      videoRef.current.currentTime = time;
      setProgress(percent);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden rounded-xl bg-black", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        preload="metadata"
        muted={isMuted}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] bg-black/50 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-3">
          {/* Progress Bar */}
          <div
            className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/70 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Control Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 w-8 h-8 p-0" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              {/* Volume */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 w-8 h-8 p-0" 
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              {/* Timer */}
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 w-8 h-8 p-0" 
                onClick={toggleFullscreen}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoPlayer;
