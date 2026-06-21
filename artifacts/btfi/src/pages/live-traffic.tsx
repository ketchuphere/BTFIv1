import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import { CARTO_TILE_URL, CARTO_ATTRIBUTION } from "@/lib/map-tiles";
import { MapplsTrafficLayer } from "@/components/mappls-traffic-layer";
import L from "leaflet";
import { Thermometer, AlertCircle, Users, Video, Navigation, Activity, MapPin, Zap } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const LAYERS = [
  { id: "heat", label: "Traffic Heat Layer", icon: Thermometer },
  { id: "incidents", label: "Incidents", icon: AlertCircle },
  { id: "officers", label: "Officers (BTP Squad)", icon: Users },
  { id: "cctv", label: "CCTV Streams", icon: Video },
  { id: "diversions", label: "Active Diversions", icon: Navigation },
];

const BLOCKED_ROUTE: [number, number][] = [
  [12.9758, 77.6094], [12.9720, 77.6050], [12.9680, 77.6020],
];
const DIVERSION_ROUTE: [number, number][] = [
  [12.9758, 77.6094], [12.9800, 77.6120], [12.9840, 77.6060], [12.9680, 77.6020],
];

export default function LiveTraffic() {
  const [activeLayers, setActiveLayers] = useState(new Set(["heat", "incidents"]));

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Live Map Inspect Workspace</h1>
        <p className="text-sm text-gray-500 mt-0.5">Full-stage command terminal for CCTV streams and patrol car telemetry.</p>
      </div>

      {/* Map + Telemetry */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Live Traffic Operational GIS (Bangalore Core)</div>
              <div className="text-[11px] text-gray-500">Use map elements to track active incidents, BTP deployments, and live camera feeds.</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 text-lg font-light">+</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 text-lg font-light">-</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">
                <Activity className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map info bar */}
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 font-mono">
            BTP OPS SECTION GRID // BOUNDS: 12.82N – 13.06N &nbsp;&nbsp; MAP PROVIDER: OPENSTREETMAP LIVE GIS
          </div>

          <div className="relative" style={{ height: "460px" }}>
            <MapContainer
              center={[12.9716, 77.5946]} zoom={13}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer url={CARTO_TILE_URL} attribution={CARTO_ATTRIBUTION} />
              <MapplsTrafficLayer />

              {activeLayers.has("incidents") && (
                <>
                  <Marker position={[12.9758, 77.6094]} icon={redIcon}>
                    <Popup maxWidth={280}>
                      <div className="text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">CRITICAL RALLY</span>
                          <span className="text-gray-500">Impact: 92/100</span>
                        </div>
                        <div className="font-bold text-gray-900 mb-1">Political Assembly & Rally</div>
                        <div className="text-gray-500 mb-2">MG Road (Junction near Metro Station)</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
                          <div><span className="text-gray-400">VEHICLES</span><br/><span className="font-bold">5800</span></div>
                          <div><span className="text-gray-400">PRED. DELAY</span><br/><span className="font-bold">34 min</span></div>
                          <div><span className="text-red-500 font-bold">STATUS</span><br/><span className="text-red-600 font-bold">Critical</span></div>
                          <div><span className="text-gray-400">BTP UNITS</span><br/><span className="font-bold">12 Active</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={[12.9174, 77.6237]}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-bold mb-1">Rapid Metro Pillar Construction</div>
                        <div className="text-gray-500">Silk Board, Ring Road</div>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={[13.0358, 77.5970]}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-bold mb-1">Waterlogging - Hebbal Underpass</div>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {activeLayers.has("heat") && (
                <>
                  <Circle center={[12.9758, 77.6094]} radius={1000}
                    pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15, weight: 0 }} />
                  <Circle center={[12.9716, 77.5946]} radius={600}
                    pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.1, weight: 0 }} />
                  <Circle center={[12.9174, 77.6237]} radius={700}
                    pathOptions={{ color: "#eab308", fillColor: "#eab308", fillOpacity: 0.12, weight: 0 }} />
                </>
              )}

              {activeLayers.has("diversions") && (
                <>
                  <Polyline positions={BLOCKED_ROUTE}
                    pathOptions={{ color: "#ef4444", weight: 4, dashArray: "8 5" }} />
                  <Polyline positions={DIVERSION_ROUTE}
                    pathOptions={{ color: "#8b5cf6", weight: 3, dashArray: "10 6" }} />
                </>
              )}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 rounded border border-gray-200 px-3 py-2.5 text-[11px] z-[1000] space-y-1 shadow-sm">
              <div className="font-semibold text-gray-700 mb-1.5 text-[10px] uppercase tracking-wide">Traffic Route Legend</div>
              <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-blue-500 inline-block" /> Active Route (Open)</div>
              <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-red-500 inline-block" style={{backgroundImage:"repeating-linear-gradient(90deg,#ef4444 0 8px,transparent 8px 13px)"}} /> Blocked Segment</div>
              <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-purple-500 inline-block" style={{backgroundImage:"repeating-linear-gradient(90deg,#8b5cf6 0 10px,transparent 10px 16px)"}} /> Proposed Diversion</div>
            </div>

            {/* OSM Credit */}
            <div className="absolute bottom-1 right-1 text-[9px] text-gray-400 z-[1000]">
              OSM GIS Live Vector Engine v1.0
            </div>
          </div>

          {/* Control Layers */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-medium">CONTROL LAYERS:</span>
              {LAYERS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => toggleLayer(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeLayers.has(id)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Module */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Telemetry Module</span>
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-3 mb-0.5">Silk Board Junction</h2>
          <div className="text-xs text-gray-500 mb-5">GPS: 12.9176, 77.6244</div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Saturation Index:</span>
              <span className="text-sm font-bold text-red-600">96%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Avg Vehicle Speed:</span>
              <span className="text-sm font-bold text-gray-900">8 km/h</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-600">Baseline Commute Delay:</span>
              <span className="text-sm font-bold text-gray-900">15 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Incidents:</span>
              <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> 2
              </span>
            </div>
          </div>

          <button className="w-full mt-6 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
            <Video className="w-4 h-4" /> Intercept CCTV Video feed
          </button>
        </div>
      </div>
    </div>
  );
}
