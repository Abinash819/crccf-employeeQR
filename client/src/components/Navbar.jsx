import { Menu, Sun, Moon, Bell } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

/**
 * Top Navbar
 * Shows page title, dark mode toggle, and mobile menu trigger.
 */
export default function Navbar({ onMenuToggle, pageTitle }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onMenuToggle}
          className="btn-icon lg:hidden text-gray-500 dark:text-gray-400"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right: dark mode toggle */}
      <div className="flex items-center gap-2">
        <button
          id="dark-mode-toggle"
          onClick={toggle}
          className="btn-icon text-gray-500 dark:text-gray-400"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
