
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ReportHistoryItem {
  id: number;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
  changed_by_name: string | null;
}

interface ReportForwardingItem {
  id: number;
  authority_name: string;
  department: string | null;
  reference_number: string | null;
  forwarding_channel: string | null;
  notes: string | null;
  created_at: string;
  forwarded_by_name: string | null;
}

interface Report {
  id: number;
  user_id: number | null;
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
  merged_at?: string | null;
  merged_by?: number | null;
  resolution_summary?: string | null;
  municipality_response?: string | null;
  resolution_date?: string | null;
}

const API_URL = "http://localhost:5000";

const STATUSES = [
  "Pending",
  "Under Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);
  const [editingReport, setEditingReport] =
    useState<Report | null>(null);

  const [historyItems, setHistoryItems] =
    useState<ReportHistoryItem[]>([]);
  const [forwardingItems, setForwardingItems] =
    useState<ReportForwardingItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");

  const [resolutionSummary, setResolutionSummary] = useState("");
  const [municipalityResponse, setMunicipalityResponse] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch reports.");
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Load activity history whenever an admin opens a report.
  useEffect(() => {
    if (!selectedReport) {
      setHistoryItems([]);
      setForwardingItems([]);
      setHistoryError("");
      return;
    }

    let cancelled = false;

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/api/admin/reports/${selectedReport.id}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load report history."
          );
        }

        if (!cancelled) {
          setHistoryItems(data.history || []);
          setForwardingItems(data.forwardings || []);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryItems([]);
          setForwardingItems([]);
          setHistoryError(
            err instanceof Error
              ? err.message
              : "Unable to load report history."
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedReport?.id, token]);

  const categories = [
    ...new Set(
      reports.map((report) => report.category).filter(Boolean)
    ),
  ];

  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      report.title?.toLowerCase().includes(searchText) ||
      report.citizen_name?.toLowerCase().includes(searchText) ||
      report.citizen_email?.toLowerCase().includes(searchText) ||
      String(report.id).includes(searchText);

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const isMerged = (report: Report) =>
    report.merged_into_report_id != null;

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

  const formatDate = (date: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;

    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const openStatusEditor = (report: Report) => {
    if (isMerged(report)) return;

    setEditingReport(report);
    setNewStatus(report.status);
    setReason("");

    setResolutionSummary(report.resolution_summary || "");
    setMunicipalityResponse(report.municipality_response || "");

    setResolutionDate(
      report.resolution_date
        ? report.resolution_date.slice(0, 10)
        : getTodayDate()
    );

    setMessage("");
  };

  const updateStatus = async () => {
    if (!editingReport || !newStatus) return;

    if (isMerged(editingReport)) {
      setMessage(
        `This report has been merged into report #${editingReport.merged_into_report_id}. Update the primary report instead.`
      );
      return;
    }

    if (newStatus === "Rejected" && !reason.trim()) {
      setMessage("Please provide a reason for rejection.");
      return;
    }

    if (newStatus === "Resolved") {
      if (!resolutionSummary.trim()) {
        setMessage("Please enter the resolution summary.");
        return;
      }

      if (!municipalityResponse.trim()) {
        setMessage("Please enter the municipality response.");
        return;
      }

      if (!resolutionDate) {
        setMessage("Please select the resolution date.");
        return;
      }
    }

    if (newStatus === editingReport.status) {
      setMessage("Select a different status.");
      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/reports/${editingReport.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            reason: reason.trim() || undefined,
            resolution_summary:
              newStatus === "Resolved"
                ? resolutionSummary.trim()
                : undefined,
            municipality_response:
              newStatus === "Resolved"
                ? municipalityResponse.trim()
                : undefined,
            resolution_date:
              newStatus === "Resolved" ? resolutionDate : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setEditingReport(null);
      setSelectedReport(null);
      setMessage("");

      await fetchReports();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to update status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const activityItems = [
    ...historyItems.map((item) => ({
      type: "status" as const,
      id: `status-${item.id}`,
      created_at: item.created_at,
      item,
    })),
    ...forwardingItems.map((item) => ({
      type: "forwarding" as const,
      id: `forwarding-${item.id}`,
      created_at: item.created_at,
      item,
    })),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-white md:flex">
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
              className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              ▦ Dashboard
            </Link>

            <Link
              to="/admin/reports"
              className="block rounded-lg bg-blue-700 px-4 py-3 font-medium"
            >
              📋 Manage Reports
            </Link>

            <Link
              to="/map"
              className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              📍 Explore Map
            </Link>

            <div className="border-t border-slate-700 pt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
              >
                ↪ Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Administration
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Manage Reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review citizen complaints and manage their status.
              </p>
            </div>

            <Link
              to="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Dashboard
            </Link>
          </header>

          {/* Filters */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search Reports
                </label>

                <input
                  type="text"
                  placeholder="Search title, citizen or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Filter by Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
                >
                  <option value="All">All Statuses</option>

                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Filter by Category
                </label>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
                >
                  <option value="All">All Categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing {filteredReports.length} of {reports.length} reports
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setCategoryFilter("All");
                }}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </section>

          {/* Reports table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  All Reports
                </h3>

                <p className="text-sm text-slate-500">
                  View and update submitted complaints.
                </p>
              </div>

              <button
                onClick={fetchReports}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading reports...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>

                <button
                  onClick={fetchReports}
                  className="mt-3 font-semibold text-blue-700 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No reports found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Report</th>
                      <th className="px-5 py-4">Citizen</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {report.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            Report #{report.id}
                          </p>

                          {isMerged(report) && (
                            <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                              Merged into #{report.merged_into_report_id}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {report.citizen_name || "Unknown"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {report.citizen_email || "N/A"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {report.category}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(report.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              View
                            </button>

                            <button
                              onClick={() => openStatusEditor(report)}
                              disabled={isMerged(report)}
                              className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Report details modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
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
                <p className="mb-2 text-sm text-slate-500">
                  Current Status
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    selectedReport.status
                  )}`}
                >
                  {selectedReport.status}
                </span>
              </div>

              {/* Report activity timeline */}
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4">
                  <h4 className="font-bold text-slate-900">
                    Report Activity
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Submission and recorded status changes, in chronological order.
                  </p>
                </div>

                {historyLoading ? (
                  <p className="text-sm text-slate-500">
                    Loading activity...
                  </p>
                ) : historyError ? (
                  <p className="text-sm text-red-600">
                    {historyError}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-700">
                        ✓
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          Report submitted
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(selectedReport.created_at)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Initial status: Pending
                        </p>
                      </div>
                    </div>

                    {activityItems.length === 0 ? (
                      <p className="pl-10 text-sm text-slate-500">
                        No further activity has been recorded yet.
                      </p>
                    ) : (
                      activityItems.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div
                            className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                              activity.type === "forwarding"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {activity.type === "forwarding" ? "↗" : "↻"}
                          </div>

                          <div className="min-w-0 flex-1">
                            {activity.type === "status" ? (
                              <>
                                <p className="font-semibold text-slate-800">
                                  {activity.item.old_status || "Status"} →{" "}
                                  {activity.item.new_status}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(activity.item.created_at)}
                                  {activity.item.changed_by_name
                                    ? ` · Updated by ${activity.item.changed_by_name}`
                                    : " · Admin"}
                                </p>

                                {activity.item.reason && (
                                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-slate-700">
                                    {activity.item.reason}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-slate-800">
                                  Forwarded to {activity.item.authority_name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(activity.item.created_at)}
                                  {activity.item.forwarded_by_name
                                    ? ` · Forwarded by ${activity.item.forwarded_by_name}`
                                    : " · Admin"}
                                </p>

                                <div className="mt-2 space-y-1 rounded-lg bg-white p-3 text-sm text-slate-700">
                                  {activity.item.department && (
                                    <p>
                                      <span className="font-medium">
                                        Department:{" "}
                                      </span>
                                      {activity.item.department}
                                    </p>
                                  )}

                                  {activity.item.reference_number && (
                                    <p>
                                      <span className="font-medium">
                                        Reference number:{" "}
                                      </span>
                                      {activity.item.reference_number}
                                    </p>
                                  )}

                                  {activity.item.forwarding_channel && (
                                    <p>
                                      <span className="font-medium">
                                        Channel:{" "}
                                      </span>
                                      {activity.item.forwarding_channel}
                                    </p>
                                  )}

                                  {activity.item.notes && (
                                    <p className="whitespace-pre-wrap">
                                      <span className="font-medium">
                                        Notes:{" "}
                                      </span>
                                      {activity.item.notes}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>

              {/* Resolution information */}
              {selectedReport.status === "Resolved" && (
                <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <h4 className="font-bold text-green-800">
                    Resolution Information
                  </h4>

                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Resolution Summary
                    </p>

                    <p className="whitespace-pre-wrap text-sm text-green-900">
                      {selectedReport.resolution_summary || "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Municipality Response
                    </p>

                    <p className="whitespace-pre-wrap text-sm text-green-900">
                      {selectedReport.municipality_response || "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Resolution Date
                    </p>

                    <p className="text-sm text-green-900">
                      {selectedReport.resolution_date
                        ? new Date(
                            `${selectedReport.resolution_date.slice(0, 10)}T00:00:00`
                          ).toLocaleDateString("en-IN")
                        : "Not recorded"}
                    </p>
                  </div>
                </div>
              )}

              {/* Merged report notice */}
              {isMerged(selectedReport) && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <p className="font-semibold text-purple-800">
                    This report has been merged.
                  </p>

                  <p className="mt-1 text-sm text-purple-700">
                    It is linked to primary report #
                    {selectedReport.merged_into_report_id}. Status changes
                    should be made on the primary report instead.
                  </p>

                  {selectedReport.merged_at && (
                    <p className="mt-2 text-xs text-purple-600">
                      Merged on: {formatDate(selectedReport.merged_at)}
                    </p>
                  )}
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

              <button
                onClick={() => {
                  openStatusEditor(selectedReport);
                  setSelectedReport(null);
                }}
                disabled={isMerged(selectedReport)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isMerged(selectedReport)
                  ? "Status Update Unavailable — Merged Report"
                  : "Update Report Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {editingReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Update Report Status
                </h3>

                <p className="text-sm text-slate-500">
                  Report #{editingReport.id}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingReport(null);
                  setMessage("");
                }}
                className="text-2xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-1 text-sm text-slate-500">Report</p>

                <p className="font-semibold text-slate-900">
                  {editingReport.title}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select New Status
                </label>

                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setMessage("");
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rejection reason */}
              {newStatus === "Rejected" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rejection Reason *
                  </label>

                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this report is being rejected..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {/* Resolution details */}
              {newStatus === "Resolved" && (
                <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div>
                    <h4 className="font-bold text-green-800">
                      Resolution Details
                    </h4>

                    <p className="mt-1 text-xs text-green-700">
                      Record the resolution information received from the
                      municipality before marking this report as resolved.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Resolution Summary *
                    </label>

                    <textarea
                      rows={3}
                      value={resolutionSummary}
                      onChange={(e) =>
                        setResolutionSummary(e.target.value)
                      }
                      placeholder="Describe what was done to resolve the issue..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Municipality Response *
                    </label>

                    <textarea
                      rows={3}
                      value={municipalityResponse}
                      onChange={(e) =>
                        setMunicipalityResponse(e.target.value)
                      }
                      placeholder="Enter the response received from the municipality..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Resolution Date *
                    </label>

                    <input
                      type="date"
                      value={resolutionDate}
                      max={getTodayDate()}
                      onChange={(e) =>
                        setResolutionDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              )}

              {message && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingReport(null);
                    setMessage("");
                  }}
                  disabled={updating}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={updateStatus}
                  disabled={updating}
                  className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
