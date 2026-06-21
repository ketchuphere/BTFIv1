import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, CircleMarker } from "react-leaflet";
import { CARTO_TILE_URL, CARTO_ATTRIBUTION } from "@/lib/map-tiles";
import { MapplsTrafficLayer } from "@/components/mappls-traffic-layer";
import L from "leaflet";
import {
  Thermometer, AlertCircle, Users, Video, Navigation,
  Activity, MapPin, Zap, Radio, TrendingUp, Clock, Car,
} from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeCircleIcon = (color: string, label: string) =>
  L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;color:white;font-family:sans-serif;
    ">${label}</div>`,
  });

const btpIcon = L.divIcon({
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
  html: `<div style="
    width:26px;height:26px;border-radius:50%;
    background:#1d4ed8;border:2px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:800;color:white;font-family:sans-serif;
  ">BTP</div>`,
});

const LAYERS = [
  { id: "heat",      label: "Traffic Heat Layer",  icon: Thermometer },
  { id: "incidents", label: "Incidents",            icon: AlertCircle },
  { id: "officers",  label: "Officers (BTP Squad)", icon: Users },
  { id: "cctv",      label: "CCTV Streams",         icon: Video },
  { id: "diversions",label: "Active Diversions",    icon: Navigation },
];

// ── Route data ────────────────────────────────────────────────────────────────
const ACTIVE_ROUTES: { positions: [number, number][]; color: string; label: string; status: string }[] = [
  {
    label: "NH-44 / Bellary Road (North Corridor)",
    color: "#22c55e", status: "Open — 34 km/h avg",
    positions: [
      [13.0580, 77.5960], [13.0435, 77.6020], [13.0300, 77.5990],
      [13.0100, 77.5960], [12.9900, 77.5950], [12.9716, 77.5946],
    ],
  },
  {
    label: "Old Madras Road (East Corridor)",
    color: "#3b82f6", status: "Open — 28 km/h avg",
    positions: [
      [12.9716, 77.5946], [12.9728, 77.6150], [12.9742, 77.6380],
      [12.9758, 77.6600], [12.9770, 77.6780],
    ],
  },
  {
    label: "Tumkur Road (West Corridor)",
    color: "#06b6d4", status: "Open — 41 km/h avg",
    positions: [
      [13.0480, 77.5300], [13.0300, 77.5450], [13.0100, 77.5600],
      [12.9900, 77.5750], [12.9716, 77.5946],
    ],
  },
  {
    label: "Hosur Road / NH-44S (South Corridor)",
    color: "#f59e0b", status: "Moderate — 18 km/h avg",
    positions: [
      [12.9716, 77.5946], [12.9500, 77.6050], [12.9174, 77.6237],
      [12.8950, 77.6350], [12.8720, 77.6450],
    ],
  },
  {
    label: "Outer Ring Road (ORR West Arc)",
    color: "#a855f7", status: "Open — 52 km/h avg",
    positions: [
      [13.0100, 77.5600], [12.9800, 77.5350], [12.9500, 77.5200],
      [12.9200, 77.5350], [12.9000, 77.5600],
    ],
  },
];

const BLOCKED_ROUTES: { positions: [number, number][]; label: string; reason: string }[] = [
  {
    label: "MG Road — Full Event Closure",
    reason: "Political rally · 15,000 attendees",
    positions: [
      [12.9758, 77.6094], [12.9735, 77.6075], [12.9710, 77.6050], [12.9685, 77.6025],
    ],
  },
  {
    label: "Hebbal Flyover — Partial Block",
    reason: "Waterlogging · 2 lanes closed",
    positions: [
      [13.0410, 77.5990], [13.0358, 77.5970], [13.0305, 77.5952],
    ],
  },
];

