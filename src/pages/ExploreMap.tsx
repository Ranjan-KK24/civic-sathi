
import { useMemo, useState } from "react";
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
  position: { lat: number; lng: number };
  color: string;
};

const sampleIssues: CivicIssue[] = [
  {
    id: 1,
    title: "Large pothole on road",
    category: "Road Damage",
    status: "In Progress",
    description: "A pothole is making this road difficult to use.",
    location: "Jaydev Vihar, Bhubaneswar",
    position: { lat: 20.2965, lng: 85.8245 },
    color: "#dc2626",
  },
  {
    id: 2,
    title: "Garbage not collected",
    category: "Garbage",
    status: "Submitted",
    description: "Garbage has accumulated near the roadside.",
    location: "Saheed Nagar, Bhubaneswar",
    position: { lat: 20.2961, lng: 85.8422 },
    color: "#d97706",
  },
  {
    id: 3,
    title: "Streetlight not working",
    category: "Streetlight",
    status: "Under Review",
    description: "The streetlight is not turning on at night.",
    location: "Patia, Bhubaneswar",
    position: { lat: 20.3545, lng: 85.8175 },
    color: "#7c3aed",
  },
  {
    id: 4,
    title: "Blocked roadside drain",
    category: "Drainage",
    status: "Submitted",
    description: "Water is collecting because the drain appears blocked.",
    location: "Khandagiri, Bhubaneswar",
    position: { lat: 20.2566, lng: 85.7868 },
    color: "#0284c7",
  },
  {
    id: 5,
    title: "Damaged road surface",
    category: "Road Damage",
    status: "Resolved",
    description: "Demo report showing a resolved road issue.",
    location: "Unit 4, Bhubaneswar",
    position: { lat: 20.2785, lng: 85.8205 },
    color: "#16a34a",
  },
];

const categories = [
  "All Categories",
  "Road Damage",
  "Garbage",
  "Streetlight",
  "Drainage",
];

const statuses = [
  "All Statuses",
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
];

function ExploreMap() {
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");

  const center = { lat: 20.2961, lng: 85.8245 };

  const filteredIssues = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return sampleIssues.filter((issue) => {
      const matchesSearch =
        !searchText ||
        issue.title.toLowerCase().includes(searchText) ||
        issue.location.toLowerCase().includes(searchText) ||
        issue.category.toLowerCase().includes(searchText) ||
        String(issue.id).includes(searchText);

      const matchesCategory =
        category === "All Categories" || issue.category === category;

      const matchesStatus =
        status === "All Statuses" || issue.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 px-8 pb-8 pt-28">
        <h1 className="text-2xl font-bold text-slate-900">Explore Map</h1>
        <p className="mt-3 text-slate-600">
          Google Maps API key is missing. Check .env.local and restart
          the development server.
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Explore Map
            </h1>
            <p className="mt-2 text-slate-600">
              Find civic issues around Bhubaneswar.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

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

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            Showing <strong>{filteredIssues.length}</strong> of{" "}
            <strong>{sampleIssues.length}</strong> demo issues
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

        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
          {[
            { label: "Road Damage", color: "#dc2626" },
            { label: "Garbage", color: "#d97706" },
            { label: "Streetlight", color: "#7c3aed" },
            { label: "Drainage", color: "#0284c7" },
            { label: "Resolved", color: "#16a34a" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-[65vh] min-h-[400px]">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={center}
                defaultZoom={12}
                mapId="civic-sathi-explore-map"
                gestureHandling="greedy"
                style={{ width: "100%", height: "100%" }}
              >
                {filteredIssues.map((issue) => (
                  <AdvancedMarker
                    key={issue.id}
                    position={issue.position}
                    title={issue.title}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: issue.color }}
                    >
                      {issue.id}
                    </div>
                  </AdvancedMarker>
                ))}

                {selectedIssue &&
                  filteredIssues.some(
                    (issue) => issue.id === selectedIssue.id
                  ) && (
                    <InfoWindow
                      position={selectedIssue.position}
                      onCloseClick={() => setSelectedIssue(null)}
                    >
                      <div className="max-w-64 p-1">
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedIssue.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {selectedIssue.description}
                        </p>
                        <p className="mt-2 text-sm">
                          <strong>Category:</strong> {selectedIssue.category}
                        </p>
                        <p className="mt-1 text-sm">
                          <strong>Status:</strong> {selectedIssue.status}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedIssue.location}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Demo report #{selectedIssue.id}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
              </Map>
            </APIProvider>
          </div>
        </div>

        {filteredIssues.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No issues match your search and filters. Try different options
            or clear the filters.
          </div>
        )}

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="font-semibold text-slate-800">Civic Issue Map</h2>
          <p className="mt-1 text-sm text-slate-600">
            Search and filters update the visible markers. All reports are
            sample data and are not verified citizen complaints.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExploreMap;
