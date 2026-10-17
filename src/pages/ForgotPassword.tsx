
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(
      "Recovery form submitted. Email recovery will be enabled after backend integration."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
            C
          </span>
          <span className="text-2xl font-bold text-slate-900">
            Civic <span className="text-blue-700">Sathi</span>
          </span>
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Forgot password?
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Enter the email address associated with your account. We'll
            add secure recovery emails when the backend is connected.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Recovery Request
            </button>

            {message && (
              <p
                role="status"
                className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800"
              >
                {message}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
