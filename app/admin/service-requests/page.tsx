"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceRequest = {
  id: number;
  user_id: number | null;
  vehicle_number: string;
  service_type: string;
  status: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
};

export default function AdminServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setServiceRequests(data.serviceRequests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCancelRequest = (id: number) => {
    if (!confirm("Are you sure you want to cancel this service request?")) return;
    setUpdating(id);
    fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data?.error || "Failed to update status");
        // Re-load from server to ensure the change persisted
        loadServiceRequests();
      })
      .catch((err) => alert("Failed to cancel request: " + (err.message || err)))
      .finally(() => setUpdating(null));
  };

  const filteredRequests =
    filterStatus === "All"
      ? serviceRequests
      : serviceRequests.filter((r) => r.status === filterStatus);

  return (
    <div className="admin-dashboard">
      <nav className="admin-breadcrumb">
        <Link href="/admin" className="admin-breadcrumb-link">Dashboard</Link>
        <span className="admin-breadcrumb-sep">/</span>
        <span className="admin-breadcrumb-current">Service Requests</span>
      </nav>
      <div className="admin-dashboard-header">
        <h1>Service Requests</h1>
        <p>View and manage all service requests from all users.</p>
      </div>
      
      <section className="admin-section">
        <div className="admin-section-header">
          <h2>All Service Requests</h2>
          <div className="admin-filter-buttons">
            {["All", "Pending", "Assigned", "In Progress", "Completed", "Cancelled"].map((status) => (
              <button
                key={status}
                type="button"
                className={`admin-filter-btn ${filterStatus === status ? "admin-filter-btn--active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="admin-placeholder">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="admin-placeholder">No service requests found</p>
        ) : (
          <div className="admin-requests-grid">
            {filteredRequests.map((req) => (
              <div key={req.id} className="admin-request-card">
                <div className="admin-request-header">
                  <div>
                    <p className="admin-request-vehicle">{req.vehicle_number}</p>
                    <p className="admin-request-user">
                      {req.first_name && req.last_name ? `${req.first_name} ${req.last_name}` : "Anonymous"}
                    </p>
                  </div>
                  <span className={`admin-request-status admin-request-status--${req.status.toLowerCase().replace(" ", "-")}`}>
                    {req.status}
                  </span>
                </div>
                <div className="admin-request-meta">
                  <span>{req.service_type}</span>
                  <span>
                    {(() => {
                      const d = new Date(req.created_at);
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = String(d.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    })()}
                  </span>
                </div>
                {req.status !== "Completed" && req.status !== "Cancelled" && (
                  <button
                    type="button"
                    className="admin-request-cancel-btn"
                    onClick={() => handleCancelRequest(req.id)}
                    disabled={updating === req.id}
                  >
                    {updating === req.id ? "Cancelling..." : "Cancel Request"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
