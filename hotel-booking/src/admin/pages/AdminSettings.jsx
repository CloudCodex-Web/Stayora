import { useState } from "react";
import {
  Globe,
  CalendarCheck,
  CreditCard,
  Bell,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getAdminSettings, saveAdminSettings } from "../../utils/adminSettings";

import { addActivityLog } from "../../utils/activityLogs";

const sections = [
  {
    id: "general",
    label: "General",
    icon: Globe,
    description: "Website information",
  },
  {
    id: "booking",
    label: "Booking",
    icon: CalendarCheck,
    description: "Reservation preferences",
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    description: "Currency and payment options",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Alert preferences",
  },
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#11101c]/70 py-3 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

function AdminSettings() {
  const [settings, setSettings] = useState(getAdminSettings);
  const [activeSection, setActiveSection] = useState("general");
  const [message, setMessage] = useState("");

  const updateSetting = (section, field, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));

    setMessage("");
  };

  const handleSave = () => {
    saveAdminSettings(settings);

    const sectionNames = {
      general: "General",
      booking: "Booking",
      payment: "Payment",
      notifications: "Notification",
    };

    addActivityLog({
      action: `${sectionNames[activeSection]} Settings Updated`,
      category: "Settings",
      description: `${sectionNames[activeSection]} settings were updated.`,
      target: activeSection,
    });

    setMessage("Settings saved successfully!");
  };

  const renderInput = (label, value, onChange, placeholder, Icon) => (
    <div>
      <label className={labelClass}>{label}</label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <input
          type="text"
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? "pl-11" : "pl-4"}`}
        />
      </div>
    </div>
  );

  const renderToggle = (label, description, checked, onChange) => (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition duration-200 ${
          checked
            ? "bg-gradient-to-r from-purple-500 to-teal-400 shadow-lg shadow-purple-950/30"
            : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  const active = sections.find((section) => section.id === activeSection);
  const ActiveIcon = active?.icon || Settings;

  return (
    <div className="space-y-7 text-slate-100">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
            <Settings size={14} />
            Workspace Configuration
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your Stayora website configuration and preferences.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-2.5">
          <ShieldCheck size={17} className="text-emerald-300" />
          <span className="text-xs font-semibold text-emerald-200">
            Admin Control Panel
          </span>
        </div>
      </div>

      {/* Information banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-400/15 bg-gradient-to-r from-purple-500/[0.12] via-[#191727] to-teal-400/[0.07] p-5">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-400/10">
            <Sparkles size={21} className="text-purple-300" />
          </div>

          <div>
            <h3 className="font-bold text-white">Customize your workspace</h3>
            <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">
              Update your website details, booking preferences, payment options
              and notification settings from one place.
            </p>
          </div>
        </div>
      </div>

      {/* Settings layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings navigation */}
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#191727]/90 p-3 shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Configuration
          </p>

          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setMessage("");
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                    isActive
                      ? "border-purple-400/20 bg-gradient-to-r from-purple-500/20 to-teal-400/[0.08] text-white shadow-lg shadow-purple-950/20"
                      : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "bg-purple-400/15 text-purple-300"
                        : "bg-white/[0.04] text-slate-500 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {section.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        isActive ? "text-purple-200/70" : "text-slate-600"
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-teal-300" />
              <span className="text-xs font-semibold text-slate-300">
                Settings Security
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              Changes are saved to this browser's local storage in the demo.
            </p>
          </div>
        </aside>

        {/* Settings content */}
        <section className="min-w-0 rounded-2xl border border-white/10 bg-[#191727]/90 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7 lg:col-span-3">
          {/* Section heading */}
          <div className="mb-7 flex items-center gap-3 border-b border-white/[0.08] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-300/20 bg-gradient-to-br from-purple-500/20 to-teal-400/10">
              <ActiveIcon size={21} className="text-purple-300" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {active?.label} Settings
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {active?.description}
              </p>
            </div>
          </div>

          {/* General Settings */}
          {activeSection === "general" && (
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-200">
                  Website Information
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Manage your website's basic information and contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderInput(
                  "Website Name",
                  settings.general.websiteName,
                  (e) =>
                    updateSetting("general", "websiteName", e.target.value),
                  "Enter website name",
                  Building2,
                )}

                {renderInput(
                  "Tagline",
                  settings.general.tagline,
                  (e) => updateSetting("general", "tagline", e.target.value),
                  "Enter website tagline",
                )}

                {renderInput(
                  "Contact Email",
                  settings.general.contactEmail,
                  (e) =>
                    updateSetting("general", "contactEmail", e.target.value),
                  "Enter contact email",
                  Mail,
                )}

                {renderInput(
                  "Phone Number",
                  settings.general.phone,
                  (e) => updateSetting("general", "phone", e.target.value),
                  "Enter phone number",
                  Phone,
                )}

                <div className="md:col-span-2">
                  {renderInput(
                    "Business Address",
                    settings.general.address,
                    (e) => updateSetting("general", "address", e.target.value),
                    "Enter business address",
                    MapPin,
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings */}
          {activeSection === "booking" && (
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-200">
                  Reservation Preferences
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your hotel's booking rules and approval process.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Minimum Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.booking.minimumNights}
                    onChange={(e) =>
                      updateSetting(
                        "booking",
                        "minimumNights",
                        Math.max(1, Number(e.target.value)),
                      )
                    }
                    className={`${inputClass} pl-4`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.booking.maximumGuests}
                    onChange={(e) =>
                      updateSetting(
                        "booking",
                        "maximumGuests",
                        Math.max(1, Number(e.target.value)),
                      )
                    }
                    className={`${inputClass} pl-4`}
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.07]">
                {renderToggle(
                  "Allow Cancellation",
                  "Allow guests to cancel their bookings.",
                  settings.booking.cancellationAllowed,
                  (value) =>
                    updateSetting("booking", "cancellationAllowed", value),
                )}

                {renderToggle(
                  "Automatic Booking Approval",
                  "Automatically approve new booking requests.",
                  settings.booking.autoApproval,
                  (value) => updateSetting("booking", "autoApproval", value),
                )}
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeSection === "payment" && (
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-200">
                  Payment Preferences
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Choose the default currency and available payment options.
                </p>
              </div>

              <div>
                <label className={labelClass}>Default Currency</label>

                <select
                  value={settings.payment.currency}
                  onChange={(e) =>
                    updateSetting("payment", "currency", e.target.value)
                  }
                  className={`${inputClass} max-w-full bg-[#11101c] pl-4 md:max-w-sm`}
                >
                  <option value="NPR">NPR - Nepalese Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div className="mt-6 border-t border-white/[0.07]">
                {renderToggle(
                  "Cash Payment",
                  "Allow guests to pay at the hotel.",
                  settings.payment.cashPayment,
                  (value) => updateSetting("payment", "cashPayment", value),
                )}

                {renderToggle(
                  "Online Payment",
                  "Enable online payment as a booking option.",
                  settings.payment.onlinePayment,
                  (value) => updateSetting("payment", "onlinePayment", value),
                )}
              </div>

              <div className="mt-6 flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
                <CreditCard
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-300"
                />
                <div>
                  <p className="text-sm font-semibold text-amber-200">
                    Demo Payment Configuration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-100/60">
                    These are demo preferences. Online payment processing
                    requires a payment gateway and backend integration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === "notifications" && (
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-200">
                  Alert Preferences
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Choose which events you want to receive alerts for.
                </p>
              </div>

              <div className="border-t border-white/[0.07]">
                {renderToggle(
                  "New Booking",
                  "Receive an alert when a guest makes a booking.",
                  settings.notifications.newBooking,
                  (value) =>
                    updateSetting("notifications", "newBooking", value),
                )}

                {renderToggle(
                  "Booking Cancellation",
                  "Receive an alert when a booking is cancelled.",
                  settings.notifications.bookingCancellation,
                  (value) =>
                    updateSetting(
                      "notifications",
                      "bookingCancellation",
                      value,
                    ),
                )}

                {renderToggle(
                  "New Review",
                  "Receive an alert when a guest submits a review.",
                  settings.notifications.newReview,
                  (value) => updateSetting("notifications", "newReview", value),
                )}

                {renderToggle(
                  "New User Registration",
                  "Receive an alert when a new user joins Stayora.",
                  settings.notifications.newUser,
                  (value) => updateSetting("notifications", "newUser", value),
                )}
              </div>
            </div>
          )}

          {/* Save section */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-6">
              {message ? (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <CheckCircle2 size={17} />
                  {message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Remember to save your changes.
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-300/20 bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-teal-500"
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminSettings;
