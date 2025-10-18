'use client'

import { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  showPasswordToggle?: boolean
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, type, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPasswordType = type === 'password'
    const inputType = isPasswordType && showPassword ? 'text' : type

    return (
      <label className="relative block">
        <div className="relative">
          <input
            type={inputType}
            className={clsx(
              'peer w-full bg-gray-800 text-white pt-5 pb-1 px-3 outline-none border border-gray-600 rounded-lg transition-all duration-300 focus:border-emerald-400 valid:border-emerald-400',
              showPasswordToggle && isPasswordType && 'pr-10',
              className
            )}
            placeholder=" "
            ref={ref}
            {...props}
          />
          <span className="absolute left-3 top-0 text-gray-400 text-sm cursor-text transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-emerald-400 peer-focus:font-semibold peer-valid:top-0 peer-valid:text-sm peer-valid:text-emerald-400 peer-valid:font-semibold">
            {label}
          </span>
          {showPasswordToggle && isPasswordType && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </label>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'

interface AnimatedFormProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedForm({ children, className }: AnimatedFormProps) {
  return (
    <div className={clsx(
      'flex flex-col gap-4 max-w-sm p-6 rounded-2xl relative bg-gray-900 text-white border border-gray-700 shadow-2xl',
      className
    )}>
      {children}
    </div>
  )
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <button
      className={clsx(
        'border-none outline-none py-3 px-4 rounded-lg text-white text-base transition-all duration-300 bg-emerald-600 hover:bg-emerald-500 transform hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
