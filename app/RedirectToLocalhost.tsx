"use client";

import { useEffect } from "react";

export default function RedirectToLocalhost() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocalhost) {
      const port = window.location.port || "3000";
      const url = `http://localhost:${port}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(url);
    }
  }, []);

  return null;
}
