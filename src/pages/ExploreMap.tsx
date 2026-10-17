
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Link } from "react-router-dom";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function ExploreMap() {
  const center = { lat: 20.2961, lng: 85.8245 };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Explore Map
        </h1>
        <p className="mt-3 text-slate-600">
          Google Maps API key is missing. Check your .env.local file
          and restart the development server.
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Explore Map
            </h1>
            <p className="mt-2 text-slate-600">
              Explore civic issues around Bhubaneswar.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-[65vh] min-h-[400px]">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={center}
                defaultZoom={12}
                gestureHandling="greedy"
                style={{ width: "100%", height: "100%" }}
              >
                <Marker
                  position={center}
                  title="Bhubaneswar map center"
                />
              </Map>
            </APIProvider>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="font-semibold text-slate-800">
            Civic Issue Map
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The marker shows the demo map center. Real civic issue
            markers will be added when we connect the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExploreMap;
