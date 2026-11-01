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
    name: profile.name,
    avatarUrl: profile.avatarUrl,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAdminProfileChanges(() => {
      const updated = getAdminProfile();
      setProfile(updated);
      setFormData({
        name: updated.name,
        avatarUrl: updated.avatarUrl,
      });
    });

    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    const updated = updateAdminProfile(formData);

    setProfile(updated);
    setFormData({
      name: updated.name,
      avatarUrl: updated.avatarUrl,
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
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
    setMessage("");
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your Stayora administrator information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile overview */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Admin avatar"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-700">
                  {initials || "SA"}
                </div>
              )}

              <div className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-2 text-white">
                <Camera size={16} />
              </div>
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">{profile.role}</p>

            <div className="mt-4 flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <ShieldCheck size={16} />
              Administrator
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={17} />
              <span className="break-all">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your administrator profile details.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed from this page.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Image URL
              </label>

              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {message && (
              <p className="text-sm font-medium text-indigo-600">{message}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
              >
                <Save size={17} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
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
