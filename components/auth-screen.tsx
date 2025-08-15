"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { User, MapPin, Camera, FileText, Users } from "lucide-react"
import { uploadFile, saveUser } from "@/lib/firebase"
import { showToast } from "@/lib/utils"
import type { User as UserType } from "@/app/page"

interface AuthScreenProps {
  onUserRegistered: (user: UserType) => void
  setIsLoading: (loading: boolean) => void
}

export function AuthScreen({ onUserRegistered, setIsLoading }: AuthScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    gender: "",
  })
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationText, setLocationText] = useState("")

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setLocation(loc)
          setLocationText(`تم الحصول على الموقع: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`)
          showToast("تم الحصول على موقعك بنجاح", "success")
        },
        () => {
          showToast("لم يتم السماح بالوصول للموقع", "error")
        },
      )
    } else {
      showToast("المتصفح لا يدعم خدمة الموقع الجغرافي", "error")
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("يرجى إدخال الاسم", "error")
      return
    }

    setIsLoading(true)

    try {
      let profilePicUrl = ""

      if (profilePic) {
        profilePicUrl = await uploadFile(profilePic, "profile-pics")
      }

      const userId = Date.now().toString()
      const userData: UserType = {
        id: userId,
        name: formData.name,
        bio: formData.bio,
        gender: formData.gender,
        profilePic: profilePicUrl,
        location,
        createdAt: new Date().toISOString(),
      }

      await saveUser(userData)
      onUserRegistered(userData)
      showToast("تم التسجيل بنجاح", "success")
    } catch (error) {
      console.error("خطأ في التسجيل:", error)
      showToast("حدث خطأ في التسجيل", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ios-screen ios-auth-screen">
      <div className="ios-safe-area">
        <Card className="ios-card ios-auth-card">
          <div className="ios-auth-header">
            <div className="ios-app-icon">
              <div className="ios-icon-gradient">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4L20 12H28L22 18L24 28L16 22L8 28L10 18L4 12H12L16 4Z" fill="white" />
                </svg>
              </div>
            </div>
            <h1 className="ios-title">تطبيق المقاطع القصيرة</h1>
            <p className="ios-subtitle">شارك مقاطعك واستمتع بمشاهدة الآخرين</p>
          </div>

          <div className="ios-form-container">
            <div className="ios-form-group">
              <div className="ios-input-label">
                <User className="ios-input-icon" />
                <span>الاسم</span>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسمك"
                className="ios-input"
              />
            </div>

            <div className="ios-form-group">
              <div className="ios-input-label">
                <Camera className="ios-input-icon" />
                <span>صورة الملف الشخصي</span>
              </div>
              <div className="ios-file-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  className="ios-file-input-hidden"
                  id="profilePic"
                />
                <label htmlFor="profilePic" className="ios-file-input-label">
                  <Camera className="ios-input-icon" />
                  <span>اختر صورة الملف الشخصي</span>
                </label>
              </div>
            </div>

            <div className="ios-form-group">
              <div className="ios-input-label">
                <FileText className="ios-input-icon" />
                <span>الوصف</span>
              </div>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="اكتب وصفاً قصيراً عنك"
                className="ios-textarea"
                rows={3}
              />
            </div>

            <div className="ios-form-group">
              <div className="ios-input-label">
                <Users className="ios-input-icon" />
                <span>الجنس</span>
              </div>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="ios-select">
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent className="ios-select-content">
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ios-form-group">
              <div className="ios-input-label">
                <MapPin className="ios-input-icon" />
                <span>الموقع</span>
              </div>
              <Input
                value={locationText}
                placeholder="اكتب هنا موقعك → التطبيق سيطلب الموقع تلقائيًا"
                className="ios-input"
                readOnly
              />
              <Button onClick={requestLocation} variant="secondary" className="ios-location-btn">
                <MapPin className="ios-input-icon" />
                طلب الموقع الحالي
              </Button>
            </div>

            <Button onClick={handleSubmit} className="ios-primary-btn ios-register-btn">
              <User className="ios-input-icon" />
              تسجيل
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
