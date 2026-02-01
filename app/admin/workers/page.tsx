"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Worker = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: string;
  created_at: string;
};

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    status: "Available",
    new_password: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadWorkers = () => {
    fetch("/api/admin/workers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load workers");
        return res.json();
      })
      .then((data) => setWorkers(data))
      .catch((err) => setError(err.message || "Could not load workers."));
  };

  useEffect(() => {
    loadWorkers();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    loadWorkers();
  }, [loading]);

  const formatDate = (raw: string | undefined) => {
    if (!raw) return "—";
    try {
      const d = new Date(raw.trim().replace(" ", "T"));
      if (Number.isNaN(d.getTime())) return "—";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return raw;
    }
  };

  const openEdit = (w: Worker) => {
    setEditWorker(w);
    setEditForm({
      first_name: w.first_name,
      last_name: w.last_name,
      email: w.email,
      phone_number: w.phone_number,
      status: w.status,
      new_password: "",
    });
    setEditError(null);
  };

  const closeEdit = () => {
    setEditWorker(null);
    setEditError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorker) return;
    setEditSaving(true);
    setEditError(null);
    const { new_password, ...payload } = editForm;
    fetch(`/api/admin/workers/${editWorker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(new_password ? { ...payload, new_password } : payload),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data?.error || "Update failed");
        loadWorkers();
        closeEdit();
      })
      .catch((err) => setEditError(err.message || "Failed to update"))
      .finally(() => setEditSaving(false));
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm == null) return;
    fetch(`/api/admin/workers/${deleteConfirm}`, { method: "DELETE" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data?.error || "Delete failed");
        setWorkers((prev) => prev.filter((w) => w.id !== deleteConfirm));
        setDeleteConfirm(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to delete");
        setDeleteConfirm(null);
      });
  };

  const statusClass = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "available") return "admin-status-badge--available";
    if (s === "busy") return "admin-status-badge--busy";
    if (s === "offline") return "admin-status-badge--offline";
    return "admin-status-badge--available";
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-breadcrumb">
        <Link href="/admin" className="admin-breadcrumb-link">Dashboard</Link>
        <span className="admin-breadcrumb-sep">/</span>
        <span className="admin-breadcrumb-current">Workers</span>
      </nav>
      <div className="admin-dashboard-header">
        <h1>Workers</h1>
        <p>Manage workers and their status.</p>
      </div>
      <section className="admin-section">
        {loading && <p className="admin-loading">Loading workers...</p>}
        {error && <p className="admin-table-error">{error}</p>}
        {!loading && workers.length === 0 && !error && (
          <p className="admin-table-empty">No workers yet. Workers will appear here when added.</p>
        )}
        {!loading && workers.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{w.first_name} {w.last_name}</td>
                    <td>{w.email}</td>
                    <td>{w.phone_number}</td>
                    <td>
                      <span className={`admin-status-badge ${statusClass(w.status)}`}>{w.status}</span>
                    </td>
                    <td>{formatDate(w.created_at)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-btn-edit" onClick={() => openEdit(w)}>Edit</button>
                        {deleteConfirm === w.id ? (
                          <>
                            <button type="button" className="admin-btn-confirm" onClick={confirmDelete}>Confirm</button>
                            <button type="button" className="admin-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                          </>
                        ) : (
                          <button type="button" className="admin-btn-delete" onClick={() => handleDelete(w.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editWorker && (
        <div className="admin-modal-overlay" onClick={closeEdit}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit worker</h2>
            <form onSubmit={handleEditSubmit} className="admin-modal-form">
              <div className="admin-modal-row">
                <label>First name</label>
                <input
                  value={editForm.first_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-modal-row">
                <label>Last name</label>
                <input
                  value={editForm.last_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-modal-row">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-modal-row">
                <label>Phone</label>
                <input
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone_number: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-modal-row">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="admin-modal-row">
                <label>New password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={editForm.new_password}
                  onChange={(e) => setEditForm((p) => ({ ...p, new_password: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              {editError && <p className="admin-table-error">{editError}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="admin-btn-save" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
