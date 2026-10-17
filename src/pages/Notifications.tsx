
import { useState } from "react";
import type { ReactNode } from "react";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "status" | "info" | "success";
  read: boolean;
  reportId?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Report submitted successfully",
    message:
      'Your report "Large pothole on road" has been submitted for review.',
    time: "10 minutes ago",
    type: "info",
    read: false,
    reportId: "CS-1001",
  },
  {
    id: 2,
    title: "Report under review",
    message:
      'Your report "Garbage not collected" is being reviewed by the concerned team.',
    time: "2 hours ago",
    type: "status",
    read: false,
    reportId: "CS-1002",
  },
  {
    id: 3,
    title: "Issue resolved",
    message:
      'The sample report "Damaged road surface" has been marked as resolved.',
    time: "Yesterday",
    type: "success",
    read: true,
    reportId: "CS-1003",
  },
  {
    id: 4,
    title: "Welcome to Civic Sathi",
    message:
      "Use Civic Sathi to report civic issues and follow their progress.",
    time: "2 days ago",
    type: "info",
    read: true,
  },
  {
    id: 5,
    title: "Report in progress",
    message:
      'Your sample report "Streetlight not working" is marked in progress.',
    time: "3 days ago",
    type: "status",
    read: true,
    reportId: "CS-1004",
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notice, setNotice] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const visibleNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.read
  );

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setNotice("Notification marked as read.");
  };

  const markAsUnread = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: false }
          : notification
      )
    );
    setNotice("Notification marked as unread.");
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
    setNotice("All notifications marked as read.");
  };

  const deleteNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
    setNotice("Notification deleted.");
  };

  const iconFor = (type: NotificationItem["type"]): ReactNode => {
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
            <p className="text-sm text-slate-600">Unread notifications</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Mark all as read
            </button>
          </div>

          {notice && (
            <p
              role="status"
              className="border-b border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-800"
            >
              {notice}
            </p>
          )}

          {visibleNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {visibleNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`flex gap-3 p-4 transition sm:gap-4 sm:p-5 ${
                    !notification.read ? "bg-blue-50/50" : "bg-white"
                  }`}
                >
                  <div className="shrink-0">
                    {iconFor(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {notification.title}
                      </h2>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    {notification.reportId && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Report ID: {notification.reportId}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {notification.time}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {notification.read ? (
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
