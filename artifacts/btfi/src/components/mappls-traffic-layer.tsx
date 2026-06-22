import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useMapplsTileUrl } from "@/hooks/use-mappls-token";
import { MAPPLS_ATTRIBUTION } from "@/lib/map-tiles";

/**
 * Adds the Mappls live traffic PNG tile overlay to any React Leaflet MapContainer.
 *
 * Auth resolution order (automatic, no props needed):
 *   1. VITE_MAPPLS_REST_KEY set at build time → tile URL used directly
 *   2. Backend /api/mappls/token returns an OAuth token → tile URL built from token
 *   3. Neither configured → component renders nothing (CARTO base map stays)
 */
export function MapplsTrafficLayer() {
  const map = useMap();
  const tileUrl = useMapplsTileUrl();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!tileUrl) return;

    // Remove any previous layer before adding a new one (url may change on token refresh)
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const layer = L.tileLayer(tileUrl, {
      opacity: 0.80,
      attribution: MAPPLS_ATTRIBUTION,
      maxZoom: 18,
    });

    let errorCount = 0;
    layer.on("tileerror", () => {
      errorCount++;
      if (errorCount >= 4 && layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, tileUrl]);

  return null;
}