const DIVERSION_ROUTES: { positions: [number, number][]; label: string; saving: string }[] = [
  {
    label: "MG Road Bypass via Residency Rd",
    saving: "Saves ~8 min",
    positions: [
      [12.9758, 77.6094], [12.9800, 77.6140], [12.9835, 77.6095],
      [12.9810, 77.6045], [12.9775, 77.6018], [12.9685, 77.6025],
    ],
  },
  {
    label: "Hebbal Alt — Bellary Rd Service Lane",
    saving: "Saves ~5 min",
    positions: [
      [13.0440, 77.6018], [13.0390, 77.5935], [13.0355, 77.5952],
    ],
  },
];

// ── Incidents ─────────────────────────────────────────────────────────────────
const INCIDENTS = [
  {
    pos: [12.9758, 77.6094] as [number, number],
    color: "#ef4444", label: "C", shortLabel: "CRITICAL",
    title: "Political Assembly & Rally",
    location: "MG Road — Metro Station Junction",
    impact: 92, delay: 34, vehicles: 5800, units: 12, status: "Critical",
  },
  {
    pos: [12.9174, 77.6237] as [number, number],
    color: "#f97316", label: "H", shortLabel: "HEAVY",
    title: "Metro Pillar Construction",
    location: "Silk Board Junction, Ring Road",
    impact: 68, delay: 22, vehicles: 3200, units: 6, status: "Heavy",
  },
  {
    pos: [13.0358, 77.5970] as [number, number],
    color: "#eab308", label: "M", shortLabel: "MODERATE",
    title: "Waterlogging — Hebbal Underpass",
    location: "Hebbal Flyover, Bellary Road",
    impact: 51, delay: 14, vehicles: 1900, units: 4, status: "Moderate",
  },
  {
    pos: [12.9716, 77.6600] as [number, number],
    color: "#f97316", label: "H", shortLabel: "HEAVY",
    title: "VVIP Convoy Movement",
    location: "Old Madras Road, KR Puram",
    impact: 71, delay: 18, vehicles: 2700, units: 8, status: "Heavy",
  },
];

const BTP_OFFICERS = [
  { pos: [12.9740, 77.6050] as [number, number], badge: "BTP-04", post: "MG Rd Junction" },
  { pos: [12.9200, 77.6220] as [number, number], badge: "BTP-11", post: "Silk Board" },
  { pos: [13.0320, 77.5980] as [number, number], badge: "BTP-07", post: "Hebbal" },
  { pos: [12.9650, 77.6400] as [number, number], badge: "BTP-09", post: "KR Puram" },
];

const CCTV_NODES = [
  { pos: [12.9758, 77.6094] as [number, number], id: "CAM-MG-01" },
  { pos: [12.9174, 77.6237] as [number, number], id: "CAM-SB-03" },
  { pos: [13.0358, 77.5970] as [number, number], id: "CAM-HB-02" },
  { pos: [12.9500, 77.5800] as [number, number], id: "CAM-CT-07" },
];

const JUNCTIONS = [
  { name: "Silk Board Junction", gps: "12.9176, 77.6244", saturation: 96, speed: 8,  delay: 15, incidents: 2, color: "text-red-600" },
  { name: "MG Road Metro",       gps: "12.9758, 77.6094", saturation: 91, speed: 5,  delay: 34, incidents: 1, color: "text-red-600" },
  { name: "Hebbal Interchange",  gps: "12.9358, 77.5970", saturation: 62, speed: 19, delay: 14, incidents: 1, color: "text-orange-500" },
  { name: "KR Puram Bridge",     gps: "12.9716, 77.6600", saturation: 74, speed: 13, delay: 18, incidents: 1, color: "text-orange-500" },
];

