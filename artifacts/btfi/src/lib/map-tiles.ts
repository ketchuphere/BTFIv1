const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_STATIC_KEY as string | undefined;

export const CARTO_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const hasMapplsKey = Boolean(MAPPLS_KEY);

export const MAPPLS_ATTRIBUTION =
  '&copy; <a href="https://www.mappls.com/">Mappls</a> traffic layer';

export const mapplsTrafficUrl = MAPPLS_KEY
  ? `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_KEY}/traffic_png/{z}/{x}/{y}.png`
  : null;
