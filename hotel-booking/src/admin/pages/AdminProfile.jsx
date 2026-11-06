import { useEffect, useState } from "react";
import { User, Mail, ShieldCheck, Camera, Save, RotateCcw } from "lucide-react";

import { addActivityLog } from "../../utils/activityLogs";
import {
  getAdminProfile,
  updateAdminProfile,
  subscribeToAdminProfileChanges,
} from "../../utils/admin";

function AdminProfile() {
  const [profile, setProfile] = useState(getAdminProfile);
  const [formData, setFormData] = useState({
    name: profile.name || "",
    avatarUrl: profile.avatarUrl || "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAdminProfileChanges(() => {
      const updated = getAdminProfile();

      setProfile(updated);
      setFormData({
        name: updated.name || "",
        avatarUrl: updated.avatarUrl || "",
      });
    });

    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    const updated = updateAdminProfile({
      ...formData,
      name: formData.name.trim(),
    });

    setProfile(updated);
    setFormData({
      name: updated.name || "",
      avatarUrl: updated.avatarUrl || "",
    });

    addActivityLog({
      action: "Admin Profile Updated",
      category: "Settings",
      description: "Administrator profile information was updated.",
      target: updated.email,
    });

    setMessage("Profile updated successfully!");
  };

  const handleReset = () => {
    setFormData({
      name: profile.name || "",
      avatarUrl: profile.avatarUrl || "",
    });
    setMessage("");
  };

  const initials = (profile.name || "Stayora Admin")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cardStyle =
    "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-xl shadow-black/10";

  const inputStyle =
    "w-full rounded-xl border border-white/10 bg-[#11101c] py-3 text-sm text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10";

  return (
    <div className="space-y-6 text-gray-200">
      {/* Page heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Administration
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Admin Profile
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Manage your Stayora administrator information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile overview */}
        <div className={`${cardStyle} p-6`}>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Admin avatar"
                  className="h-28 w-28 rounded-full border-4 border-violet-500/20 object-cover shadow-lg shadow-violet-950/30"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-violet-500/20 bg-gradient-to-br from-violet-600 to-indigo-700 text-3xl font-bold text-white shadow-lg shadow-violet-950/30">
                  {initials || "SA"}
                </div>
              )}

              <div className="absolute bottom-0 right-0 rounded-full border-4 border-[#191727] bg-violet-600 p-2 text-white">
                <Camera size={16} />
              </div>
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              {profile.name || "Stayora Admin"}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {profile.role || "Administrator"}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={15} />
              Administrator
            </div>
          </div>

          <div className="mt-7 border-t border-white/[0.07] pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Account Information
            </p>

            <div className="flex items-start gap-3 text-sm text-gray-300">
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                <Mail size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email address</p>
                <p className="mt-1 break-all">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className={`${cardStyle} p-6 lg:col-span-2`}>
          <div className="mb-7 border-b border-white/[0.07] pb-5">
            <h2 className="text-lg font-bold text-white">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update your administrator profile details.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`${inputStyle} pl-10 pr-4`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className={`${inputStyle} cursor-not-allowed bg-[#171525] pl-10 pr-4 text-gray-500`}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Email cannot be changed from this page.
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Profile Image URL
              </label>

              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
                className={`${inputStyle} px-4`}
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter a public image URL to use as your profile picture.
              </p>
            </div>

            {/* Avatar preview */}
            {formData.avatarUrl && (
              <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#11101c] p-4">
                <img
                  src={formData.avatarUrl}
                  alt="Profile preview"
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Image Preview
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Your updated profile image
                  </p>
                </div>
              </div>
            )}

            {/* Feedback */}
            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.includes("successfully")
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-white/[0.07] pt-5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
              >
                <Save size={17} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <RotateCcw size={17} />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
