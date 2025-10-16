'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image, Video, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, compressImage, isValidFileType, formatFileSize } from '@/lib/utils'

interface MediaUploaderProps {
  mediaUrls: string[]
  onMediaChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  url?: string
  error?: string
}

export function MediaUploader({ 
  mediaUrls, 
  onMediaChange, 
  maxFiles = 9,
  className 
}: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const uploadFile = async (file: File): Promise<string> => {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload directly
    const response = await fetch('/api/upload-direct', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload file')
    }

    const { publicUrl } = await response.json()
    return publicUrl
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(isValidFileType)
    
    if (validFiles.length === 0) {
      alert('Please select valid image (JPEG, PNG, WebP) or video (MP4, WebM) files.')
      return
    }

    const totalFiles = mediaUrls.length + uploadingFiles.length + validFiles.length
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed. Please remove some files first.`)
      return
    }

    // Create uploading file entries
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Process all files in parallel
    const uploadPromises = newUploadingFiles.map(async (uploadingFile) => {
      try {
        // Update progress
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 25 } : f)
        )

        // Compress image if needed
        let fileToUpload = uploadingFile.file
        if (uploadingFile.file.type.startsWith('image/')) {
          fileToUpload = await compressImage(uploadingFile.file)
        }

        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 50 } : f)
        )

        // Upload file
        const publicUrl = await uploadFile(fileToUpload)

        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 100, url: publicUrl } : f)
        )

        // Remove from uploading files after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id))
        }, 1000)

        return publicUrl

      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        )
        return null
      }
    })

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises)
    const successfulUrls = uploadedUrls.filter(url => url !== null) as string[]
    
    // Add all successful uploads to media URLs
    if (successfulUrls.length > 0) {
      onMediaChange([...mediaUrls, ...successfulUrls])
    }
  }, [mediaUrls, uploadingFiles.length, maxFiles, onMediaChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const removeMedia = (index: number) => {
    const newUrls = mediaUrls.filter((_, i) => i !== index)
    onMediaChange(newUrls)
  }

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleBoxClick = () => {
    if (canUploadMore && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const scrollLeft = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.75
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.75
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const canUploadMore = mediaUrls.length + uploadingFiles.length < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media ({mediaUrls.length + uploadingFiles.length}/{maxFiles})
        </label>

        {/* Upload area */}
        {canUploadMore && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBoxClick}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              dragActive
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
            )}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Drag and drop your files here, or{' '}
                <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Images (JPEG, PNG, WebP) and videos (MP4, WebM) up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* Media preview slider */}
        {(mediaUrls.length > 0 || uploadingFiles.length > 0) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Uploaded Images ({mediaUrls.length + uploadingFiles.length}/{maxFiles})
              </span>
              {(mediaUrls.length + uploadingFiles.length) > 3 && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={scrollLeft}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={scrollRight}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide scroll-smooth"
            >
              {/* Uploaded media */}
              {mediaUrls.map((url, index) => (
                <div key={url} className="relative group flex-shrink-0 snap-start">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-emerald-300 transition-colors">
                    {url.includes('.mp4') || url.includes('.webm') ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1">
                    {url.includes('.mp4') || url.includes('.webm') ? (
                      <Video className="h-3 w-3 text-white drop-shadow" />
                    ) : (
                      <Image className="h-3 w-3 text-white drop-shadow" />
                    )}
                  </div>
                </div>
              ))}

              {/* Uploading files */}
              {uploadingFiles.map((uploadingFile) => (
                <div key={uploadingFile.id} className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {uploadingFile.error ? (
                      <div className="text-center">
                        <X className="h-4 w-4 text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-red-600 leading-tight">Error</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Loader2 className="h-4 w-4 text-emerald-500 animate-spin mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{uploadingFile.progress}%</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
