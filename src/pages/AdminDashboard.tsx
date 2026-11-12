
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Report {
  id: number;
  citizen_name: string | null;
  citizen_email: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  photo_path: string | null;
  merged_into_report_id?: number | null;
}

const API_URL = "http://localhost:5000";

function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reports.");
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const countStatus = (status: string) =>
    reports.filter(
      (report) =>
        report.status?.toLowerCase() === status.toLowerCase()
    ).length;

  const stats = [
    {
      title: "Total Reports",
      value: reports.length,
      icon: "📋",
      color: "bg-blue-50 text-blue-700",
      filter: "All",
    },
    {
      title: "Pending",
      value: countStatus("Pending"),
      icon: "⏳",
      color: "bg-red-50 text-red-700",
      filter: "Pending",
    },
    {
      title: "Under Review",
      value: countStatus("Under Review"),
      icon: "🔍",
      color: "bg-yellow-50 text-yellow-700",
      filter: "Under Review",
    },
    {
      title: "In Progress",
      value: countStatus("In Progress"),
      icon: "⚙️",
      color: "bg-orange-50 text-orange-700",
      filter: "In Progress",
    },
    {
      title: "Resolved",
      value: countStatus("Resolved"),
      icon: "✅",
      color: "bg-green-50 text-green-700",
      filter: "Resolved",
    },
    {
      title: "Rejected",
      value: countStatus("Rejected"),
      icon: "❌",
      color: "bg-slate-100 text-slate-700",
      filter: "Rejected",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-red-100 text-red-700";
      case "under review":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  const categoryCounts = reports.reduce<Record<string, number>>(
    (counts, report) => {
      const category = report.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    },
    {}
  );

  const categoryData = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const maxCategoryCount = Math.max(
    ...categoryData.map((item) => item[1]),
    1
  );

  const filteredReports = reports
    .filter(
      (report) =>
        selectedStatus === "All" ||
        report.status?.toLowerCase() === selectedStatus.toLowerCase()
    )
    .slice(0, 5);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-900 text-white md:flex">
          <div className="border-b border-slate-700 p-6">
            <h1 className="text-2xl font-bold">
              Civic <span className="text-blue-400">Sathi</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Administration Panel
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-lg bg-blue-700 px-4 py-3 font-medium"
            >
              ▦ Dashboard
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📋 All Reports
            </Link>

            <button
              onClick={() => {
                setSelectedStatus("Pending");
                document.getElementById("recent-reports")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
            >
              ⏳ Pending Verification
            </button>

            <Link
              to="/admin/duplicates"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              🔄 Duplicate Reports
            </Link>

            <a
              href="#category-overview"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📊 Category Overview
            </a>

            <Link
              to="/map"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📍 Explore Map
            </Link>

            <div className="border-t border-slate-700 pt-4">
              <p className="px-4 text-xs uppercase tracking-wider text-slate-500">
                Account
              </p>

              <button
                onClick={logout}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
              >
                ↪ Logout
              </button>
            </div>
          </nav>

          <div className="border-t border-slate-700 p-5 text-xs text-slate-500">
            Civic Sathi Admin Panel
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Administration
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Admin Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor and manage citizen reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchReports}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ↻ Refresh
              </button>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="font-semibold text-slate-800">
                  Super Administrator
                </p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="rounded-xl bg-white p-10 text-center text-slate-600 shadow-sm">
              Loading dashboard data...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-semibold">Unable to load dashboard</p>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Report Overview
                  </h3>
                  <span className="text-sm text-slate-500">
                    Live database data
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {stats.map((stat) => (
                    <button
                      key={stat.title}
                      onClick={() => {
                        setSelectedStatus(stat.filter);
                        document.getElementById("recent-reports")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className={`rounded-xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                        selectedStatus === stat.filter
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-slate-200"
                      } bg-white`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>

                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}
                        >
                          {stat.icon}
                        </span>
                      </div>

                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>

                      <p className="mt-2 text-xs text-blue-600">
                        Click to view reports →
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Category Overview */}
              <section
                id="category-overview"
                className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Reports by Category
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Breakdown of citizen complaints.
                  </p>
                </div>

                {categoryData.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No category data available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryData.map(([category, count]) => (
                      <div key={category}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {category}
                          </span>
                          <span className="font-semibold text-slate-600">
                            {count} reports
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${(count / maxCategoryCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Reports */}
              <section
                id="recent-reports"
                className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent Reports
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedStatus === "All"
                        ? "Latest citizen submissions"
                        : `Showing ${selectedStatus} reports`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                      {selectedStatus === "All"
                        ? reports.length
                        : countStatus(selectedStatus)}{" "}
                      Reports
                    </span>

                    <button
                      onClick={() => setSelectedStatus("All")}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Clear Filter
                    </button>

                    <Link
                      to="/admin/reports"
                      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      View All Reports →
                    </Link>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">
                    No reports available for this selection.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-4">Report</th>
                          <th className="px-5 py-4">Citizen</th>
                          <th className="px-5 py-4">Category</th>
                          <th className="px-5 py-4">Date</th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredReports.map((report) => (
                          <tr
                            key={report.id}
                            className="transition hover:bg-blue-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {report.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Report #{report.id}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-800">
                                {report.citizen_name || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {report.citizen_email || "N/A"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {report.category}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {formatDate(report.created_at)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(report.status)}`}
                              >
                                {report.status}
                              </span>

                              {report.merged_into_report_id && (
                                <p className="mt-2 text-xs font-semibold text-purple-700">
                                  Merged into #{report.merged_into_report_id}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Report Details
                </h3>
                <p className="text-sm text-slate-500">
                  Report #{selectedReport.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-2xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-sm text-slate-500">Title</p>
                <p className="font-semibold text-slate-900">
                  {selectedReport.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="whitespace-pre-wrap text-slate-700">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Citizen</p>
                  <p className="font-medium text-slate-800">
                    {selectedReport.citizen_name || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedReport.citizen_email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-medium text-slate-800">
                    {selectedReport.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-800">
                    {selectedReport.location || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Submitted</p>
                  <p className="font-medium text-slate-800">
                    {formatDate(selectedReport.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-500">Current Status</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedReport.status)}`}
                >
                  {selectedReport.status}
                </span>
              </div>

              {selectedReport.merged_into_report_id && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
                  This report has been merged into report #
                  {selectedReport.merged_into_report_id}.
                </div>
              )}

              {selectedReport.photo_path && (
                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    Attached Photo
                  </p>
                  <img
                    src={getPhotoUrl(selectedReport.photo_path) || ""}
                    alt="Report evidence"
                    className="max-h-72 w-full rounded-xl border border-slate-200 object-contain"
                  />
                </div>
              )}

              {selectedReport.latitude != null &&
                selectedReport.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    View location on Google Maps →
                  </a>
                )}

              <div className="flex flex-wrap gap-3">
                {!selectedReport.merged_into_report_id && (
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      navigate("/admin/reports");
                    }}
                    className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
                  >
                    Manage This Report
                  </button>
                )}

                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
