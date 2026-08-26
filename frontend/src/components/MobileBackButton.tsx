import { useLocation, useNavigate } from "react-router-dom";

export function MobileBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Don't show the back button on the root home / gateway page
  if (path === "/") return null;

  function handleBack() {
    // If there is browser history, go back; otherwise go to root
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="sm:hidden fixed top-3 left-3 z-50 animate-fade-in pointer-events-auto">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1 bg-[#0B4F6C]/90 hover:bg-[#0B4F6C] active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-lg px-2.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Back</span>
      </button>
    </div>
  );
}
