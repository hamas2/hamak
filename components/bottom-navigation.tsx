"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Plus, User } from "lucide-react"
import { showToast } from "@/lib/utils"

interface BottomNavigationProps {
  onShowUpload: () => void
}

export function BottomNavigation({ onShowUpload }: BottomNavigationProps) {
  const [activeTab, setActiveTab] = useState("home")

  const handleTabPress = (tab: string) => {
    setActiveTab(tab)

    if (tab === "upload") {
      onShowUpload()
    } else if (tab === "profile") {
      showToast("الملف الشخصي قيد التطوير", "info")
    }
  }

  return (
    <div className="ios-bottom-nav">
      <div className="ios-nav-container">
        <Button
          onClick={() => handleTabPress("home")}
          variant="ghost"
          className={`ios-nav-item ${activeTab === "home" ? "ios-nav-active" : ""}`}
        >
          <Home className="ios-nav-icon" />
          <span className="ios-nav-label">الرئيسية</span>
        </Button>

        <Button onClick={() => handleTabPress("upload")} variant="ghost" className="ios-nav-item ios-nav-upload">
          <div className="ios-upload-icon-container">
            <Plus className="ios-nav-icon" />
          </div>
          <span className="ios-nav-label">نشر</span>
        </Button>

        <Button
          onClick={() => handleTabPress("profile")}
          variant="ghost"
          className={`ios-nav-item ${activeTab === "profile" ? "ios-nav-active" : ""}`}
        >
          <User className="ios-nav-icon" />
          <span className="ios-nav-label">الملف الشخصي</span>
        </Button>
      </div>
    </div>
  )
}
