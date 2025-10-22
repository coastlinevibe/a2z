'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, Image, Video, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, compressImage, isValidFileType, formatFileSize } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

interface MediaUploaderProps {
  mediaUrls: string[]
  onMediaChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
  displayType?: 'hover' | 'horizontal' | 'vertical' | 'gallery' | 'premium' | 'video' | 'before_after'
  mediaDescriptions?: Record<string, string>
  onDescriptionsChange?: (descriptions: Record<string, string>) => void
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  url?: string
  error?: string
}

export default function MediaUploader({ 
  mediaUrls, 
  onMediaChange, 
  maxFiles = 8,
  className,
  displayType,
  mediaDescriptions = {},
  onDescriptionsChange
}: MediaUploaderProps) {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [beforeDraft, setBeforeDraft] = useState('')
  const [afterDraft, setAfterDraft] = useState('')
  const [beforeConfirmed, setBeforeConfirmed] = useState(false)
  const [afterConfirmed, setAfterConfirmed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const beforeUrl = displayType === 'before_after' ? mediaUrls[0] : undefined
  const afterUrl = displayType === 'before_after' ? mediaUrls[1] : undefined

  useEffect(() => {
    if (displayType !== 'before_after') {
      setBeforeDraft('')
      setAfterDraft('')
      setBeforeConfirmed(false)
      setAfterConfirmed(false)
      return
    }

    if (beforeUrl) {
      const existing = mediaDescriptions[beforeUrl] || ''
      setBeforeDraft(existing)
      setBeforeConfirmed(existing.trim().length > 0)
    } else {
      setBeforeDraft('')
      setBeforeConfirmed(false)
    }

    if (afterUrl) {
      const existing = mediaDescriptions[afterUrl] || ''
      setAfterDraft(existing)
      setAfterConfirmed(existing.trim().length > 0)
    } else {
      setAfterDraft('')
      setAfterConfirmed(false)
    }
  }, [displayType, beforeUrl, afterUrl, mediaDescriptions])

  const uploadFile = async (file: File): Promise<string> => {
    // Get user session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('User not authenticated')
    }

    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload directly with auth header
    const response = await fetch('/api/upload-direct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData,
    })

    // Get response text first to handle empty responses
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('Upload failed:', response.status, responseText)
      let errorMessage = 'Failed to upload file'
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        errorMessage = responseText || `Server error: ${response.status}`
      }
      throw new Error(errorMessage)
    }

    // Parse the response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', responseText)
      throw new Error('Invalid server response')
    }

    const { publicUrl } = data
    if (!publicUrl) {
      throw new Error('No URL returned from server')
    }
    
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
      const tierMessage = maxFiles === 5 
        ? 'Free tier allows maximum 5 images. Upgrade to Premium for 8 images per listing!' 
        : `Maximum ${maxFiles} images allowed. Please remove some files first.`
      alert(tierMessage)
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
    const removedUrl = mediaUrls[index]
    const newUrls = mediaUrls.filter((_, i) => i !== index)
    onMediaChange(newUrls)

    if (onDescriptionsChange && removedUrl) {
      const updated = { ...mediaDescriptions }
      delete updated[removedUrl]
      onDescriptionsChange(updated)
    }
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
          {maxFiles === 5 && (
            <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
              Free Tier Limit
            </span>
          )}
        </label>

        {/* Upload area */}
        {canUploadMore && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBoxClick}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer bg-emerald-50',
              dragActive
                ? 'border-emerald-400 bg-emerald-100'
                : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100'
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
              {mediaUrls.filter(url => url && typeof url === 'string').map((url, index) => (
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

        {/* Before/After Guided Flow */}
        {displayType === 'before_after' && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 space-y-3">
              <p className="text-sm font-medium text-emerald-700">
                Before & After Setup
              </p>
              {!beforeUrl && (
                <p className="text-sm text-gray-600">
                  Step 1: Select your <span className="font-semibold">"before"</span> image to begin.
                </p>
              )}

              {beforeUrl && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Before Description</p>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {beforeUrl.includes('.mp4') || beforeUrl.includes('.webm') ? (
                        <video src={beforeUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={beforeUrl} alt="Before image" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={beforeDraft}
                        onChange={(e) => setBeforeDraft(e.target.value)}
                        placeholder="Describe the BEFORE state"
                        maxLength={125}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!beforeUrl || !onDescriptionsChange) return
                          onDescriptionsChange({
                            ...mediaDescriptions,
                            [beforeUrl]: beforeDraft.trim(),
                          })
                          setBeforeConfirmed(true)
                        }}
                        disabled={!beforeDraft.trim()}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{beforeDraft.length}/125 characters</p>
                  {beforeConfirmed && (
                    <p className="text-xs text-emerald-600 font-medium">Before description applied. Select your "after" image next.</p>
                  )}
                </div>
              )}

              {beforeConfirmed && !afterUrl && (
                <p className="text-sm text-gray-600">
                  Step 2: Select your <span className="font-semibold">"after"</span> image.
                </p>
              )}

              {afterUrl && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">After Description</p>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {afterUrl.includes('.mp4') || afterUrl.includes('.webm') ? (
                        <video src={afterUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={afterUrl} alt="After image" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={afterDraft}
                        onChange={(e) => setAfterDraft(e.target.value)}
                        placeholder="Describe the AFTER state"
                        maxLength={125}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!afterUrl || !onDescriptionsChange) return
                          onDescriptionsChange({
                            ...mediaDescriptions,
                            [afterUrl]: afterDraft.trim(),
                          })
                          setAfterConfirmed(true)
                        }}
                        disabled={!afterDraft.trim()}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{afterDraft.length}/125 characters</p>
                  {afterConfirmed && (
                    <p className="text-xs text-emerald-600 font-medium">After description applied. Preview is ready below.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Descriptions for Gallery Mode */}
        {(displayType === 'gallery' || displayType === 'premium') && mediaUrls.length > 0 && (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Image Descriptions (Optional)
            </label>
            <div className="space-y-2">
              {mediaUrls.filter(url => url && typeof url === 'string').map((url, index) => (
                <div key={url} className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {url.includes('.mp4') || url.includes('.webm') ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mediaDescriptions[url] || ''}
                      onChange={(e) => {
                        if (onDescriptionsChange) {
                          onDescriptionsChange({
                            ...mediaDescriptions,
                            [url]: e.target.value
                          })
                        }
                      }}
                      placeholder={`Description for image ${index + 1}`}
                      maxLength={100}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(mediaDescriptions[url] || '').length}/100 characters
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
