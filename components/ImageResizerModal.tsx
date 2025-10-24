'use client'

import { useState, useEffect } from 'react'
import { X, Crop, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { cn, formatFileSize, resizeImage, type ResizeOptions, type ResizeResult } from '@/lib/utils'

interface ImageResizerModalProps {
  isOpen: boolean
  onClose: () => void
  file: File
  resizeOptions: ResizeOptions
  onResizeComplete: (resizedFile: File) => void
  onKeepOriginal: () => void
}

export function ImageResizerModal({
  isOpen,
  onClose,
  file,
  resizeOptions,
  onResizeComplete,
  onKeepOriginal
}: ImageResizerModalProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeResult, setResizeResult] = useState<ResizeResult | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [resizedPreview, setResizedPreview] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Generate original preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setOriginalPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  // Clean up resized preview
  useEffect(() => {
    return () => {
      if (resizedPreview) {
        URL.revokeObjectURL(resizedPreview)
      }
    }
  }, [resizedPreview])

  const handleResize = async () => {
    setIsResizing(true)
    setError('')

    try {
      const result = await resizeImage(file, resizeOptions)
      setResizeResult(result)
      
      // Create preview for resized image
      const url = URL.createObjectURL(result.resizedFile)
      setResizedPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resize image')
    } finally {
      setIsResizing(false)
    }
  }

  const handleConfirmResize = () => {
    if (resizeResult) {
      onResizeComplete(resizeResult.resizedFile)
      onClose()
    }
  }

  const handleClose = () => {
    setResizeResult(null)
    setError('')
    if (resizedPreview) {
      URL.revokeObjectURL(resizedPreview)
      setResizedPreview('')
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Crop className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Resize Image
              </h2>
              <p className="text-sm text-gray-600">
                Your image needs to be resized to fit perfectly
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Image Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                Original Image
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {resizeOptions.targetWidth}×{resizeOptions.targetHeight}px needed
                </span>
              </h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                {originalPreview && (
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Size: {formatFileSize(file.size)}</p>
                {resizeResult && (
                  <p>Dimensions: {resizeResult.originalDimensions.width}×{resizeResult.originalDimensions.height}px</p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-400" />
            </div>

            {/* Resized */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                Resized Image
                {resizeResult && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    Perfect fit!
                  </span>
                )}
              </h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                {isResizing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Resizing...</p>
                    </div>
                  </div>
                )}
                {resizedPreview && (
                  <img
                    src={resizedPreview}
                    alt="Resized"
                    className="w-full h-full object-cover"
                  />
                )}
                {!isResizing && !resizedPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Preview will appear here</p>
                  </div>
                )}
              </div>
              {resizeResult && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Size: {formatFileSize(resizeResult.newSize)}</p>
                  <p>Dimensions: {resizeResult.newDimensions.width}×{resizeResult.newDimensions.height}px</p>
                  {resizeResult.newSize < resizeResult.originalSize && (
                    <p className="text-emerald-600 font-medium">
                      ✓ {Math.round((1 - resizeResult.newSize / resizeResult.originalSize) * 100)}% smaller
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">What we'll do:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Resize to {resizeOptions.targetWidth}×{resizeOptions.targetHeight}px</li>
                  <li>• Keep the best parts of your image (smart cropping)</li>
                  <li>• Maintain high quality</li>
                  <li>• Optimize file size</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!resizeResult ? (
              <>
                <button
                  onClick={handleResize}
                  disabled={isResizing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                    isResizing
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {isResizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resizing...
                    </>
                  ) : (
                    <>
                      <Crop className="h-4 w-4" />
                      Auto-Resize Image
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onKeepOriginal()
                    handleClose()
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Original
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConfirmResize}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Use Resized Image
                </button>
                <button
                  onClick={() => {
                    setResizeResult(null)
                    if (resizedPreview) {
                      URL.revokeObjectURL(resizedPreview)
                      setResizedPreview('')
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    onKeepOriginal()
                    handleClose()
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Original
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
