import type { Metadata } from "next";
import "./globals.css";
import RedirectToLocalhost from "./RedirectToLocalhost";
import LocationPrompt from "./LocationPrompt";

export const metadata: Metadata = {
  title: "Login App",
  description: "Simple Next.js login and dashboard example"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RedirectToLocalhost />
        <LocationPrompt />
        {children}
      </body>
    </html>
  );
}

