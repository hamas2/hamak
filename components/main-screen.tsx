"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "@/components/video-player"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CommentsModal } from "@/components/comments-modal"
import { ProfileModal } from "@/components/profile-modal"
import { loadVideos } from "@/lib/firebase"
import type { User, Video } from "@/app/page"

interface MainScreenProps {
  currentUser: User
  onShowUpload: () => void
  setIsLoading: (loading: boolean) => void
}

export function MainScreen({ currentUser, onShowUpload, setIsLoading }: MainScreenProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [currentProfileUserId, setCurrentProfileUserId] = useState<string | null>(null)

  useEffect(() => {
    loadVideoData()
  }, [])

  const loadVideoData = async () => {
    setIsLoading(true)
    try {
      const videoData = await loadVideos()
      setVideos(videoData.reverse())
    } catch (error) {
      console.error("خطأ في تحميل الفيديوهات:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1)
    } else if (direction === "down" && currentVideoIndex > 0) {
      setCurrentVideoIndex((prev) => prev - 1)
    }
  }

  const openComments = (videoId: string) => {
    setCurrentVideoId(videoId)
    setShowComments(true)
  }

  const closeComments = () => {
    setShowComments(false)
    setCurrentVideoId(null)
  }

  const openProfile = (userId: string) => {
    setCurrentProfileUserId(userId)
    setShowProfile(true)
  }

  const closeProfile = () => {
    setShowProfile(false)
    setCurrentProfileUserId(null)
  }

  return (
    <div className="ios-screen ios-main-screen">
      <div className="ios-video-container">
        {videos.length === 0 ? (
          <div className="ios-empty-state">
            <div className="ios-empty-icon">📹</div>
            <p className="ios-empty-text">لا توجد مقاطع حتى الآن</p>
          </div>
        ) : (
          <VideoPlayer
            videos={videos}
            currentIndex={currentVideoIndex}
            currentUser={currentUser}
            onSwipe={handleSwipe}
            onOpenComments={openComments}
            onOpenProfile={openProfile}
            onRefresh={loadVideoData}
          />
        )}
      </div>

      <BottomNavigation onShowUpload={onShowUpload} />

      {showComments && currentVideoId && (
        <CommentsModal
          videoId={currentVideoId}
          currentUser={currentUser}
          onClose={closeComments}
          onRefresh={loadVideoData}
        />
      )}

      {showProfile && currentProfileUserId && (
        <ProfileModal userId={currentProfileUserId} currentUser={currentUser} onClose={closeProfile} />
      )}
    </div>
  )
}
