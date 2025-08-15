"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { loadComments, addComment, addReply, toggleCommentLike, toggleReplyLike } from "@/lib/firebase"
import { showToast } from "@/lib/utils"
import type { User, Comment, Reply } from "@/app/page"

interface CommentsModalProps {
  videoId: string
  currentUser: User
  onClose: () => void
  onRefresh: () => void
}

export function CommentsModal({ videoId, currentUser, onClose, onRefresh }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadVideoComments()
  }, [videoId])

  const loadVideoComments = async () => {
    try {
      const commentsData = await loadComments(videoId)
      setComments(commentsData)
    } catch (error) {
      console.error("خطأ في تحميل التعليقات:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      showToast("يرجى كتابة تعليق", "error")
      return
    }

    try {
      await addComment(videoId, currentUser, newComment)
      setNewComment("")
      loadVideoComments()
      onRefresh()
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error)
      showToast("حدث خطأ في إضافة التعليق", "error")
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) {
      showToast("يرجى كتابة رد", "error")
      return
    }

    try {
      await addReply(videoId, commentId, currentUser, replyText)
      setReplyText("")
      setReplyingTo(null)
      loadVideoComments()
      onRefresh()
    } catch (error) {
      console.error("خطأ في إضافة الرد:", error)
      showToast("حدث خطأ في إضافة الرد", "error")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      await toggleCommentLike(videoId, commentId, currentUser.id)
      loadVideoComments()
    } catch (error) {
      showToast("حدث خطأ في الإعجاب", "error")
    }
  }

  const handleLikeReply = async (commentId: string, replyId: string) => {
    try {
      await toggleReplyLike(videoId, commentId, replyId, currentUser.id)
      loadVideoComments()
    } catch (error) {
      showToast("حدث خطأ في الإعجاب", "error")
    }
  }

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (replyingTo) {
        handleAddReply(replyingTo)
      } else {
        handleAddComment()
      }
    }
  }

  return (
    <div className="ios-modal-overlay">
      <div className="ios-comments-modal">
        <div className="ios-comments-header">
          <h3 className="ios-comments-title">التعليقات</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="ios-close-btn">
            <X className="ios-close-icon" />
          </Button>
        </div>

        <div className="ios-comments-list">
          {comments.length === 0 ? (
            <div className="ios-empty-comments">
              <p>لا توجد تعليقات حتى الآن</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCommentLiked = comment.likedBy?.[currentUser.id] || false
              const repliesCount = Object.keys(comment.replies || {}).length
              const isExpanded = expandedComments.has(comment.id)

              return (
                <div key={comment.id} className="ios-comment-item">
                  <div className="ios-comment-header">
                    <img
                      src={comment.userProfilePic || "/placeholder.svg?height=32&width=32"}
                      alt="صورة المستخدم"
                      className="ios-comment-avatar"
                    />
                    <div className="ios-comment-content">
                      <div className="ios-comment-user">{comment.userName}</div>
                      <div className="ios-comment-text">{comment.text}</div>

                      <div className="ios-comment-actions">
                        <Button
                          onClick={() => handleLikeComment(comment.id)}
                          variant="ghost"
                          size="sm"
                          className={`ios-comment-action ${isCommentLiked ? "ios-liked" : ""}`}
                        >
                          <Heart className={`ios-action-icon ${isCommentLiked ? "fill-current" : ""}`} />
                          <span>{comment.likes || 0}</span>
                        </Button>

                        <Button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          variant="ghost"
                          size="sm"
                          className="ios-comment-action"
                        >
                          <MessageCircle className="ios-action-icon" />
                          <span>رد</span>
                        </Button>

                        {repliesCount > 0 && (
                          <Button
                            onClick={() => toggleReplies(comment.id)}
                            variant="ghost"
                            size="sm"
                            className="ios-comment-action"
                          >
                            {isExpanded ? (
                              <ChevronUp className="ios-action-icon" />
                            ) : (
                              <ChevronDown className="ios-action-icon" />
                            )}
                            <span>
                              {repliesCount} {repliesCount === 1 ? "رد" : "ردود"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && comment.replies && (
                    <div className="ios-replies-container">
                      {Object.values(comment.replies).map((reply: Reply) => {
                        const isReplyLiked = reply.likedBy?.[currentUser.id] || false

                        return (
                          <div key={reply.id} className="ios-reply-item">
                            <img
                              src={reply.userProfilePic || "/placeholder.svg?height=28&width=28"}
                              alt="صورة المستخدم"
                              className="ios-reply-avatar"
                            />
                            <div className="ios-reply-content">
                              <div className="ios-reply-user">{reply.userName}</div>
                              <div className="ios-reply-text">{reply.text}</div>

                              <Button
                                onClick={() => handleLikeReply(comment.id, reply.id)}
                                variant="ghost"
                                size="sm"
                                className={`ios-reply-action ${isReplyLiked ? "ios-liked" : ""}`}
                              >
                                <Heart className={`ios-action-icon ${isReplyLiked ? "fill-current" : ""}`} />
                                <span>{reply.likes || 0}</span>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {replyingTo === comment.id && (
                    <div className="ios-reply-input-container">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`الرد على ${comment.userName}...`}
                        className="ios-reply-input"
                      />
                      <Button onClick={() => handleAddReply(comment.id)} size="icon" className="ios-send-btn">
                        <Send className="ios-send-icon" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="ios-comment-input-container">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب تعليقاً..."
            className="ios-comment-input"
          />
          <Button onClick={handleAddComment} size="icon" className="ios-send-btn">
            <Send className="ios-send-icon" />
          </Button>
        </div>
      </div>
    </div>
  )
}
