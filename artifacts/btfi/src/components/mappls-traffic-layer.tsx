import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { mapplsTrafficUrl, MAPPLS_ATTRIBUTION } from "@/lib/map-tiles";

export function MapplsTrafficLayer() {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapplsTrafficUrl) return;

    const layer = L.tileLayer(mapplsTrafficUrl, {
      opacity: 0.75,
      attribution: MAPPLS_ATTRIBUTION,
    });

    let errorCount = 0;
    layer.on("tileerror", () => {
      errorCount++;
      if (errorCount >= 3 && layerRef.current) {
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
  }, [map]);

  return null;
}
