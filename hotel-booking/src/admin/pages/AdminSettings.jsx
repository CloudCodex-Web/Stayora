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
} from "lucide-react";

import { getAdminSettings, saveAdminSettings } from "../../utils/adminSettings";
import { addActivityLog } from "../../utils/activityLogs";

const sections = [
  { id: "general", label: "General", icon: Globe },
  { id: "booking", label: "Booking", icon: CalendarCheck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

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
    });p

    setMessage("Settings saved successfully!");
  }; 

  const renderInput = (label, value, onChange, placeholder, Icon) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 py-3 pr-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${
            Icon ? "pl-10" : "pl-4"
          }`}
        />
      </div>
    </div>
  );

  const renderToggle = (label, description, checked, onChange) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-teal-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your Stayora website configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings navigation */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Configuration
          </p>

          <div className="space-y-1">
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
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3">
          {/* General Settings */}
          {activeSection === "general" && (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  General Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your website's basic information.
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
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Booking Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure your hotel booking preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Minimum Nights
                  </label>
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Maximum Guests
                  </label>
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="mt-5">
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
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure your website's payment preferences.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Default Currency
                </label>

                <select
                  value={settings.payment.currency}
                  onChange={(e) =>
                    updateSetting("payment", "currency", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500 md:max-w-sm"
                >
                  <option value="NPR">NPR - Nepalese Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div className="mt-5">
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

              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                These are demo preferences. Online payment processing requires a
                payment gateway and backend integration.
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === "notifications" && (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Notification Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose which events you want to receive alerts for.
                </p>
              </div>

              {renderToggle(
                "New Booking",
                "Receive an alert when a guest makes a booking.",
                settings.notifications.newBooking,
                (value) => updateSetting("notifications", "newBooking", value),
              )}

              {renderToggle(
                "Booking Cancellation",
                "Receive an alert when a booking is cancelled.",
                settings.notifications.bookingCancellation,
                (value) =>
                  updateSetting("notifications", "bookingCancellation", value),
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
          )}

          {/* Save section */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            {message ? (
              <p className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 size={17} />
                {message}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Remember to save your changes.
              </p>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
