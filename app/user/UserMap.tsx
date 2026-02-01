"use client";

import AdminMap from "../admin/AdminMap";

export default function UserMap() {
  return (
    <AdminMap
      popupLabel="Your location"
      mapClassName="admin-leaflet-map"
      wrapClassName="admin-leaflet-wrap"
    />
  );
}