export default function LiveTraffic() {
  const [activeLayers, setActiveLayers] = useState(new Set(["heat", "incidents", "diversions"]));
  const [selectedJunction, setSelectedJunction] = useState(0);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const jxn = JUNCTIONS[selectedJunction];

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Map Inspect Workspace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full-stage command terminal for CCTV streams and patrol car telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            LIVE · {INCIDENTS.length} Active Incidents
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 font-mono">
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
          </div>
        </div>
      </div>

      {/* Map + Telemetry */}
      <div className="grid grid-cols-3 gap-4">

        {/* Map card */}
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
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 text-base font-light">+</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 text-base font-light">−</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">
                <Activity className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 font-mono flex justify-between">
            <span>BTP OPS SECTION GRID // BOUNDS: 12.82N – 13.06N</span>
            <span>MAP PROVIDER: OPENSTREETMAP LIVE GIS</span>
          </div>

          <div className="relative" style={{ height: "460px" }}>
            <MapContainer
              center={[12.9700, 77.5950]} zoom={12}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer url={CARTO_TILE_URL} attribution={CARTO_ATTRIBUTION} />
              <MapplsTrafficLayer />

              {/* Active corridors — always visible */}
              {ACTIVE_ROUTES.map((r) => (
                <Polyline key={r.label} positions={r.positions}
                  pathOptions={{ color: r.color, weight: 5, opacity: 0.82, lineCap: "round", lineJoin: "round" }}>
                  <Popup maxWidth={220}>
                    <div className="text-xs">
                      <div className="font-bold text-gray-900 mb-0.5">{r.label}</div>
                      <div className="text-gray-500">{r.status}</div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* Heat layer */}
              {activeLayers.has("heat") && (
                <>
                  <Circle center={[12.9758, 77.6094]} radius={1200}
                    pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.14, weight: 0 }} />
                  <Circle center={[12.9716, 77.5946]} radius={700}
                    pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.10, weight: 0 }} />
                  <Circle center={[12.9174, 77.6237]} radius={900}
                    pathOptions={{ color: "#eab308", fillColor: "#eab308", fillOpacity: 0.12, weight: 0 }} />
                  <Circle center={[13.0358, 77.5970]} radius={600}
                    pathOptions={{ color: "#eab308", fillColor: "#eab308", fillOpacity: 0.10, weight: 0 }} />
                  <Circle center={[12.9716, 77.6600]} radius={750}
                    pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.11, weight: 0 }} />
                </>
              )}

              {/* Blocked + diversion routes */}
              {activeLayers.has("diversions") && (
                <>
                  {BLOCKED_ROUTES.map((r) => (
                    <Polyline key={r.label} positions={r.positions}
                      pathOptions={{ color: "#ef4444", weight: 6, dashArray: "10 7", opacity: 0.95, lineCap: "round" }}>
                      <Popup maxWidth={220}>
                        <div className="text-xs">
                          <div className="font-bold text-red-700 mb-0.5">{r.label}</div>
                          <div className="text-gray-500">{r.reason}</div>
                        </div>
                      </Popup>
                    </Polyline>
                  ))}
                  {DIVERSION_ROUTES.map((r) => (
                    <Polyline key={r.label} positions={r.positions}
                      pathOptions={{ color: "#8b5cf6", weight: 4, dashArray: "12 7", opacity: 0.88, lineCap: "round" }}>
                      <Popup maxWidth={220}>
                        <div className="text-xs">
                          <div className="font-bold text-purple-700 mb-0.5">{r.label}</div>
                          <div className="text-green-700 font-semibold">{r.saving}</div>
                        </div>
                      </Popup>
                    </Polyline>
                  ))}
                </>
              )}

              {/* Incident markers */}
              {activeLayers.has("incidents") && INCIDENTS.map((inc) => (
                <Marker key={inc.title} position={inc.pos} icon={makeCircleIcon(inc.color, inc.label)}>
                  <Popup maxWidth={280}>
                    <div className="text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ background: inc.color }}>{inc.shortLabel}</span>
                        <span className="text-gray-400">Impact {inc.impact}/100</span>
                      </div>
                      <div className="font-bold text-gray-900">{inc.title}</div>
                      <div className="text-gray-500">{inc.location}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-gray-100 pt-1.5">
                        <div><div className="text-gray-400 text-[10px]">QUEUE</div><div className="font-bold">{inc.vehicles.toLocaleString()}</div></div>
                        <div><div className="text-gray-400 text-[10px]">DELAY</div><div className="font-bold">{inc.delay} min</div></div>
                        <div><div className="text-gray-400 text-[10px]">STATUS</div><div className="font-bold" style={{ color: inc.color }}>{inc.status}</div></div>
                        <div><div className="text-gray-400 text-[10px]">BTP UNITS</div><div className="font-bold">{inc.units} active</div></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* BTP officers */}
              {activeLayers.has("officers") && BTP_OFFICERS.map((o) => (
                <Marker key={o.badge} position={o.pos} icon={btpIcon}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-bold text-blue-800">{o.badge}</div>
                      <div className="text-gray-500">{o.post}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* CCTV nodes */}
              {activeLayers.has("cctv") && CCTV_NODES.map((c) => (
                <CircleMarker key={c.id} center={c.pos} radius={7}
                  pathOptions={{ color: "#0ea5e9", fillColor: "#0ea5e9", fillOpacity: 0.9, weight: 2 }}>
                  <Popup>
                    <div className="text-xs font-bold text-sky-700">{c.id}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/97 rounded-lg border border-gray-200 px-3 py-2.5 text-[11px] z-[1000] shadow-md space-y-1.5">
              <div className="font-bold text-gray-700 text-[10px] uppercase tracking-wide mb-1">Traffic Route Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-[3px] rounded-full bg-green-500 inline-block" />
                <span className="text-gray-600">Active Corridor (Open)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="3"><line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#ef4444" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" /></svg>
                <span className="text-gray-600">Blocked Segment</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="3"><line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="9 6" strokeLinecap="round" /></svg>
                <span className="text-gray-600">Proposed Diversion</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5 border-t border-gray-100">
                <span className="w-4 h-4 rounded-full bg-red-500 border-2 border-white inline-flex items-center justify-center text-[8px] font-bold text-white leading-none">C</span>
                <span className="text-gray-600">Critical Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-700 border-2 border-white inline-flex items-center justify-center text-[7px] font-bold text-white leading-none">BTP</span>
                <span className="text-gray-600">BTP Officer Post</span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 text-[9px] text-gray-400 z-[1000] font-mono">
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

        {/* Telemetry Panel */}
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
          {/* Junction selector */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Telemetry Module</span>
              <Radio className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-1">
              {JUNCTIONS.map((j, i) => (
                <button key={j.name} onClick={() => setSelectedJunction(i)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    selectedJunction === i
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}>
                  <span className="font-semibold">{j.name}</span>
                  <span className={`ml-2 text-[10px] font-bold ${selectedJunction === i ? "text-gray-300" : j.color}`}>
                    {j.saturation}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live metrics */}
          <div className="px-4 py-3 flex-1">
            <div className="mb-3">
              <h2 className="text-base font-bold text-gray-900">{jxn.name}</h2>
              <div className="text-[11px] text-gray-400 font-mono">GPS: {jxn.gps}</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" /> Saturation Index
                </div>
                <span className={`text-sm font-bold ${jxn.color}`}>{jxn.saturation}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Car className="w-3.5 h-3.5 text-gray-400" /> Avg Vehicle Speed
                </div>
                <span className="text-sm font-bold text-gray-900">{jxn.speed} km/h</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Commute Delay
                </div>
                <span className="text-sm font-bold text-gray-900">{jxn.delay} min</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> Active Incidents
                </div>
                <span className={`text-sm font-bold flex items-center gap-1 ${jxn.color}`}>
                  {jxn.incidents}
                </span>
              </div>
            </div>

            {/* Saturation bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>ROAD SATURATION</span><span>{jxn.saturation}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${jxn.saturation}%`,
                    background: jxn.saturation > 85 ? "#ef4444" : jxn.saturation > 65 ? "#f97316" : "#22c55e",
                  }} />
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
              <Video className="w-4 h-4" /> Intercept CCTV Video feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
