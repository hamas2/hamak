"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { toggleLike, shareVideo } from "@/lib/firebase"
import { showToast } from "@/lib/utils"
import type { Video } from "@/app/page"

interface VideoPlayerProps {
  videos: Video[]
  currentIndex: number
  currentUser: any
  onSwipe: (direction: "up" | "down") => void
  onOpenComments: (videoId: string) => void
  onOpenProfile: (userId: string) => void
  onRefresh: () => void
}

export function VideoPlayer({
  videos,
  currentIndex,
  currentUser,
  onSwipe,
  onOpenComments,
  onOpenProfile,
  onRefresh,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false) // Changed default to false for audio enabled
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)

  const currentVideo = videos[currentIndex]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted // Set muted state
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, isMuted, currentIndex])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY
      const diff = touchStartY.current - endY
      const threshold = 80 // Increased threshold for easier control

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex < videos.length - 1) {
          onSwipe("up")
        } else if (diff < 0 && currentIndex > 0) {
          onSwipe("down")
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
      return () => {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [onSwipe, currentIndex, videos.length])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    setShowControls(true)
    setTimeout(() => setShowControls(false), 2000)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setShowControls(true)
    setTimeout(() => setShowControls(false), 2000)
  }

  const handleLike = async () => {
    try {
      await toggleLike(currentVideo.id, currentUser.id)
      onRefresh()
    } catch (error) {
      showToast("حدث خطأ في الإعجاب", "error")
    }
  }

  const handleShare = () => {
    shareVideo(currentVideo.id)
    showToast("تم نسخ الرابط", "success")
  }

  if (!currentVideo) return null

  const isLiked = currentVideo.likedBy?.[currentUser.id] || false
  const commentsCount = Object.keys(currentVideo.comments || {}).length

  return (
    <div ref={containerRef} className="ios-video-player">
      <video
        ref={videoRef}
        src={currentVideo.videoUrl}
        className="ios-video-element"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlayPause}
      />

      <div className={`ios-video-overlay ${showControls ? "ios-controls-visible" : ""}`}>
        <div className="ios-center-controls">
          <Button onClick={togglePlayPause} variant="ghost" size="icon" className="ios-play-pause-btn">
            {isPlaying ? <Pause className="ios-control-icon" /> : <Play className="ios-control-icon" />}
          </Button>
        </div>

        <div className="ios-audio-control">
          <Button onClick={toggleMute} variant="ghost" size="icon" className="ios-audio-btn">
            {isMuted ? <VolumeX className="ios-control-icon" /> : <Volume2 className="ios-control-icon" />}
          </Button>
        </div>
      </div>

      <div className="ios-video-sidebar-left">
        <Button
          onClick={handleLike}
          variant="ghost"
          size="icon"
          className={`ios-sidebar-btn ${isLiked ? "ios-liked" : ""}`}
        >
          <Heart className={`ios-sidebar-icon ${isLiked ? "fill-current" : ""}`} />
          <span className="ios-sidebar-count">{currentVideo.likes || 0}</span>
        </Button>

        <Button onClick={() => onOpenComments(currentVideo.id)} variant="ghost" size="icon" className="ios-sidebar-btn">
          <MessageCircle className="ios-sidebar-icon" />
          <span className="ios-sidebar-count">{commentsCount}</span>
        </Button>

        <Button onClick={handleShare} variant="ghost" size="icon" className="ios-sidebar-btn">
          <Share className="ios-sidebar-icon" />
          <span className="ios-sidebar-text">مشاركة</span>
        </Button>
      </div>

      <div className="ios-video-info">
        <div className="ios-user-info">
          <img
            src={currentVideo.userProfilePic || "/placeholder.svg?height=40&width=40"}
            alt="صورة المستخدم"
            className="ios-user-avatar"
            onClick={() => onOpenProfile(currentVideo.userId)}
          />
          <span className="ios-user-name" onClick={() => onOpenProfile(currentVideo.userId)}>
            {currentVideo.userName}
          </span>
          <Button
            onClick={() => onOpenProfile(currentVideo.userId)}
            variant="ghost"
            size="icon"
            className="ios-profile-btn"
          >
            <Heart className="ios-profile-icon" />
          </Button>
        </div>
        <div className="ios-video-description">{currentVideo.description}</div>
      </div>
    </div>
  )
}
