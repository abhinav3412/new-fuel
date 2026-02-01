"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const UserMap = dynamic(() => import("./UserMap"), { ssr: false });

type Worker = { id: number; first_name: string; last_name: string; status: string };

type ServiceRequest = {
  id: number;
  user_id: number | null;
  vehicle_number: string;
  driving_licence: string;
  phone_number: string;
  service_type: string;
  amount: number;
  status: string;
  created_at: string;
};

  const ACTIVE_STATUSES = ["Pending", "Assigned", "In Progress"];
  const HISTORY_STATUSES = ["Completed", "Cancelled"];

const SERVICE_OPTIONS = [
  { value: "petrol", label: "Petrol", amount: 100 },
  { value: "diesel", label: "Diesel", amount: 150 },
  { value: "crane", label: "Crane", amount: 200 },
  { value: "mechanic_bike", label: "Mechanic (Bike)", amount: 300 },
  { value: "mechanic_car", label: "Mechanic (Car)", amount: 300 },
] as const;

export default function UserDashboardPage() {
  const [user, setUser] = useState<{ first_name: string; id?: number; phone_number?: string } | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [summaryTab, setSummaryTab] = useState<"Overview" | "Active Requests" | "History">("Overview");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    vehicle_number: "",
    driving_licence: "",
    phone_number: "",
    service_type: "",
  });
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(false);

  const fetchServiceRequests = useCallback(async () => {
    setServiceRequestsLoading(true);
    try {
      const url =
        user?.id != null && !Number.isNaN(Number(user.id))
          ? `/api/service-requests?user_id=${user.id}`
          : "/api/service-requests";
      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];
      setServiceRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setServiceRequests([]);
    } finally {
      setServiceRequestsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("agf_user") : null;
      if (raw) {
        const data = JSON.parse(raw);
        setUser({
          first_name: data.first_name || "User",
          id: data.id != null ? Number(data.id) : undefined,
          phone_number: data.phone_number || "",
        });
      }
    } catch (_) {
      setUser({ first_name: "User" });
    }
  }, []);

  useEffect(() => {
    fetchServiceRequests();
  }, [fetchServiceRequests]);

  // Poll for service request updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServiceRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchServiceRequests]);

  const openRequestModal = () => {
    setRequestModalOpen(true);
    setRequestForm({
      vehicle_number: "",
      driving_licence: "",
      phone_number: user?.phone_number ?? "",
      service_type: "",
    });
    setRequestErrors({});
    setRequestSuccess(null);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setRequestSubmitting(false);
  };

  const validateRequestForm = (): boolean => {
    const err: Record<string, string> = {};
    if (!requestForm.vehicle_number.trim()) err.vehicle_number = "Vehicle number is required";
    if (!requestForm.driving_licence.trim()) err.driving_licence = "Driving licence is required";
    if (!requestForm.phone_number.trim()) err.phone_number = "Phone number is required";
    if (!requestForm.service_type) err.service_type = "Service type is required";
    setRequestErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequestForm() || requestSubmitting) return;
    setRequestSubmitting(true);
    setRequestErrors({});
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id ?? null,
          vehicle_number: requestForm.vehicle_number.trim(),
          driving_licence: requestForm.driving_licence.trim(),
          phone_number: requestForm.phone_number.trim(),
          service_type: requestForm.service_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRequestErrors({ submit: data.error || "Failed to create request" });
        return;
      }
      const option = SERVICE_OPTIONS.find((o) => o.value === requestForm.service_type);
      setRequestSuccess(
        `Request created successfully. Amount to pay: ₹${option?.amount ?? data.amount}.`
      );
      setRequestForm({ vehicle_number: "", driving_licence: "", phone_number: "", service_type: "" });
      fetchServiceRequests();
      setTimeout(() => {
        closeRequestModal();
      }, 2000);
    } catch {
      setRequestErrors({ submit: "Network error. Please try again." });
    } finally {
      setRequestSubmitting(false);
    }
  };

  useEffect(() => {
    fetch("/api/workers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setWorkers(Array.isArray(data) ? data : []))
      .catch(() => setWorkers([]))
      .finally(() => setWorkersLoading(false));
  }, []);

  const firstName = user?.first_name || "User";

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-breadcrumb">/user-dashboard</div>

      <section className="user-welcome-section">
        <div className="user-welcome-logo">AGF</div>
        <h1 className="user-welcome-title">Welcome back, {firstName}!</h1>
        <p className="user-welcome-subtitle">
          Manage your service requests and track assistance in real-time.
        </p>
      </section>

      {/* Live Tracking */}
      <section className="user-section user-map-section">
        <div className="user-section-header">
          <div>
            <h2 className="user-section-title">Live Tracking</h2>
            <p className="user-section-subtitle">Track your service workers in real-time.</p>
          </div>
          <div className="user-map-controls">
            <span className="user-live-pill">
              <span className="user-live-dot" /> Live Updates
            </span>
            <a href="#" className="user-link">View larger map</a>
          </div>
        </div>
        <div className="user-map-layout">
          <div className="user-map-container">
            <UserMap />
            <div className="user-map-legend">
              <span><span className="user-legend-dot user-legend-workers" /> Workers</span>
              <span><span className="user-legend-dot user-legend-you" /> Your Location</span>
            </div>
          </div>
          <div className="user-workers-panel">
            <h3>Active Workers ({workers.length})</h3>
            {workersLoading ? (
              <p className="user-workers-loading">Loading…</p>
            ) : workers.length === 0 ? (
              <p className="user-workers-empty">No active workers</p>
            ) : (
              <ul className="user-workers-list">
                {workers.map((w) => (
                  <li key={w.id} className="user-worker-item">
                    <span className="user-worker-dot" />
                    <div>
                      <span className="user-worker-name">{w.first_name} {w.last_name}</span>
                      <span className="user-worker-status">{w.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="user-actions">
        <button
          type="button"
          className="user-action-card user-action-primary"
          onClick={openRequestModal}
        >
          <span className="user-action-icon">+</span>
          <span className="user-action-title">Request Service</span>
          <span className="user-action-desc">Create a request</span>
        </button>
        <Link href="#" className="user-action-card">
          <span className="user-action-icon">◎</span>
          <span className="user-action-title">Track Service</span>
          <span className="user-action-desc">Live location</span>
        </Link>
        <Link href="#" className="user-action-card">
          <span className="user-action-icon">🕐</span>
          <span className="user-action-title">History</span>
          <span className="user-action-desc">Past services</span>
        </Link>
        <Link href="#" className="user-action-card">
          <span className="user-action-icon">🎧</span>
          <span className="user-action-title">Support</span>
          <span className="user-action-desc">Get help</span>
        </Link>
      </section>

      {/* Create Request Modal */}
      {requestModalOpen && (
        <div className="user-request-modal-overlay" onClick={closeRequestModal} role="presentation">
          <div
            className="user-request-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="request-modal-title"
          >
            <h2 id="request-modal-title" className="user-request-modal-title">
              Create a Request
            </h2>
            <p className="user-request-modal-desc">All fields are required.</p>
            {requestSuccess ? (
              <p className="user-request-success">{requestSuccess}</p>
            ) : (
              <form className="user-request-form" onSubmit={handleRequestSubmit} noValidate>
                <div className="user-request-field">
                  <label htmlFor="request-vehicle">Vehicle number *</label>
                  <input
                    id="request-vehicle"
                    type="text"
                    value={requestForm.vehicle_number}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, vehicle_number: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. MH12AB1234"
                    required
                    autoComplete="off"
                  />
                  {requestErrors.vehicle_number && (
                    <span className="user-request-error">{requestErrors.vehicle_number}</span>
                  )}
                </div>
                <div className="user-request-field">
                  <label htmlFor="request-licence">Driving licence *</label>
                  <input
                    id="request-licence"
                    type="text"
                    value={requestForm.driving_licence}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, driving_licence: e.target.value.toUpperCase() }))
                    }
                    placeholder="Licence number"
                    required
                    autoComplete="off"
                  />
                  {requestErrors.driving_licence && (
                    <span className="user-request-error">{requestErrors.driving_licence}</span>
                  )}
                </div>
                <div className="user-request-field">
                  <label htmlFor="request-phone">Phone number *</label>
                  <input
                    id="request-phone"
                    type="tel"
                    value={requestForm.phone_number}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, phone_number: e.target.value }))
                    }
                    placeholder="e.g. 9876543210"
                    required
                    autoComplete="tel"
                  />
                  {requestErrors.phone_number && (
                    <span className="user-request-error">{requestErrors.phone_number}</span>
                  )}
                </div>
                <div className="user-request-field">
                  <label htmlFor="request-service">Service type *</label>
                  <select
                    id="request-service"
                    value={requestForm.service_type}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, service_type: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select service type</option>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — ₹{opt.amount}
                      </option>
                    ))}
                  </select>
                  {requestErrors.service_type && (
                    <span className="user-request-error">{requestErrors.service_type}</span>
                  )}
                </div>
                {requestErrors.submit && (
                  <p className="user-request-error user-request-error-block">{requestErrors.submit}</p>
                )}
                <div className="user-request-actions">
                  <button type="button" className="user-request-btn user-request-btn-secondary" onClick={closeRequestModal}>
                    Cancel
                  </button>
                  <button type="submit" className="user-request-btn user-request-btn-primary" disabled={requestSubmitting}>
                    {requestSubmitting ? "Creating…" : "Create Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Summary */}
      <section className="user-summary-section">
        <nav className="user-summary-tabs">
          <button
            type="button"
            className={`user-summary-tab ${summaryTab === "Overview" ? "user-summary-tab--active" : ""}`}
            onClick={() => setSummaryTab("Overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`user-summary-tab ${summaryTab === "Active Requests" ? "user-summary-tab--active" : ""}`}
            onClick={() => setSummaryTab("Active Requests")}
          >
            Active Requests
          </button>
          <button
            type="button"
            className={`user-summary-tab ${summaryTab === "History" ? "user-summary-tab--active" : ""}`}
            onClick={() => setSummaryTab("History")}
          >
            History
          </button>
        </nav>
        <div className="user-summary-content">
          {summaryTab === "Overview" && (
            <div className="user-summary-overview">
              <div className="user-summary-card">
                <span className="user-summary-label">Active Requests</span>
                <span className="user-summary-value">
                  {serviceRequestsLoading ? "…" : serviceRequests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length}
                </span>
              </div>
              <div className="user-summary-card">
                <span className="user-summary-label">Total Spent</span>
                <span className="user-summary-value">
                  ₹{serviceRequestsLoading ? "…" : serviceRequests.filter((r) => r.status === "Completed").reduce((sum, r) => sum + r.amount, 0)}
                </span>
              </div>
            </div>
          )}
          {summaryTab === "Active Requests" && (
            <>
              {serviceRequestsLoading ? (
                <p className="user-summary-placeholder">Loading…</p>
              ) : serviceRequests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length === 0 ? (
                <p className="user-summary-placeholder">No active requests at the moment.</p>
              ) : (
                <ul className="user-active-requests-list">
                  {serviceRequests
                    .filter((r) => ACTIVE_STATUSES.includes(r.status))
                    .map((req) => (
                      <li key={req.id} className="user-active-request-item">
                        <div className="user-active-request-row">
                          <span className="user-active-request-vehicle">{req.vehicle_number}</span>
                          <span className={`user-active-request-status user-active-request-status--${req.status.toLowerCase().replace(" ", "-")}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="user-active-request-meta">
                          {SERVICE_OPTIONS.find((o) => o.value === req.service_type)?.label ?? req.service_type} · ₹{req.amount}
                          {" · "}
                          {(() => {
                            const d = new Date(req.created_at);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = String(d.getFullYear()).slice(-2);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const mins = String(d.getMinutes()).padStart(2, "0");
                            return `${day}/${month}/${year} ${hours}:${mins}`;
                          })()}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
          {summaryTab === "History" && (
            <>
              {serviceRequestsLoading ? (
                <p className="user-summary-placeholder">Loading…</p>
              ) : serviceRequests.filter((r) => HISTORY_STATUSES.includes(r.status)).length === 0 ? (
                <p className="user-summary-placeholder">No history yet.</p>
              ) : (
                <ul className="user-history-list">
                  {serviceRequests
                    .filter((r) => HISTORY_STATUSES.includes(r.status))
                    .map((req) => (
                      <li key={req.id} className="user-history-item">
                        <div className="user-history-row">
                          <span className="user-history-vehicle">{req.vehicle_number}</span>
                          <span className={`user-history-status user-history-status--${req.status.toLowerCase().replace(" ", "-")}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="user-history-meta">
                          {SERVICE_OPTIONS.find((o) => o.value === req.service_type)?.label ?? req.service_type} · ₹{req.amount}
                          {" · "}
                          {(() => {
                            const d = new Date(req.created_at);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = String(d.getFullYear()).slice(-2);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const mins = String(d.getMinutes()).padStart(2, "0");
                            return `${day}/${month}/${year} ${hours}:${mins}`;
                          })()}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

    </div>
  );
}
