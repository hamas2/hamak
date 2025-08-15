"use client"

import { useState, useEffect } from "react"
import { AuthScreen } from "@/components/auth-screen"
import { MainScreen } from "@/components/main-screen"
import { UploadScreen } from "@/components/upload-screen"
import { LoadingScreen } from "@/components/loading-screen"
import { initializeFirebase } from "@/lib/firebase"

export type User = {
  id: string
  name: string
  bio: string
  gender: string
  profilePic: string
  location: {
    latitude: number
    longitude: number
  } | null
  createdAt: string
}

export type Video = {
  id: string
  userId: string
  userName: string
  userProfilePic: string
  videoUrl: string
  description: string
  likes: number
  likedBy: Record<string, boolean>
  comments: Record<string, Comment>
  createdAt: string
}

export type Comment = {
  id: string
  userId: string
  userName: string
  userProfilePic: string
  text: string
  createdAt: string
  likes: number
  likedBy: Record<string, boolean>
  replies: Record<string, Reply>
}

export type Reply = {
  id: string
  userId: string
  userName: string
  userProfilePic: string
  text: string
  createdAt: string
  likes: number
  likedBy: Record<string, boolean>
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentScreen, setCurrentScreen] = useState<"auth" | "main" | "upload">("auth")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initializeFirebase()

    // Check for saved user
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setCurrentScreen("main")
    }
  }, [])

  const handleUserRegistered = (user: User) => {
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
    setCurrentScreen("main")
  }

  const showUploadScreen = () => setCurrentScreen("upload")
  const showMainScreen = () => setCurrentScreen("main")

  return (
    <div className="ios-app" dir="rtl">
      {currentScreen === "auth" && <AuthScreen onUserRegistered={handleUserRegistered} setIsLoading={setIsLoading} />}

      {currentScreen === "main" && currentUser && (
        <MainScreen currentUser={currentUser} onShowUpload={showUploadScreen} setIsLoading={setIsLoading} />
      )}

      {currentScreen === "upload" && currentUser && (
        <UploadScreen currentUser={currentUser} onClose={showMainScreen} setIsLoading={setIsLoading} />
      )}

      {isLoading && <LoadingScreen />}
    </div>
  )
}
