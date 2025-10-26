"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  title: string
  description: string
  showAvailability?: boolean
  className?: string
}

export function GridBackground({
  title,
  description,
  showAvailability = true,
  className,
}: GridBackgroundProps) {
  return (
    <div 
      className={cn(
        'px-6 py-4 rounded-md relative flex items-center justify-center',
        className
      )}
      style={{
        backgroundColor: 'rgba(236, 253, 245, 0.9)',
        backgroundImage: `
          linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    >
      <div 
        className="w-3 h-3 rounded-full absolute shadow-[0_0_15px] shadow-current z-10 bg-current"
        style={{
          animation: `
            border-follow 6s linear 5,
            color-change 6s linear 5,
            fade-out 0.5s ease-out 29.5s forwards
          `
        }}
      />
      <div 
        className="absolute inset-0 border-2 rounded-md border-emerald-500"
        style={{
          animation: 'border-color-change 6s linear 5 forwards'
        }}
      />

      <div className="relative z-20 text-center max-w-7xl">
        <h1 className='text-3xl font-bold text-emerald-800'>{title}</h1>
        {description && (
          <p className='text-xs mt-1 text-emerald-700'>{description}</p>
        )}

        {showAvailability && (
          <div className="available-now text-emerald-600 text-sm flex items-center justify-center mt-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full inline-block mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            Call Now
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes border-follow {
          0% { top: 0; left: 0; }
          25% { top: 0; left: calc(100% - 12px); }
          50% { top: calc(100% - 12px); left: calc(100% - 12px); }
          75% { top: calc(100% - 12px); left: 0; }
          100% { top: 0; left: 0; }
        }
        
        @keyframes color-change {
          0%, 100% { color: #10b981; }
          25% { color: #059669; }
          50% { color: #047857; }
          75% { color: #065f46; }
        }
        
        @keyframes border-color-change {
          0%, 100% { border-color: #10b981; }
          25% { border-color: #059669; }
          50% { border-color: #047857; }
          75% { border-color: #065f46; }
        }
        
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
