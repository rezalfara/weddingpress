"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  isPlaying: boolean; // Dikontrol oleh parent
}

export function AudioPlayer({ src, isPlaying }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().then(() => {
          setIsCurrentlyPlaying(true);
        }).catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
        setIsCurrentlyPlaying(false);
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isCurrentlyPlaying) {
        audioRef.current.pause();
        setIsCurrentlyPlaying(false);
      } else {
        audioRef.current.play();
        setIsCurrentlyPlaying(true);
      }
    }
  };

  if (!src) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Sembunyikan elemen audio */}
      <audio ref={audioRef} src={src} loop />
      <Button
        onClick={togglePlay}
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg"
      >
        {isCurrentlyPlaying ? (
          <Pause className="h-5 w-5 animate-pulse" />
        ) : (
          <Music className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}