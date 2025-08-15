import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, get } from "firebase/database"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import type { User, Video, Comment, Reply } from "@/app/page"

const firebaseConfig = {
  apiKey: "AIzaSyB3crsDcJI1qYipy6awM6VIoAamLC51zi4",
  authDomain: "cinmanryo.firebaseapp.com",
  databaseURL: "https://cinmanryo-default-rtdb.firebaseio.com",
  projectId: "cinmanryo",
  storageBucket: "cinmanryo.appspot.com",
  messagingSenderId: "605207743179",
  appId: "1:605207743179:web:0bb0b6efdd208e9094a94e",
  measurementId: "G-SH32EZ7ZY6",
}

let app: any
let database: any
let storage: any

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    storage = getStorage(app)
  }
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`
  const fileRef = storageRef(storage, `${folder}/${fileName}`)
  const snapshot = await uploadBytes(fileRef, file)
  return await getDownloadURL(snapshot.ref)
}

export async function saveUser(userData: User): Promise<void> {
  await set(ref(database, `users/${userData.id}`), userData)
}

export async function saveVideo(videoData: Video): Promise<void> {
  await set(ref(database, `videos/${videoData.id}`), videoData)
}

export async function loadVideos(): Promise<Video[]> {
  const snapshot = await get(ref(database, "videos"))
  if (snapshot.exists()) {
    return Object.values(snapshot.val())
  }
  return []
}

export async function toggleLike(videoId: string, userId: string): Promise<void> {
  const videoRef = ref(database, `videos/${videoId}`)
  const snapshot = await get(videoRef)

  if (snapshot.exists()) {
    const video = snapshot.val()
    const likedBy = video.likedBy || {}
    const likes = video.likes || 0

    if (likedBy[userId]) {
      delete likedBy[userId]
      await set(ref(database, `videos/${videoId}/likedBy`), likedBy)
      await set(ref(database, `videos/${videoId}/likes`), Math.max(0, likes - 1))
    } else {
      likedBy[userId] = true
      await set(ref(database, `videos/${videoId}/likedBy`), likedBy)
      await set(ref(database, `videos/${videoId}/likes`), likes + 1)
    }
  }
}

export async function loadComments(videoId: string): Promise<Comment[]> {
  const snapshot = await get(ref(database, `videos/${videoId}/comments`))
  if (snapshot.exists()) {
    return Object.values(snapshot.val())
  }
  return []
}

export async function addComment(videoId: string, user: User, text: string): Promise<void> {
  const commentId = Date.now().toString()
  const comment: Comment = {
    id: commentId,
    userId: user.id,
    userName: user.name,
    userProfilePic: user.profilePic,
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: {},
    replies: {},
  }

  await set(ref(database, `videos/${videoId}/comments/${commentId}`), comment)
}

export async function addReply(videoId: string, commentId: string, user: User, text: string): Promise<void> {
  const replyId = Date.now().toString()
  const reply: Reply = {
    id: replyId,
    userId: user.id,
    userName: user.name,
    userProfilePic: user.profilePic,
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: {},
  }

  await set(ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}`), reply)
}

export async function toggleCommentLike(videoId: string, commentId: string, userId: string): Promise<void> {
  const commentRef = ref(database, `videos/${videoId}/comments/${commentId}`)
  const snapshot = await get(commentRef)

  if (snapshot.exists()) {
    const comment = snapshot.val()
    const likedBy = comment.likedBy || {}
    const likes = comment.likes || 0

    if (likedBy[userId]) {
      delete likedBy[userId]
      await set(ref(database, `videos/${videoId}/comments/${commentId}/likedBy`), likedBy)
      await set(ref(database, `videos/${videoId}/comments/${commentId}/likes`), Math.max(0, likes - 1))
    } else {
      likedBy[userId] = true
      await set(ref(database, `videos/${videoId}/comments/${commentId}/likedBy`), likedBy)
      await set(ref(database, `videos/${videoId}/comments/${commentId}/likes`), likes + 1)
    }
  }
}

export async function toggleReplyLike(
  videoId: string,
  commentId: string,
  replyId: string,
  userId: string,
): Promise<void> {
  const replyRef = ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}`)
  const snapshot = await get(replyRef)

  if (snapshot.exists()) {
    const reply = snapshot.val()
    const likedBy = reply.likedBy || {}
    const likes = reply.likes || 0

    if (likedBy[userId]) {
      delete likedBy[userId]
      await set(ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}/likedBy`), likedBy)
      await set(
        ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}/likes`),
        Math.max(0, likes - 1),
      )
    } else {
      likedBy[userId] = true
      await set(ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}/likedBy`), likedBy)
      await set(ref(database, `videos/${videoId}/comments/${commentId}/replies/${replyId}/likes`), likes + 1)
    }
  }
}

export async function loadUserProfile(userId: string): Promise<User | null> {
  const snapshot = await get(ref(database, `users/${userId}`))
  if (snapshot.exists()) {
    return snapshot.val()
  }
  return null
}

export async function loadUserVideos(userId: string): Promise<Video[]> {
  const snapshot = await get(ref(database, "videos"))
  if (snapshot.exists()) {
    const allVideos: Video[] = Object.values(snapshot.val())
    return allVideos.filter((video) => video.userId === userId)
  }
  return []
}

export function shareVideo(videoId: string): void {
  const shareUrl = `${window.location.origin}?video=${videoId}`

  if (navigator.share) {
    navigator
      .share({
        title: "تطبيق المقاطع القصيرة",
        text: "شاهد هذا المقطع الرائع!",
        url: shareUrl,
      })
      .catch(console.error)
  } else {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        console.log("تم نسخ الرابط")
      })
      .catch(console.error)
  }
}
