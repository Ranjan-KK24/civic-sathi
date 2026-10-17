
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type Coordinates = {
  lat: number;
  lng: number;
};

function ReportIssue() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!category) {
      setMessage("Please select an issue category.");
      return;
    }

    setMessage(
      "Your report form is complete! This is a demonstration only. Connect the backend to save and track real reports."
    );
  };

  const handleClearForm = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setTitle("");
    setCategory("");
    setDescription("");
    setLocation("");
    setPriority("Normal");
    setPhoto(null);
    setPhotoPreview("");
    setCoordinates(null);
    setMessage("");

    const input = document.getElementById("photo") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <main className="mx-auto max-w-4xl px-4 pb-8 pt-28 sm:px-6 lg:pb-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Citizen Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Report a Civic Issue
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Help improve your neighbourhood by reporting a problem. Provide
            accurate details so the issue can be understood and addressed.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Issue information */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold">Issue Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Describe the civic problem you noticed.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Issue title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setMessage("");
                  }}
                  placeholder="e.g. Large pothole near the market"
                  maxLength={120}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Issue category <span className="text-red-600">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setMessage("");
                  }}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a category</option>
                  <option value="Roads">Roads and potholes</option>
                  <option value="Sanitation">Garbage and sanitation</option>
                  <option value="Drainage">Drainage and waterlogging</option>
                  <option value="Streetlights">Streetlights</option>
                  <option value="Water Supply">Water supply</option>
                  <option value="Public Property">Public property damage</option>
                  <option value="Other">Other civic issue</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Explain the problem, where it occurs, and how it affects people..."
                  rows={5}
                  minLength={10}
                  maxLength={1500}
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {description.length}/1500 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  This is the citizen's suggested priority. The actual
                  priority may be reviewed later.
                </p>
              </div>
            </div>
          </section>

          {/* Issue location */}
          <section className="border-t border-slate-200 pt-7">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Issue Location</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter a landmark or select the exact location on the map.
              </p>
            </div>

            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Location or landmark <span className="text-red-600">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setMessage("");
              }}
              placeholder="e.g. Near the bus stand, Cuttack"
              maxLength={200}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-5">
              <h3 className="mb-2 font-semibold text-slate-700">
                Select the exact location
              </h3>
              <p className="mb-3 text-sm text-slate-500">
                Click anywhere on the map to place a marker at the location
                of the civic issue.
              </p>

              {apiKey ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="h-[350px]">
                    <APIProvider apiKey={apiKey}>
                      <Map
                        defaultCenter={{ lat: 20.2961, lng: 85.8245 }}
                        defaultZoom={12}
                        mapId="civic-sathi-explore-map"
                        gestureHandling="greedy"
                        style={{ width: "100%", height: "100%" }}
                        onClick={(event) => {
                          const position = event.detail.latLng;

                          if (position) {
                            setCoordinates({
                              lat: position.lat,
                              lng: position.lng,
                            });
                            setMessage("");
                          }
                        }}
                      >
                        {coordinates && (
                          <AdvancedMarker position={coordinates} />
                        )}
                      </Map>
                    </APIProvider>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Google Maps API key is missing. Check your .env.local file.
                </p>
              )}

              {coordinates ? (
                <div className="mt-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-semibold">
                    Location selected successfully!
                  </p>
                  <p className="mt-1">
                    Latitude: {coordinates.lat.toFixed(6)}
                  </p>
                  <p>Longitude: {coordinates.lng.toFixed(6)}</p>
                  <button
                    type="button"
                    onClick={() => setCoordinates(null)}
                    className="mt-2 font-semibold underline"
                  >
                    Remove selected location
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No map location selected yet.
                </p>
              )}
            </div>
          </section>

          {/* Photo upload */}
          <section className="border-t border-slate-200 pt-7">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Add a Photo</h2>
              <p className="mt-1 text-sm text-slate-500">
                A photo can help explain the problem. This is optional.
              </p>
            </div>

            <label
              htmlFor="photo"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50/50"
            >
              <span className="text-3xl text-blue-700">↑</span>
              <span className="mt-3 font-semibold text-slate-700">
                Choose an image
              </span>
              <span className="mt-1 text-sm text-slate-500">
                PNG, JPG, or another supported image format · Max 5 MB
              </span>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>

            {photoPreview && (
              <div className="mt-4 rounded-xl border border-slate-200 p-3">
                <img
                  src={photoPreview}
                  alt="Preview of the selected civic issue"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="break-all text-sm text-slate-600">
                    {photo?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(photoPreview);
                      setPhoto(null);
                      setPhotoPreview("");

                      const input = document.getElementById(
                        "photo"
                      ) as HTMLInputElement | null;

                      if (input) input.value = "";
                    }}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Submit and clear */}
          <div className="border-t border-slate-200 pt-6">
            <p className="mb-5 text-sm leading-6 text-slate-500">
              Please submit accurate information. Do not upload photographs
              containing private information unrelated to the civic issue.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClearForm}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Report
              </button>
            </div>

            {message && (
              <p
                role="status"
                className="mt-5 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-800"
              >
                {message}
              </p>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Civic Sathi · One Citizen, One Step, One Nation.
        </p>
      </main>
    </div>
  );
}

export default ReportIssue;
