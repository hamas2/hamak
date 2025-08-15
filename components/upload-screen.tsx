"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Upload, Camera, FolderOpen, FileText, Play } from "lucide-react"
import { uploadFile, saveVideo } from "@/lib/firebase"
import { showToast } from "@/lib/utils"
import type { User } from "@/app/page"

interface UploadScreenProps {
  currentUser: User
  onClose: () => void
  setIsLoading: (loading: boolean) => void
}

export function UploadScreen({ currentUser, onClose, setIsLoading }: UploadScreenProps) {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        showToast("حجم الملف كبير جداً (الحد الأقصى 100 ميجابايت)", "error")
        return
      }
      setSelectedVideo(file)
    }
  }

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleGallerySelect = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click()
    }
  }

  const removeSelectedVideo = () => {
    setSelectedVideo(null)
    if (videoInputRef.current) videoInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleUpload = async () => {
    if (!selectedVideo) {
      showToast("يرجى اختيار مقطع فيديو", "error")
      return
    }

    if (!description.trim()) {
      showToast("يرجى إضافة وصف للمقطع", "error")
      return
    }

    setIsLoading(true)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const videoUrl = await uploadFile(selectedVideo, "videos")

      clearInterval(progressInterval)
      setUploadProgress(100)

      const videoData = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePic: currentUser.profilePic,
        videoUrl,
        description: description.trim(),
        likes: 0,
        likedBy: {},
        comments: {},
        createdAt: new Date().toISOString(),
      }

      await saveVideo(videoData)
      showToast("تم رفع المقطع بنجاح", "success")

      // Reset form
      setSelectedVideo(null)
      setDescription("")
      setUploadProgress(0)

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error("خطأ في رفع المقطع:", error)
      showToast("حدث خطأ في رفع المقطع", "error")
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  return (
    <div className="ios-screen ios-upload-screen">
      <div className="ios-safe-area">
        <div className="ios-upload-header">
          <h2 className="ios-upload-title">رفع مقطع جديد</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="ios-close-btn">
            <X className="ios-close-icon" />
          </Button>
        </div>

        <Card className="ios-card ios-upload-card">
          <div className="ios-upload-content">
            {!selectedVideo ? (
              <div className="ios-video-selector">
                <div className="ios-selector-header">
                  <h3 className="ios-selector-title">اختر مقطع فيديو</h3>
                </div>

                <div className="ios-upload-options">
                  <Button onClick={handleCameraCapture} variant="outline" className="ios-upload-option bg-transparent">
                    <Camera className="ios-option-icon" />
                    تسجيل من الكاميرا
                  </Button>

                  <Button onClick={handleGallerySelect} variant="outline" className="ios-upload-option bg-transparent">
                    <FolderOpen className="ios-option-icon" />
                    اختيار من المعرض
                  </Button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="ios-file-input-hidden"
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoSelect}
                  className="ios-file-input-hidden"
                />
              </div>
            ) : (
              <div className="ios-selected-video">
                <div className="ios-video-preview">
                  <video
                    src={URL.createObjectURL(selectedVideo)}
                    className="ios-preview-video"
                    controls
                    muted={false}
                  />
                  <div className="ios-video-overlay">
                    <Play className="ios-play-icon" />
                  </div>
                </div>

                <div className="ios-video-info-container">
                  <div>
                    <p className="ios-video-name">{selectedVideo.name}</p>
                    <p className="ios-video-size">{(selectedVideo.size / (1024 * 1024)).toFixed(2)} ميجابايت</p>
                  </div>
                  <Button onClick={removeSelectedVideo} variant="ghost" size="icon" className="ios-remove-btn">
                    <X className="ios-close-icon" />
                  </Button>
                </div>
              </div>
            )}

            {selectedVideo && (
              <>
                <div className="ios-form-group">
                  <div className="ios-input-label">
                    <FileText className="ios-input-icon" />
                    <span>وصف المقطع</span>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصفاً جذاباً للمقطع..."
                    className="ios-textarea"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="ios-char-count">{description.length}/500</div>
                </div>

                {isUploading && (
                  <div className="ios-upload-progress">
                    <div className="ios-progress-info">
                      <span>جاري الرفع...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="ios-progress-bar-container">
                      <div className="ios-progress-bar" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedVideo || !description.trim() || isUploading}
                  className="ios-primary-btn ios-upload-btn"
                >
                  <Upload className="ios-upload-icon" />
                  {isUploading ? "جاري الرفع..." : "رفع المقطع"}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
