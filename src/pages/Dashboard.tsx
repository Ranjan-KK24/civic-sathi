
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const sampleReports = [
  {
    id: "CS-001",
    title: "Road damage",
    category: "Roads",
    date: "12 Oct 2026",
    status: "In Progress",
  },
  {
    id: "CS-002",
    title: "Garbage accumulation",
    category: "Sanitation",
    date: "10 Oct 2026",
    status: "Resolved",
  },
  {
    id: "CS-003",
    title: "Broken streetlight",
    category: "Streetlights",
    date: "08 Oct 2026",
    status: "Under Review",
  },
];

const navigation = [
  { label: "Dashboard", icon: "▦", href: "/dashboard" },
  { label: "My Reports", icon: "▤", href: "/my-reports" },
  { label: "Report an Issue", icon: "＋", href: "/report-issue" },
  { label: "Explore Map", icon: "⌖", href: "/map" },
  { label: "Notifications", icon: "♧", href: "/notifications" },
  { label: "My Profile", icon: "♙", href: "/profile" },
];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const stats = [
    {
      label: "Total Reports",
      value: 12,
      icon: "▤",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "In Progress",
      value: 4,
      icon: "◷",
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Resolved",
      value: 6,
      icon: "✓",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Under Review",
      value: 2,
      icon: "◉",
      color: "bg-purple-50 text-purple-700",
    },
  ];

  const statusStyle: Record<string, string> = {
    Submitted: "bg-blue-50 text-blue-700",
    "Under Review": "bg-purple-50 text-purple-700",
    "In Progress": "bg-amber-50 text-amber-700",
    Resolved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-[73px] z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-[73px] z-50 w-64 border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="mb-4 px-3 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"
                }`}
              >
                <span className="w-6 text-center text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-blue-50 p-4">
          <p className="font-semibold text-blue-900">
            Your voice matters!
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            Every report is a step towards a better community.
          </p>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-10 pt-28 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open dashboard menu"
          >
            ☰ Menu
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-700">
                CITIZEN DASHBOARD
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Welcome back, Citizen!
              </h1>
              <p className="mt-2 text-slate-500">
                Here's an overview of your civic activities.
              </p>
            </div>

            <Link
              to="/report-issue"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <span className="text-xl">＋</span>
              Report an Issue
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Sample dashboard data
                </p>
              </article>
            ))}
          </div>

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white sm:p-8 xl:col-span-2">
              <p className="text-sm font-semibold text-blue-100">
                MAKE A DIFFERENCE
              </p>
              <h2 className="mt-3 max-w-lg text-2xl font-bold sm:text-3xl">
                See a problem in your neighbourhood?
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-blue-100">
                Report damaged roads, garbage, broken streetlights and
                other civic issues. Help make your community better.
              </p>
              <Link
                to="/report-issue"
                className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Submit a Report →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold">Your Contribution</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Every civic report helps bring local problems to
                attention.
              </p>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl font-bold text-blue-700">
                  6
                </span>
                <span className="pb-1 text-sm text-slate-500">
                  sample issues resolved
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 rounded-full bg-blue-600" />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Illustrative progress only
              </p>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Recent Reports</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A preview of your latest civic reports.
                </p>
              </div>

              <Link
                to="/my-reports"
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                View all reports →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Report</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sampleReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {report.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {report.id}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {report.category}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {report.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyle[report.status]
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-400">
                These are demonstration reports, not real citizen records.
              </p>
            </div>
          </section>

          <p className="mt-8 text-center text-xs text-slate-400">
            Civic Sathi · One Citizen, One Step, One Nation.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
