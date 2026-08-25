import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Classic Light theme" : "Switch to Sovereign Dark theme"}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border border-primary-light/70 bg-white dark:bg-[#111C38] dark:border-[#1E3A5F] text-ink hover:text-accent dark:hover:text-accent transition shadow-2xs cursor-pointer ${className}`}
    >
      {theme === "dark" ? (
        // Sun icon
        <svg
          className="w-4 h-4 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ) : (
        // Moon icon
        <svg
          className="w-4 h-4 text-primary transform transition-transform duration-300 -rotate-12 hover:rotate-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill="currentColor"
          />
        </svg>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
