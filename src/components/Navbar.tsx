
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <a
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
            C
          </span>

          <span className="text-xl font-bold">
            Civic <span className="text-blue-700">Sathi</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#home" className="font-medium hover:text-blue-700">
            Home
          </a>
          <a href="#features" className="font-medium hover:text-blue-700">
            Features
          </a>
          <a href="#about" className="font-medium hover:text-blue-700">
            About Us
          </a>
        </div>

        <a
          href="#report"
          className="hidden rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 md:inline-flex"
        >
          Report an Issue
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 md:hidden"
        >
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <a
              href="#home"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 hover:bg-blue-50 hover:text-blue-700"
            >
              Home
            </a>

            <a
              href="#features"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 hover:bg-blue-50 hover:text-blue-700"
            >
              Features
            </a>

            <a
              href="#about"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 hover:bg-blue-50 hover:text-blue-700"
            >
              About Us
            </a>

            <a
              href="#report"
              onClick={closeMenu}
              className="mt-2 rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white hover:bg-blue-800"
            >
              Report an Issue
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
