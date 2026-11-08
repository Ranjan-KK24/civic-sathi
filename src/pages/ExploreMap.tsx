
import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { Link } from "react-router-dom";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type CivicIssue = {
  id: number;
  title: string;
  category: string;
  status: string;
  description: string;
  location: string;
  position: {
    lat: number;
    lng: number;
  };
  photoUrl: string | null;
  date: string;
};

type ApiReport = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  latitude: string | number | null;
  longitude: string | number | null;
  created_at: string;
  photo_path: string | null;
};

const statusColors: Record<string, string> = {
  Pending: "#dc2626",
  Submitted: "#dc2626",
  "Under Review": "#eab308",
  "In Progress": "#eab308",
  Resolved: "#16a34a",
  Rejected: "#64748b",
};

const getStatusColor = (status: string) =>
  statusColors[status] || "#64748b";

function ExploreMap() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] =
    useState<CivicIssue | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch public reports from the backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/reports"
        );

        if (!response.ok) {
          throw new Error("Unable to load civic reports.");
        }

        const data: {
          success: boolean;
          reports: ApiReport[];
        } = await response.json();

        if (!data.success || !Array.isArray(data.reports)) {
          throw new Error("Invalid reports response from server.");
        }

        const mappedIssues: CivicIssue[] = data.reports
          .map((report) => {
            const lat = Number(report.latitude);
            const lng = Number(report.longitude);

            return {
              id: report.id,
              title: report.title,
              category: report.category,
              status: report.status,
              description: report.description,
              location: report.location,
              position: {
                lat,
                lng,
              },
              photoUrl: report.photo_path
                ? `http://localhost:5000${report.photo_path}`
                : null,
              date: new Date(report.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ),
            };
          })
          .filter(
            (issue) =>
              Number.isFinite(issue.position.lat) &&
              Number.isFinite(issue.position.lng) &&
              issue.position.lat >= -90 &&
              issue.position.lat <= 90 &&
              issue.position.lng >= -180 &&
              issue.position.lng <= 180 &&
              issue.position.lat !== 0 &&
              issue.position.lng !== 0
          );

        setIssues(mappedIssues);
      } catch (err) {
        console.error("Explore Map error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load reports."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Get categories from actual database reports
  const categories = useMemo(
    () => [
      "All Categories",
      ...Array.from(
        new Set(issues.map((issue) => issue.category))
      ).sort(),
    ],
    [issues]
  );

  // Filter reports
  const filteredIssues = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !searchText ||
        issue.title.toLowerCase().includes(searchText) ||
        issue.location.toLowerCase().includes(searchText) ||
        issue.category.toLowerCase().includes(searchText) ||
        String(issue.id).includes(searchText);

      const matchesCategory =
        category === "All Categories" ||
        issue.category === category;

      const matchesStatus =
        status === "All Statuses" ||
        issue.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [issues, search, category, status]);

  const statuses = [
    "All Statuses",
    "Pending",
    "Submitted",
    "Under Review",
    "In Progress",
    "Resolved",
    "Rejected",
  ];

  // Use the first available report location as the initial map center
  const center = filteredIssues.length > 0
    ? filteredIssues[0].position
    : { lat: 20.2961, lng: 85.8245 };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Explore Map
        </h1>

        <p className="mt-3 text-slate-600">
          Google Maps API key is missing. Check .env.local
          and restart the frontend server.
        </p>

        <Link
          to="/dashboard"
          className="mt-4 inline-block text-blue-600"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Explore Map
            </h1>

            <p className="mt-2 text-slate-600">
              Discover reported civic issues and track their progress.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">

          <div>
            <label
              htmlFor="issue-search"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Search issues
            </label>

            <input
              id="issue-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, location, ID..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="category-filter"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Information and Clear Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            Showing <strong>{filteredIssues.length}</strong> of{" "}
            <strong>{issues.length}</strong> map reports
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All Categories");
              setStatus("All Statuses");
              setSelectedIssue(null);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Clear filters
          </button>
        </div>

        {/* Status Legend */}
        <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">

          {[
            { label: "Pending / Submitted", color: "#dc2626" },
            { label: "Under Review / In Progress", color: "#eab308" },
            { label: "Resolved", color: "#16a34a" },
            { label: "Rejected", color: "#64748b" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-sm text-slate-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
            Loading civic reports...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Google Map */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-[65vh] min-h-[400px]">
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={center}
                  defaultZoom={12}
                  mapId="civic-sathi-explore-map"
                  gestureHandling="greedy"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >

                  {/* Report Markers */}
                  {filteredIssues.map((issue) => (
                    <AdvancedMarker
                      key={issue.id}
                      position={issue.position}
                      title={issue.title}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg"
                        style={{
                          backgroundColor: getStatusColor(issue.status),
                        }}
                      >
                        {issue.id}
                      </div>
                    </AdvancedMarker>
                  ))}

                  {/* Selected Report Details */}
                  {selectedIssue &&
                    filteredIssues.some(
                      (issue) => issue.id === selectedIssue.id
                    ) && (
                      <InfoWindow
                        position={selectedIssue.position}
                        onCloseClick={() => setSelectedIssue(null)}
                      >
                        <div className="w-64 p-1">
                          <h3 className="text-base font-bold text-slate-900">
                            {selectedIssue.title}
                          </h3>

                          <p className="mt-2 text-sm text-slate-600">
                            {selectedIssue.description}
                          </p>

                          <div className="mt-3 space-y-2 text-sm">
                            <p>
                              <strong>Report ID:</strong>{" "}
                              #{selectedIssue.id}
                            </p>

                            <p>
                              <strong>Category:</strong>{" "}
                              {selectedIssue.category}
                            </p>

                            <p>
                              <strong>Status:</strong>{" "}
                              <span
                                style={{
                                  color: getStatusColor(selectedIssue.status),
                                  fontWeight: 600,
                                }}
                              >
                                {selectedIssue.status}
                              </span>
                            </p>

                            <p>
                              <strong>Location:</strong>{" "}
                              {selectedIssue.location}
                            </p>

                            <p>
                              <strong>Reported:</strong>{" "}
                              {selectedIssue.date}
                            </p>
                          </div>

                          {selectedIssue.photoUrl && (
                            <div className="mt-3">
                              <img
                                src={selectedIssue.photoUrl}
                                alt={`Evidence for report ${selectedIssue.id}`}
                                className="max-h-40 w-full rounded-lg border border-slate-200 object-cover"
                              />
                            </div>
                          )}

                          {!selectedIssue.photoUrl && (
                            <p className="mt-3 text-xs text-slate-400">
                              No photo attached.
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                </Map>
              </APIProvider>
            </div>
          </div>
        )}

        {/* No Reports */}
        {!loading && !error && filteredIssues.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No reports with valid map coordinates match your filters.
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="font-semibold text-slate-800">
            Public Civic Issue Map
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Report details and uploaded evidence are visible to the public.
            Personal information about the person who submitted a report
            is not displayed.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ExploreMap;
