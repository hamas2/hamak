import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `ios-toast ios-toast-${type}`
  toast.textContent = message

  // Add to body
  document.body.appendChild(toast)

  // Show animation
  setTimeout(() => toast.classList.add("ios-toast-show"), 100)

  // Hide and remove
  setTimeout(() => {
    toast.classList.remove("ios-toast-show")
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}
