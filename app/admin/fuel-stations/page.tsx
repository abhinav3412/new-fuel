"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type FuelStation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at?: string;
};

export default function AdminFuelStationsPage() {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/fuel-stations");
      const data = await res.json();
      setStations(Array.isArray(data) ? data : []);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Station name is required";
    if (!form.latitude || Number.isNaN(Number(form.latitude))) {
      err.latitude = "Valid latitude is required";
    } else {
      const lat = Number(form.latitude);
      if (lat < -90 || lat > 90) err.latitude = "Latitude must be between -90 and 90";
    }
    if (!form.longitude || Number.isNaN(Number(form.longitude))) {
      err.longitude = "Valid longitude is required";
    } else {
      const lng = Number(form.longitude);
      if (lng < -180 || lng > 180) err.longitude = "Longitude must be between -180 and 180";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/fuel-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ submit: data.error || "Failed to add station" });
        return;
      }

      setForm({ name: "", latitude: "", longitude: "" });
      setErrors({});
      setFormOpen(false);
      fetchStations();
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this station?")) return;

    try {
      const res = await fetch(`/api/fuel-stations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchStations();
      }
    } catch {
      alert("Failed to delete station");
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-breadcrumb">
        <Link href="/admin" className="admin-breadcrumb-link">Dashboard</Link>
        <span className="admin-breadcrumb-sep">/</span>
        <span className="admin-breadcrumb-current">Fuel Stations</span>
      </nav>
      <div className="admin-dashboard-header">
        <h1>Fuel Stations</h1>
        <p>Manage fuel stations, stock levels, and locations.</p>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Fuel Stations</h2>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setFormOpen(!formOpen)}
          >
            {formOpen ? "Cancel" : "+ Add Station"}
          </button>
        </div>

        {formOpen && (
          <form className="admin-station-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="station-name">Station Name *</label>
                <input
                  id="station-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. City Center Station"
                  required
                />
                {errors.name && <span className="admin-form-error">{errors.name}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="station-lat">Latitude *</label>
                <input
                  id="station-lat"
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="e.g. 19.0760"
                  required
                />
                {errors.latitude && <span className="admin-form-error">{errors.latitude}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="station-lng">Longitude *</label>
                <input
                  id="station-lng"
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="e.g. 72.8777"
                  required
                />
                {errors.longitude && <span className="admin-form-error">{errors.longitude}</span>}
              </div>
            </div>

            {errors.submit && <p className="admin-form-error admin-form-error-block">{errors.submit}</p>}

            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? "Adding..." : "Add Station"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="admin-placeholder">Loading...</p>
        ) : stations.length === 0 ? (
          <p className="admin-placeholder">No fuel stations yet. Add one to get started!</p>
        ) : (
          <div className="admin-stations-table">
            <table>
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => (
                  <tr key={station.id}>
                    <td className="admin-station-name">⛽ {station.name}</td>
                    <td>{station.latitude.toFixed(4)}</td>
                    <td>{station.longitude.toFixed(4)}</td>
                    <td>
                      {station.created_at
                        ? (() => {
                            const d = new Date(station.created_at);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = String(d.getFullYear()).slice(-2);
                            return `${day}/${month}/${year}`;
                          })()
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(station.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
