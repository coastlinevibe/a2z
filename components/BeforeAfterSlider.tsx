"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeDescription?: string | null;
  afterDescription?: string | null;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeDescription,
  afterDescription,
  className
}: BeforeAfterSliderProps) {
  const [inset, setInset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;

    if ("touches" in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
    } else if ("clientX" in e) {
      x = e.clientX - rect.left;
    }
    
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setInset(percentage);
  };

  const normalizedInset = Math.max(0, Math.min(100, inset));
  const showingAfter = normalizedInset >= 50;
  const activeLabel = showingAfter ? afterLabel : beforeLabel;
  const activeDescription = showingAfter ? afterDescription : beforeDescription;
  const hasDescription = activeDescription && activeDescription.trim().length > 0;

  return (
    <div className="relative w-full group">
      <div
        className={cn(
          "relative w-full aspect-square overflow-hidden rounded-xl select-none bg-gray-100 cursor-ew-resize",
          className
        )}
        onMouseMove={onMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={onMouseMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Divider Line */}
        <div
          className="bg-white h-full w-1 absolute z-20 top-0 -ml-0.5 select-none shadow-lg"
          style={{
            left: inset + "%",
          }}
        >
          {/* Drag Handle */}
          <button
            className="bg-white rounded-full hover:scale-110 transition-all w-8 h-8 select-none -translate-y-1/2 absolute top-1/2 -ml-4 z-30 cursor-ew-resize flex justify-center items-center shadow-lg border-2 border-gray-200"
            onTouchStart={(e) => {
              setIsDragging(true);
              onMouseMove(e);
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              onMouseMove(e);
            }}
            onTouchEnd={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
          >
            <GripVertical className="h-4 w-4 select-none text-gray-600" />
          </button>
        </div>

        {/* Before Image (base layer) */}
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="absolute left-0 top-0 w-full h-full object-cover rounded-xl select-none"
          style={{
            clipPath: `inset(0 ${Math.max(0, normalizedInset)}% 0 0)`,
          }}
        />

        {/* After Image overlay */}
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="absolute left-0 top-0 z-10 w-full h-full object-cover rounded-xl select-none"
          style={{
            clipPath: `inset(0 0 0 ${Math.max(0, 100 - normalizedInset)}%)`,
          }}
        />

        {/* Labels */}
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <span className="px-3 py-1 rounded-full text-sm font-medium shadow-md text-white"
            style={{
              background: showingAfter
                ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                : 'linear-gradient(135deg, #1d4ed8, #2563eb)'
            }}
          >
            {showingAfter ? afterLabel : beforeLabel}
          </span>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
            Drag to compare
          </span>
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-4 flex items-center transition-opacity duration-200",
          isDragging || normalizedInset <= 5
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        <div className="max-w-[220px] rounded-xl border border-gray-200 bg-white/90 shadow-lg px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{activeLabel}</p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
            {hasDescription ? activeDescription : 'Add a description to tell buyers about this view.'}
          </p>
        </div>
      </div>
    </div>
  );
}
