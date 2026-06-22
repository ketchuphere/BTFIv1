// Support both the new key name and the legacy alias
const MAPPLS_STATIC_KEY =
  (import.meta.env.VITE_MAPPLS_REST_KEY as string | undefined) ||
  (import.meta.env.VITE_MAPPLS_STATIC_KEY as string | undefined);

export const CARTO_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const MAPPLS_ATTRIBUTION =
  '&copy; <a href="https://www.mappls.com/">Mappls</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors';

export const hasMapplsStaticKey = Boolean(MAPPLS_STATIC_KEY);

/** Build a Mappls traffic PNG tile URL from a REST key or OAuth access token. */
export function buildMapplsTrafficUrl(keyOrToken: string): string {
  return `https://apis.mappls.com/advancedmaps/v1/${keyOrToken}/traffic_png/{z}/{x}/{y}.png`;
}

/** Static key tile URL — non-null only when VITE_MAPPLS_REST_KEY is set at build time. */
export const mapplsTrafficUrl = MAPPLS_STATIC_KEY
  ? buildMapplsTrafficUrl(MAPPLS_STATIC_KEY)
  : null;
