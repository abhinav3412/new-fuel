"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("agf_user") : null;
      if (raw) {
        const data = JSON.parse(raw);
        setUser({
          first_name: data.first_name || "Worker",
          last_name: data.last_name || "",
        });
      }
    } catch (_) {
      setUser({ first_name: "Worker", last_name: "" });
    }
  }, []);

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || "Worker" : "Worker";
  const initials = user
    ? `${(user.first_name || "W")[0]}${(user.last_name || "")[0]}`.toUpperCase() || "W"
    : "W";

  return (
    <div className="worker-portal">
      <header className="worker-header">
        <div className="worker-header-inner">
          <Link href="/worker" className="worker-logo">
            <span className="worker-logo-icon">⛽</span>
            <span className="worker-logo-text">AGF Worker</span>
          </Link>
          <div className="worker-header-actions">
            <span className="worker-avatar">{initials}</span>
            <span className="worker-name">{displayName}</span>
            <Link href="/login" className="worker-logout-btn">Logout</Link>
          </div>
        </div>
      </header>
      <main className="worker-main">{children}</main>
    </div>
  );
}
