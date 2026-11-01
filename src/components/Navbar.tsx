
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check the real authentication token
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();
    navigate("/");
  };

  const goToSection = (sectionId: string) => {
    closeMenu();

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleReportClick = () => {
    closeMenu();

    if (isLoggedIn) {
      navigate("/report-issue");
    } else {
      navigate("/login", {
        state: {
          message: "Please log in or create an account to report a civic issue.",
        },
      });
    }
  };

  const navLinkClass =
    "rounded-lg px-3 py-2 font-medium transition hover:bg-blue-50 hover:text-blue-700";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-6">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
            C
          </span>

          <span className="text-xl font-bold">
            Civic <span className="text-blue-700">Sathi</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => goToSection("home")}
            className={navLinkClass}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => goToSection("features")}
            className={navLinkClass}
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => goToSection("about")}
            className={navLinkClass}
          >
            About Us
          </button>

          <Link to="/map" className={navLinkClass}>
            Explore Map
          </Link>
        </div>

        {/* Desktop authentication buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 lg:hidden"
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

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">

            <button
              type="button"
              onClick={() => goToSection("home")}
              className={`text-left ${navLinkClass}`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goToSection("features")}
              className={`text-left ${navLinkClass}`}
            >
              Features
            </button>

            <button
              type="button"
              onClick={() => goToSection("about")}
              className={`text-left ${navLinkClass}`}
            >
              About Us
            </button>

            <Link
              to="/map"
              onClick={closeMenu}
              className={navLinkClass}
            >
              Explore Map
            </Link>

            <button
              type="button"
              onClick={handleReportClick}
              className="mt-2 rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white hover:bg-blue-800"
            >
              Report an Issue
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-center font-semibold hover:bg-blue-50"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-center font-semibold hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-center font-semibold hover:bg-blue-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-center font-semibold hover:bg-blue-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
