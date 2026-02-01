"use client";

import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("../admin/AdminMap"), { ssr: false });

export default function WorkerPage() {
  return (
    <div className="worker-page">
      <div className="worker-page-header">
        <h1 className="worker-page-title">Worker Dashboard</h1>
        <p className="worker-page-subtitle">
          Track your location and view nearby fuel stations in real-time.
        </p>
      </div>

      <section className="worker-map-section">
        <div className="worker-map-header">
          <h2>Live Map</h2>
          <p>Your location and nearby fuel stations</p>
        </div>
        <div className="worker-map-container">
          <AdminMap
            popupLabel="Your location (Worker)"
            mapClassName="admin-leaflet-map"
            wrapClassName="admin-leaflet-wrap"
          />
        </div>
      </section>
    </div>
  );
}
