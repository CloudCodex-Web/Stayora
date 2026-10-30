import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../utils/users";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const newUser = registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });

      login({
        name: newUser.name,
        email: newUser.email,
      });

      navigate("/");
    } catch (error) {
      setError(error.message || "Unable to create your account.");
    }

    navigate("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden min-h-[650px] flex-col justify-between bg-emerald-800 p-10 text-white md:flex">
          <Link to="/" className="text-2xl font-extrabold">
            Stayora<span className="text-emerald-300">.</span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
              Your next escape
            </p>
            <h1 className="text-4xl font-extrabold leading-tight">
              Discover places worth staying for.
            </h1>
            <p className="mt-5 leading-7 text-emerald-100">
              Create your Stayora profile and keep your hotel discoveries and
              travel plans together.
            </p>
          </div>

          <p className="text-sm text-emerald-200">
            Find your place. Make it memorable.
          </p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="text-xl font-extrabold text-emerald-800 md:hidden"
            >
              Stayora.
            </Link>

            <p className="mt-6 text-sm font-semibold text-emerald-700">
              CREATE YOUR ACCOUNT
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Join Stayora
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter your details to get started.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter your password again"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-4 py-3.5 font-bold text-white transition hover:bg-emerald-800"
              >
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-700 hover:text-emerald-900"
              >
                Log in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              Demo authentication only. Your account is not securely registered
              or verified by a server.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signup;
