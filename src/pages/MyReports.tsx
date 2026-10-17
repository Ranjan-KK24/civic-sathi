
import { useState } from "react";
import { Link } from "react-router-dom";

type ReportStatus =
  | "Submitted"
  | "Under Review"
  | "In Progress"
  | "Resolved"
  | "Rejected";

type Report = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  status: ReportStatus;
  description: string;
};

const sampleReports: Report[] = [
  {
    id: "CS-001",
    title: "Road damage near main market",
    category: "Roads",
    date: "12 Oct 2026",
    location: "Main Market Road",
    status: "In Progress",
    description:
      "A damaged section of road is making travel difficult for residents and commuters.",
  },
  {
    id: "CS-002",
    title: "Garbage accumulation",
    category: "Sanitation",
    date: "10 Oct 2026",
    location: "Community Park",
    status: "Resolved",
    description:
      "Garbage had accumulated near the park entrance and needed collection.",
  },
  {
    id: "CS-003",
    title: "Broken streetlight",
    category: "Streetlights",
    date: "08 Oct 2026",
    location: "Station Road",
    status: "Under Review",
    description:
      "A streetlight is not working, leaving part of the road poorly lit at night.",
  },
  {
    id: "CS-004",
    title: "Blocked drainage",
    category: "Drainage",
    date: "06 Oct 2026",
    location: "Residential Lane",
    status: "Submitted",
    description:
      "A blocked drain is preventing water from flowing properly.",
  },
  {
    id: "CS-005",
    title: "Damaged public dustbin",
    category: "Sanitation",
    date: "04 Oct 2026",
    location: "Bus Stand",
    status: "Rejected",
    description:
      "The submitted report needs further clarification before the issue can be processed.",
  },
];

const statuses: Array<"All" | ReportStatus> = [
  "All",
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

function MyReports() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<"All" | ReportStatus>("All");
  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const statusStyles: Record<ReportStatus, string> = {
    Submitted: "bg-blue-50 text-blue-700",
    "Under Review": "bg-purple-50 text-purple-700",
    "In Progress": "bg-amber-50 text-amber-700",
    Resolved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  const filteredReports = sampleReports.filter((report) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm) ||
      report.id.toLowerCase().includes(searchTerm) ||
      report.location.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "All" ||
      report.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Reports",
      value: sampleReports.length,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "Submitted",
      value: sampleReports.filter(
        (report) => report.status === "Submitted"
      ).length,
      color: "text-indigo-700 bg-indigo-50",
    },
    {
      label: "In Progress",
      value: sampleReports.filter(
        (report) => report.status === "In Progress"
      ).length,
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Resolved",
      value: sampleReports.filter(
        (report) => report.status === "Resolved"
      ).length,
      color: "text-green-700 bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Citizen Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">My Reports</h1>
            <p className="mt-2 text-slate-500">
              View your reported civic issues and track their progress.
            </p>
          </div>

          <Link
            to="/report-issue"
            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            + Report an Issue
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                >
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  reports
                </span>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-lg font-bold">All Reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search reports or filter them by their current status.
            </p>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <label htmlFor="report-search" className="sr-only">
                  Search reports
                </label>
                <input
                  id="report-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, report ID or location..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="lg:w-56">
                <label htmlFor="status-filter" className="sr-only">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value as "All" | ReportStatus
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Report</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
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
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {report.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-slate-700">
                No reports found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search term or status filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedStatus("All");
                }}
                className="mt-4 font-semibold text-blue-700 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            Showing {filteredReports.length} of {sampleReports.length} sample
            reports
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demonstration data only. Real reports will be loaded from the backend.
        </p>
      </main>

      {selectedReport && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-detail-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  {selectedReport.id}
                </p>
                <h2
                  id="report-detail-title"
                  className="mt-2 text-2xl font-bold"
                >
                  {selectedReport.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report details"
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedReport.status]}`}
              >
                {selectedReport.status}
              </span>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Category</dt>
                <dd className="mt-1 font-semibold">
                  {selectedReport.category}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Reported date</dt>
                <dd className="mt-1 font-semibold">
                  {selectedReport.date}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd className="mt-1 font-semibold">
                  {selectedReport.location}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Description</dt>
                <dd className="mt-1 leading-6 text-slate-700">
                  {selectedReport.description}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="mt-7 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default MyReports;
