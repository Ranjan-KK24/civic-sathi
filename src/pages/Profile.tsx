
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  role: string;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    if (!token) {
      setMessage("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile(data.user);
      setName(data.user.name);
      setPhone(data.user.phone || "");
      setAddress(data.user.address || "");
      setCity(data.user.city || "");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSaveProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed.");
      }

      setProfile(data.user);
      setName(data.user.name);
      setPhone(data.user.phone || "");
      setAddress(data.user.address || "");
      setCity(data.user.city || "");

      // Keep the stored user name in sync
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, name: data.user.name })
        );
      }

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;

    setName(profile.name);
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setCity(profile.city || "");
    setIsEditing(false);
    setMessage("");
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) return;

    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordMessage("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed.");
      }

      setPasswordMessage("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  // ==========================================
  // PROFILE INITIALS
  // ==========================================

  const initials = profile?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl bg-white p-8 shadow text-center">
          <p className="text-red-600">{message || "Unable to load profile."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PROFILE PAGE
  // ==========================================

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

        {/* PROFILE INFORMATION */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl font-bold">
                {initials || "CU"}
              </div>

              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Civic Sathi Citizen Account
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {profile.email}
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
                    setIsEditing(true);
                    setMessage("");
                  }}
                  className="rounded-lg border border-blue-700 px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <p
                role="status"
                className="mt-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-800"
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSaveProfile} className="mt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    maxLength={20}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!isEditing}
                    maxLength={100}
                    placeholder="Enter city or town"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address / Locality
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditing}
                    maxLength={300}
                    rows={3}
                    placeholder="Enter your locality or address"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* SECURITY SETTINGS */}

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
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
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
                  className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800"
                >
                  {passwordMessage}
                </p>
              )}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default Profile;
