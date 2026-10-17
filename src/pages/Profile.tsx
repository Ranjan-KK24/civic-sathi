
import { useState } from "react";


function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [name, setName] = useState("Citizen User");
  const [email, setEmail] = useState("citizen@example.com");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [savedProfile, setSavedProfile] = useState({
    name: "Citizen User",
    email: "citizen@example.com",
    phone: "",
    address: "",
    city: "",
  });

  const initials = savedProfile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedProfile = { name, email, phone, address, city };
    setSavedProfile(updatedProfile);
    setIsEditing(false);
    setMessage("Profile updated in this demo. Changes are not saved permanently.");
  };

  const handleCancelEdit = () => {
    setName(savedProfile.name);
    setEmail(savedProfile.email);
    setPhone(savedProfile.phone);
    setAddress(savedProfile.address);
    setCity(savedProfile.city);
    setIsEditing(false);
    setMessage("");
  };

  const handlePasswordSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setPasswordMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new passwords do not match.");
      return;
    }

    setPasswordMessage(
      "Password form validated. A real password change requires backend authentication."
    );
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <main className="mx-auto max-w-5xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Citizen Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-slate-500">
            View and manage your personal information and account settings.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl font-bold">
                {initials || "CU"}
              </div>

              <div>
                <h2 className="text-2xl font-bold">{savedProfile.name}</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Civic Sathi Citizen Account
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {savedProfile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep your contact details up to date.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setName(savedProfile.name);
                    setEmail(savedProfile.email);
                    setPhone(savedProfile.phone);
                    setAddress(savedProfile.address);
                    setCity(savedProfile.city);
                    setIsEditing(true);
                    setMessage("");
                  }}
                  className="rounded-lg border border-blue-700 px-4 py-2.5 font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <p
                role="status"
                className="mt-5 rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-800"
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSaveProfile} className="mt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    value={isEditing ? name : savedProfile.name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={!isEditing}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={isEditing ? email : savedProfile.email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={!isEditing}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={isEditing ? phone : savedProfile.phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    maxLength={20}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-city"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    City / Town
                  </label>
                  <input
                    id="profile-city"
                    type="text"
                    autoComplete="address-level2"
                    value={isEditing ? city : savedProfile.city}
                    onChange={(event) => setCity(event.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter city or town"
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="profile-address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Address / Locality
                  </label>
                  <textarea
                    id="profile-address"
                    autoComplete="street-address"
                    value={isEditing ? address : savedProfile.address}
                    onChange={(event) => setAddress(event.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your locality or address"
                    rows={3}
                    maxLength={300}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Security Settings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your account password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordMessage("");
              }}
              className="rounded-lg border border-blue-700 px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-50"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordMessage("");
                  }}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordMessage("");
                  }}
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordMessage("");
                  }}
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Update Password
              </button>

              {passwordMessage && (
                <p
                  role="status"
                  className="rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-800"
                >
                  {passwordMessage}
                </p>
              )}
            </form>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo profile only. Information is not saved permanently.
        </p>
      </main>
    </div>
  );
}

export default Profile;
