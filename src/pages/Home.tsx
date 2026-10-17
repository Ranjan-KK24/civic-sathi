
function Home() {
  return (
    <>
      <main className="pt-[73px]">
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
              <span className="text-blue-700">
                Your Responsibility.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Notice a pothole, overflowing garbage or a broken
              streetlight? Take the first step. Report local problems
              and help make your neighbourhood cleaner, safer and
              better for everyone.
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
                className="rounded-lg border border-slate-300 bg-white px-6 py-4 font-semibold transition hover:bg-slate-100"
              >
                Learn Our Mission
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              One Citizen, One Step, One Nation.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-blue-100 blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
              <img
                src="/civic-sathi-hero.png"
                alt="Citizens and municipal workers working together to improve a local street"
                className="h-[320px] w-full rounded-2xl object-cover sm:h-[420px] lg:h-[520px]"
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/50 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:bottom-7 sm:left-7 sm:right-7">
                <p className="text-sm font-semibold text-blue-700">
                  Community action in progress
                </p>

                <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                  Together, we can build better neighbourhoods.
                </p>
              </div>
            </div>
          </div>
        </section>

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

        <section id="about" className="scroll-mt-24 bg-slate-100 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              A better city starts with us.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
              Our vision is to encourage civic responsibility, connect
              communities and make local problems more visible. Real
              change begins when people move from noticing problems to
              taking action.
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
    </>
  );
}

export default Home;
