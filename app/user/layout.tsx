"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ first_name: string; last_name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.removeItem("agf_user");
    } catch (_) { }
    router.push("/login");
  };

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("agf_user") : null;
      if (raw) {
        const data = JSON.parse(raw);
        setUser({
          first_name: data.first_name || "User",
          last_name: data.last_name || "",
        });
      }
    } catch (_) {
      setUser({ first_name: "User", last_name: "" });
    }
  }, []);

  const initials = user
    ? `${(user.first_name || "U")[0]}${(user.last_name || "")[0]}`.toUpperCase() || "U"
    : "U";
  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || "User" : "User";

  return (
    <div className="user-portal">
      <header className="user-header">
        <div className="user-header-inner">
          <Link href="/user" className="user-logo">
            <span className="user-logo-icon">⛽</span>
            <span className="user-logo-text">Automotive Grade Fuel</span>
          </Link>
          <div className="user-header-actions">
            <div
              className="user-profile-wrap"
              onClick={() => setDropdownOpen((o) => !o)}
              role="button"
            >
              <span className="user-avatar">{initials}</span>
              <span className="user-name">{displayName}</span>
              <span className="user-dropdown-arrow">▼</span>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <a href="#" onClick={handleLogout} className="user-dropdown-item">Logout</a>
                </div>
              )}
            </div>
            {dropdownOpen && (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 55 }}
                onClick={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </header>
      <main className="user-main">{children}</main>
    </div>
  );
}
