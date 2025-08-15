"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Play, Heart, MessageCircle } from "lucide-react"
import { loadUserProfile, loadUserVideos } from "@/lib/firebase"
import type { User, Video } from "@/app/page"

interface ProfileModalProps {
  userId: string
  currentUser: User
  onClose: () => void
}

export function ProfileModal({ userId, currentUser, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const [userData, userVideos] = await Promise.all([loadUserProfile(userId), loadUserVideos(userId)])
      setUser(userData)
      setVideos(userVideos)
    } catch (error) {
      console.error("خطأ في تحميل الملف الشخصي:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="ios-modal-overlay">
        <div className="ios-profile-modal">
          <div className="ios-loading-container">
            <div className="ios-loading-spinner"></div>
            <p className="ios-loading-text">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="ios-modal-overlay">
        <div className="ios-profile-modal">
          <div className="ios-profile-header">
            <Button onClick={onClose} variant="ghost" size="icon" className="ios-close-btn">
              <X className="ios-close-icon" />
            </Button>
          </div>
          <div className="ios-error-state">
            <p>لم يتم العثور على المستخدم</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ios-modal-overlay">
      <div className="ios-profile-modal">
        <div className="ios-profile-header">
          <h3 className="ios-profile-title">الملف الشخصي</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="ios-close-btn">
            <X className="ios-close-icon" />
          </Button>
        </div>

        <div className="ios-profile-content">
          <div className="ios-profile-info">
            <img
              src={user.profilePic || "/placeholder.svg?height=80&width=80"}
              alt="صورة المستخدم"
              className="ios-profile-avatar"
            />
            <h2 className="ios-profile-name">{user.name}</h2>
            <p className="ios-profile-bio">{user.bio}</p>
            <div className="ios-profile-stats">
              <div className="ios-stat-item">
                <span className="ios-stat-number">{videos.length}</span>
                <span className="ios-stat-label">مقطع</span>
              </div>
              <div className="ios-stat-item">
                <span className="ios-stat-number">
                  {videos.reduce((total, video) => total + (video.likes || 0), 0)}
                </span>
                <span className="ios-stat-label">إعجاب</span>
              </div>
            </div>
          </div>

          <div className="ios-profile-videos">
            <h3 className="ios-videos-title">المقاطع</h3>
            {videos.length === 0 ? (
              <div className="ios-empty-videos">
                <p>لا توجد مقاطع</p>
              </div>
            ) : (
              <div className="ios-videos-grid">
                {videos.map((video) => (
                  <div key={video.id} className="ios-video-thumbnail">
                    <video src={video.videoUrl} className="ios-thumbnail-video" muted />
                    <div className="ios-thumbnail-overlay">
                      <Play className="ios-play-icon" />
                    </div>
                    <div className="ios-thumbnail-stats">
                      <div className="ios-thumbnail-stat">
                        <Heart className="ios-thumbnail-icon" />
                        <span>{video.likes || 0}</span>
                      </div>
                      <div className="ios-thumbnail-stat">
                        <MessageCircle className="ios-thumbnail-icon" />
                        <span>{Object.keys(video.comments || {}).length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
