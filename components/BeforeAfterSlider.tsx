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
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className
}: BeforeAfterSliderProps) {
  const [inset, setInset] = useState<number>(50);
  const [onMouseDown, setOnMouseDown] = useState<boolean>(false);

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onMouseDown) return;

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

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative aspect-square w-full h-full overflow-hidden rounded-xl select-none bg-gray-100 cursor-ew-resize"
        onMouseMove={onMouseMove}
        onMouseUp={() => setOnMouseDown(false)}
        onMouseLeave={() => setOnMouseDown(false)}
        onTouchMove={onMouseMove}
        onTouchEnd={() => setOnMouseDown(false)}
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
              setOnMouseDown(true);
              onMouseMove(e);
            }}
            onMouseDown={(e) => {
              setOnMouseDown(true);
              onMouseMove(e);
            }}
            onTouchEnd={() => setOnMouseDown(false)}
            onMouseUp={() => setOnMouseDown(false)}
          >
            <GripVertical className="h-4 w-4 select-none text-gray-600" />
          </button>
        </div>

        {/* After Image (Right Side) */}
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="absolute left-0 top-0 z-10 w-full h-full object-cover rounded-xl select-none"
          style={{
            clipPath: "inset(0 0 0 " + inset + "%)",
          }}
        />

        {/* Before Image (Left Side) */}
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="absolute left-0 top-0 w-full h-full object-cover rounded-xl select-none"
        />

        {/* Labels */}
        <div className="absolute top-4 left-4 z-30">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-30">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
            {afterLabel}
          </span>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
            Drag to compare
          </span>
        </div>
      </div>
    </div>
  );
}
