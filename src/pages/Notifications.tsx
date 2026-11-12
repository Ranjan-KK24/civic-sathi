
import { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  id: number;
  report_id: number | null;
  title: string;
  message: string;
  notification_type: "status" | "info" | "success";
  is_read: boolean;
  created_at: string;
};

const API_URL = "http://localhost:5000";

function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Please log in to view your notifications.");
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const visibleNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.is_read
  );

  const apiRequest = async (
    url: string,
    method: string
  ) => {
    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  };

  const markAsRead = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, "PATCH");
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      setNotice("Notification marked as read.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to update notification."
      );
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}/unread`, "PATCH");
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: false } : item
        )
      );
      setNotice("Notification marked as unread.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to update notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/api/notifications/read-all", "PATCH");
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      setNotice("All notifications marked as read.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to update notifications."
      );
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}`, "DELETE");
      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );
      setNotice("Notification deleted.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to delete notification."
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const iconFor = (type: NotificationItem["notification_type"]) => {
    if (type === "success") {
      return (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
          ✓
        </span>
      );
    }

    if (type === "status") {
      return (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-700">
          ↻
        </span>
      );
    }

    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-700">
        i
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 pb-8 pt-28 sm:px-6 lg:pb-12">
        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Citizen Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-slate-600">
              Stay updated on your civic reports.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
            <p className="text-sm text-slate-600">
              Unread notifications
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setNotice("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  filter === "all"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilter("unread");
                  setNotice("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  filter === "unread"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                className="text-sm font-semibold text-slate-600 hover:text-blue-700"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Feedback */}
          {notice && (
            <p
              role="status"
              className="border-b border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-800"
            >
              {notice}
            </p>
          )}

          {/* Loading */}
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-3 font-semibold text-blue-700 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : visibleNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {visibleNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`flex gap-3 p-4 transition sm:gap-4 sm:p-5 ${
                    !notification.is_read ? "bg-blue-50/50" : "bg-white"
                  }`}
                >
                  <div className="shrink-0">
                    {iconFor(notification.notification_type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    {notification.report_id && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Report ID: #{notification.report_id}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(notification.created_at)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {notification.is_read ? (
                        <button
                          type="button"
                          onClick={() => markAsUnread(notification.id)}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Mark as unread
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                ✓
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "No notifications"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "Notifications about your reports will appear here."}
              </p>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Civic Sathi · One Citizen, One Step, One Nation.
        </p>
      </main>
    </div>
  );
}

export default Notifications;
