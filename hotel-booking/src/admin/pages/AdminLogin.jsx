import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hotel, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { addActivityLog } from "../../utils/activityLogs";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Demo credentials only — replace with backend authentication later.
    if (
      email.trim().toLowerCase() === "admin@stayora.demo" &&
      password === "stayora123"
    ) {
      addActivityLog({
        action: "Admin Logged In",
        category: "Settings",
        description: "Administrator logged into the Stayora admin panel.",
        target: "admin@stayora.demo",
      });

      localStorage.setItem("stayora-admin-auth", "true");

      navigate("/admin", { replace: true });
    } else {
      setError("Invalid admin email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-teal-700 p-3 text-white">
            <Hotel size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stayora</h1>
            <p className="text-sm text-slate-500">Hotel Booking</p>
          </div>
        </Link>

        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your Stayora dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
          >
            Sign in to dashboard
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="mb-2 font-semibold text-slate-700">Demo credentials</p>
          <p className="text-slate-600">Email: admin@stayora.demo</p>
          <p className="text-slate-600">Password: stayora123</p>
          <p className="mt-2 text-xs text-amber-700">
            Demo only. Do not use these credentials for a live website.
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to customer website
        </Link>
      </div>
    </div>
  );
}

export default AdminLogin;
