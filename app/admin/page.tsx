"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const AdminMap = dynamic(() => import("./AdminMap"), { ssr: false });

type ActivityItem = {
  type: string;
  message: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
};

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

type Stats = {
  totalUsers: number;
  totalWorkers: number;
  activeWorkers: number;
  activeRequests: number;
  recentUsers: { id: number; email: string; first_name: string; last_name: string; created_at?: string }[];
  recentActivity?: ActivityItem[];
  activeWorkersList: { id: number; first_name: string; last_name: string; status: string }[];
  serviceRequests?: ServiceRequest[];
};

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [activityDate, setActivityDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  useEffect(() => {
    const url = activityDate ? `/api/admin/stats?date=${activityDate}` : "/api/admin/stats";
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activityDate]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage all platform operations.</p>
        </div>
        <p className="admin-loading">Loading...</p>
      </div>
    );
  }

  const s = stats ?? {
    totalUsers: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    activeRequests: 0,
    recentUsers: [],
    recentActivity: [],
    activeWorkersList: [],
  };

  const formatActivityTime = (raw: string | undefined) => {
    if (!raw) return "—";
    try {
      // API returns server local time as "YYYY-MM-DD HH:MM:SS". Parse as local so the displayed time matches when the action happened (e.g. 10 PM).
      const s = raw.trim().replace(" ", "T");
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return "—";
      // Format as dd/mm/yy (e.g. 30/01/26)
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  const activityIcon = (type: string) => {
    if (type === "user_registered") return "👤";
    if (type === "worker_created") return "🛠️";
    if (type === "worker_deleted") return "🗑️";
    if (type === "user_deleted") return "🗑️";
    if (type === "user_updated") return "✏️";
    if (type === "worker_updated") return "✏️";
    if (type === "fuel_station_added") return "⛽";
    if (type === "fuel_station_deleted") return "🗑️";
    return "•";
    return "•";
  };

  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const monthYear = calendarMonth.getFullYear();
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const lastOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  const startPad = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();
  const prevMonth = () => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  const calendarDays: (number | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage all platform operations.</p>
      </div>

      {/* Live Operations Map */}
      <section className="admin-section admin-map-section">
        <div className="admin-section-header">
          <div>
            <h2>Live Operations Map</h2>
            <p>Real-time tracking of all active workers and service requests.</p>
          </div>
          <div className="admin-map-controls">
            <span className="admin-pill">• {s.activeWorkers} Workers Active</span>
            <button type="button" className="admin-btn admin-btn-secondary">
              Refresh
            </button>
          </div>
        </div>
        <div className="admin-map-layout">
          <div className="admin-map-container">
            <AdminMap />
          </div>
          <div className="admin-workers-panel">
            <h3>Active Workers ({s.activeWorkersList.length})</h3>
            <ul className="admin-workers-list">
              {s.activeWorkersList.length === 0 ? (
                <li className="admin-worker-item">No workers yet</li>
              ) : (
                s.activeWorkersList.map((w) => (
                  <li key={w.id} className="admin-worker-item">
                    <span className="admin-worker-dot" />
                    <span>
                      {w.first_name} {w.last_name}
                    </span>
                    <span className="admin-worker-meta">{w.status}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="admin-kpis">
        <div className="admin-kpi-card">
          <span className="admin-kpi-label">Total Users</span>
          <span className="admin-kpi-value">{s.totalUsers.toLocaleString()}</span>
          <span className="admin-kpi-meta">registered</span>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-label">Active Workers</span>
          <span className="admin-kpi-value">{s.activeWorkers}</span>
          <span className="admin-kpi-meta">of {s.totalWorkers} total</span>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-label">Active Requests</span>
          <span className="admin-kpi-value">{s.activeRequests}</span>
          <span className="admin-kpi-meta">—</span>
        </div>
      </section>

      {/* Tabs */}
      <nav className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === "Overview" ? "admin-tab--active" : ""}`}
          onClick={() => setActiveTab("Overview")}
        >
          Overview
        </button>
        <Link href="/admin/workers" className={`admin-tab ${activeTab === "Workers" ? "admin-tab--active" : ""}`}>
          Workers
        </Link>
        <Link href="/admin/users" className={`admin-tab ${activeTab === "Users" ? "admin-tab--active" : ""}`}>
          Users
        </Link>
        <Link href="/admin/service-requests" className={`admin-tab ${activeTab === "Service Requests" ? "admin-tab--active" : ""}`}>
          Service Requests
        </Link>
        <Link href="/admin/fuel-stations" className={`admin-tab ${activeTab === "Fuel Stations" ? "admin-tab--active" : ""}`}>
          Fuel Stations
        </Link>
      </nav>

      {/* Recent Activity */}
      <section className="admin-section">
        <div className="admin-activity-header">
          <h2>Recent Activity</h2>
          {activityDate && (
            <button type="button" className="admin-btn admin-btn-secondary admin-activity-show-all" onClick={() => setActivityDate(null)}>
              Show all recent
            </button>
          )}
        </div>
        <div className="admin-activity-with-calendar">
          <div className="admin-activity-calendar">
            <div className="admin-calendar-nav">
              <button type="button" className="admin-calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">
                ‹
              </button>
              <span className="admin-calendar-title">
                {monthName} {monthYear}
              </span>
              <button type="button" className="admin-calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
                ›
              </button>
            </div>
            <div className="admin-calendar-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
            <div className="admin-calendar-grid">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`pad-${idx}`} className="admin-calendar-day admin-calendar-day--empty" />;
                const dateStr = toYMD(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                const isSelected = activityDate === dateStr;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`admin-calendar-day ${isSelected ? "admin-calendar-day--selected" : ""}`}
                    onClick={() => setActivityDate(dateStr)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {activityDate && (
              <p className="admin-calendar-selected-label">
                Showing activity for {[activityDate.slice(8, 10), Number(activityDate.slice(5, 7)), activityDate.slice(2, 4)].join("/")}
              </p>
            )}
          </div>
          <div className="admin-activity-list-wrap">
            {activityDate && (
              <p className="admin-activity-date-label">
                Activity for {[activityDate.slice(8, 10), Number(activityDate.slice(5, 7)), activityDate.slice(2, 4)].join("/")}
              </p>
            )}
            <ul className="admin-activity-list">
              {(!s.recentActivity || s.recentActivity.length === 0) ? (
                <li className="admin-activity-item">No recent activity</li>
              ) : (
                s.recentActivity.map((item, i) => (
                  <li key={`${item.type}-${item.created_at}-${i}`} className="admin-activity-item">
                    <span className="admin-activity-icon">{activityIcon(item.type)}</span>
                    <span>
                      {item.type === "user_registered" && <strong>New user registered: </strong>}
                      {item.type === "worker_created" && <strong>Worker joined: </strong>}
                      {item.type === "worker_deleted" && <strong>Worker removed: </strong>}
                      {item.type === "user_deleted" && <strong>User removed: </strong>}
                      {item.type === "user_updated" && <strong>User updated: </strong>}
                      {item.type === "worker_updated" && <strong>Worker updated: </strong>}
                      {item.type === "fuel_station_added" && <strong>Fuel station added: </strong>}
                      {item.type === "fuel_station_deleted" && <strong>Fuel station deleted: </strong>}
                      {item.message}
                    </span>
                    <span className="admin-activity-time">{formatActivityTime(item.created_at)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
