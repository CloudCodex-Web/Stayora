import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MyProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name || "");
    setAvatarUrl(user.avatarUrl || "");
    setMessage("");
  }, [user, navigate]);

  if (!user) return null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    setMessage("Your profile has been updated!");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Stayora
        </Link>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-emerald-800 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
              Your account
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">My Profile</h1>

            <p className="mt-2 text-emerald-100">
              Manage your Stayora profile details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your profile"
                  className="h-24 w-24 rounded-full border-4 border-emerald-100 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold uppercase text-emerald-800">
                  {name.trim().charAt(0) || "U"}
                </div>
              )}

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {name || "Stayora User"}
                </h2>
                <p className="break-all text-sm text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Email is read-only in this demo.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="profile-avatar"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Profile picture URL
              </label>

              <input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Paste a direct image URL, or leave it blank to use your initial.
              </p>
            </div>

            {message && (
              <p
                role="status"
                className={`rounded-xl p-3 text-sm font-medium ${
                  message.includes("updated")
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Save Changes
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default MyProfile;
