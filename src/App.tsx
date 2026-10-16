
import { useState } from "react";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Fixed Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="font-medium text-slate-700 transition hover:text-blue-700"
            >
              Home
            </a>
            <a
              href="#features"
              className="font-medium text-slate-700 transition hover:text-blue-700"
            >
              Features
            </a>
            <a
              href="#about"
              className="font-medium text-slate-700 transition hover:text-blue-700"
            >
              About Us
            </a>
          </div>

          {/* Desktop CTA */}
          <a
            href="#report"
            className="hidden rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 md:inline-flex"
          >
            Report an Issue
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
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

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a
                href="#home"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Home
              </a>

              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Features
              </a>

              <a
                href="#about"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                About Us
              </a>

              <a
                href="#report"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-blue-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
              >
                Report an Issue
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-[73px]">
        {/* Hero Section */}
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24"
        >
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
              Building a better community
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your City.
              <br />
              Your Voice.
              <br />
              <span className="text-blue-700">Your Responsibility.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Notice a pothole, overflowing garbage or a broken streetlight?
              Take the first step. Report local problems and help make your
              neighbourhood cleaner, safer and better for everyone.
            </p>

            <div className="mt-8 flex flex-wrap gap-4" id="report">
              <a
                href="#features"
                className="rounded-lg bg-blue-700 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Explore Civic Sathi →
              </a>

              <a
                href="#about"
                className="rounded-lg border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Learn Our Mission
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              One Citizen, One Step, One Nation.
            </p>
          </div>

          {/* Civic Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl bg-blue-100 p-5 sm:p-8">
              <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">
                      Community dashboard
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Local issues matter
                    </h2>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Take action
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                      🛣️
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold">Road damage</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Report potholes and unsafe roads
                      </p>
                    </div>
                    <span className="text-xl text-slate-400">→</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl">
                      ♻️
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold">Waste management</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Help keep public spaces clean
                      </p>
                    </div>
                    <span className="text-xl text-slate-400">→</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                      💡
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold">Streetlights</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Flag broken or faulty lights
                      </p>
                    </div>
                    <span className="text-xl text-slate-400">→</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-blue-700 p-4 text-white">
                  <p className="font-semibold">
                    Change begins with one report.
                  </p>
                  <p className="mt-1 text-sm text-blue-100">
                    Every small action can make a difference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-blue-700">WHAT WE DO</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                A better way to care for your city
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Civic Sathi helps people report local issues and makes
                community problems easier to see and understand.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="text-3xl">📍</span>
                <h3 className="mt-5 text-xl font-bold">Report Issues</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Record local problems with descriptions, photos and
                  location details.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="text-3xl">🗺️</span>
                <h3 className="mt-5 text-xl font-bold">Explore the Map</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Discover reported civic issues in your neighbourhood
                  through an interactive map.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="text-3xl">🤝</span>
                <h3 className="mt-5 text-xl font-bold">Build Community</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Encourage citizens to participate and take shared
                  responsibility for public spaces.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="scroll-mt-24 bg-slate-100 py-20"
        >
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              A better city starts with us.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
              Our vision is to encourage civic responsibility, connect
              communities and make local problems more visible. Real change
              begins when people move from noticing problems to taking action.
            </p>
            <a
              href="#home"
              className="mt-8 inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Back to top ↑
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-lg font-bold">
            Civic <span className="text-blue-400">Sathi</span>
          </p>
          <p className="text-sm text-slate-400">
            One Citizen, One Step, One Nation.
          </p>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Civic Sathi
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
