
import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(
      "Login interface is working. Account authentication will be added with the backend."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-12 pt-28">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
            C
          </span>
          <span className="text-2xl font-bold text-slate-900">
            Civic <span className="text-blue-700">Sathi</span>
          </span>
        </a>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-600">
              Sign in to continue to your Civic Sathi account.
            </p>
          </div>

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

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-700 hover:underline"
                >
                Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage("");
                  }}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-blue-700"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-600"
              >
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
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
            Don't have an account?{" "}
            <Link
                to="/register"
                className="font-semibold text-blue-700 hover:underline"
            >
                Create account
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          Your community. Your voice. Your responsibility.
        </p>
      </div>
    </main>
  );
}

export default Login;
