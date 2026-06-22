import { useState, useEffect } from "react";
import { mapplsTrafficUrl, buildMapplsTrafficUrl } from "@/lib/map-tiles";

/**
 * Resolves the best available Mappls tile URL:
 * 1. Static build-time key (VITE_MAPPLS_REST_KEY) — no fetch needed.
 * 2. OAuth token from backend /api/mappls/token — keeps client secret server-side.
 * 3. null — Mappls not configured; caller falls back to CARTO tiles.
 */
export function useMapplsTileUrl(): string | null {
  const [tileUrl, setTileUrl] = useState<string | null>(mapplsTrafficUrl);

  useEffect(() => {
    // Already have a static key — no need to fetch
    if (mapplsTrafficUrl) return;

    const base = import.meta.env.BASE_URL as string;
    const url = `${base}api/mappls/token`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { token?: string }) => {
        if (data.token) {
          setTileUrl(buildMapplsTrafficUrl(data.token));
        }
      })
      .catch(() => {
        // Silently fall back — Mappls not configured
      });
  }, []);

  return tileUrl;
}
