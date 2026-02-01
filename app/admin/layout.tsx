"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-logo">
            <span className="admin-logo-icon">⛽</span>
            <span className="admin-logo-text">AGF Admin</span>
          </Link>
          <div className="admin-header-actions">
            <div className="admin-user">
              <span className="admin-avatar">AD</span>
              <span className="admin-name">Admin</span>
            </div>
            <Link href="/login" className="admin-logout-btn">
              Logout
            </Link>
          </div>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
