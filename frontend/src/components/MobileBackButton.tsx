import { useLocation, useNavigate } from "react-router-dom";

export function MobileBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Don't show floating back button on root gateway or role landing pages (they have integrated sub-strips)
  const excludedPaths = [
    "/",
    "/applicant",
    "/visa/portal",
    "/border/portal",
    "/admin/portal",
  ];

  if (excludedPaths.includes(path)) return null;

  function handleBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="sm:hidden fixed bottom-18 left-3 z-40 animate-fade-in pointer-events-auto">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1.5 bg-[#0B4F6C]/90 hover:bg-[#0B4F6C] active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-xl px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
        aria-label="Go back to previous screen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
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
