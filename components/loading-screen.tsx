export function LoadingScreen() {
  return (
    <div className="ios-loading-overlay">
      <div className="ios-loading-container">
        <div className="ios-loading-spinner" />
        <p className="ios-loading-text">جاري التحميل...</p>
      </div>
    </div>
  )
}
