import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { CARTO_TILE_URL, CARTO_ATTRIBUTION } from "@/lib/map-tiles";
import { MapplsTrafficLayer } from "@/components/mappls-traffic-layer";
import L from "leaflet";
import { useGetEventStats, useGetRecentEvents, useOptimizeResources, useCreateDiversion } from "@workspace/api-client-react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import {
  AlertTriangle, Activity, Clock, Car, Search, ChevronRight,
  AlertCircle, Zap, Navigation, Users, Shield, MapPin, Radio,
  TrendingDown, TrendingUp, ArrowRight
} from "lucide-react";

// Fix Leaflet default marker
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const INCIDENTS = [
  { id: "EVT-001", name: "Political Assembly & Rally", type: "political_rally", location: "MG Road Junction near Metro Station", lat: 12.9758, lng: 77.6094, status: "Critical", severity: "critical", vehicles: 5800, delay: 34, btpUnits: 12, saturation: 92, icon: criticalIcon },
  { id: "EVT-002", name: "Rapid Metro Pillar In-Situ Cold", type: "infrastructure", location: "Silk Board, Ring Road", lat: 12.9174, lng: 77.6237, status: "Critical", severity: "critical", vehicles: 3200, delay: 22, btpUnits: 8, saturation: 78, icon: criticalIcon },
  { id: "EVT-003", name: "Heavy Flash Waterlogging Underpass", type: "flood", location: "Hebbal Flyover, Bengaluru", lat: 13.0358, lng: 77.5970, status: "Heavy", severity: "heavy", vehicles: 1800, delay: 18, btpUnits: 5, saturation: 61, icon: undefined },
];

const ALERTS = [
  {
    id: 1, type: "CRITICAL ALERT", title: "POLITICAL RALLY DETECTED",
    message: "MG Road congestion increasing. Pedestrian counts exceeding walkway. Outbound near-ground protests found.",
    action: "Recommended action: Activate diversions",
    color: "red",
  },
  {
    id: 2, type: "SITUATIONAL",
    title: "HEBBAL UNDERPASS FLOOD",
    message: "MG Road congestion blocking arterial inflow velocity down to 8km/h",
    action: null,
    color: "orange",
  },
];

const MILESTONES = [
  { time: "09:35", label: "Event Created", detail: "BTP OPS notified. 5,800 vehicles flagged. Triggers high-density flow mode." },
  { time: "09:45", label: "Impact", detail: "Rft & barriers at 45% — 8 of 12 allocated. Saturation index 92." },
  { time: "09:51", label: "Resources Allocated", detail: "12 officers + 4 vehicles dispatched to sector." },
];

const AI_ATTRIBUTION = [
  { label: "Peak Hour Coupling", value: 354 },
  { label: "Crowd Size Scaling", value: 209 },
  { label: "Historical Congestion", value: 128 },
  { label: "Road Category Weight", value: 56 },
];

function StatCard({ icon: Icon, label, value, sub, subColor, compare }: {
  icon: any; label: string; value: string; sub: string; subColor: string; compare: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs font-medium ${subColor}`}>{sub}</div>
      <div className="text-[10px] text-gray-400">{compare}</div>
    </div>
  );
}

function DispatchCard({ incident }: { incident: typeof INCIDENTS[0] }) {
  const badgeColor = incident.severity === "critical"
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-orange-100 text-orange-700 border-orange-200";
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{incident.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{incident.location}</div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${badgeColor}`}>
          {incident.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span>Impact: <span className="font-semibold text-gray-700">{incident.saturation}/100</span></span>
        <span>Delay: <span className="font-semibold text-gray-700">{incident.delay} min</span></span>
        <span>BTP: <span className="font-semibold text-gray-700">{incident.btpUnits} units</span></span>
      </div>
    </div>
  );
}

function WhatIfPanel({ onUpdate }: { onUpdate: (p: any) => void }) {
  const [crowd, setCrowd] = useState(5000);
  const [duration, setDuration] = useState(120);
  const [closure, setClosure] = useState(false);
  const optimize = useOptimizeResources();

  const projected = {
    delay: Math.round(20 + (crowd / 1000) * 2.5 + (closure ? 8 : 0)),
    police: Math.round(10 + (crowd / 500) + (closure ? 15 : 0)),
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-gray-900">Tactical What-If Traffic Simulator</div>
          <div className="text-[10px] text-gray-500">Micro-simulation control deck</div>
        </div>
        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
          MICRO-SIM DECK V1.0
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" /> Crowd Size Swarm (attendees)</span>
            <span className="font-bold text-gray-900">{crowd.toLocaleString()}</span>
          </div>
          <input type="range" min={500} max={20000} step={500} value={crowd} onChange={e => setCrowd(+e.target.value)}
            className="w-full accent-blue-600 h-1.5 rounded" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Corridor Event Duration</span>
            <span className="font-bold text-gray-900">{duration} mins</span>
          </div>
          <input type="range" min={30} max={480} step={30} value={duration} onChange={e => setDuration(+e.target.value)}
            className="w-full accent-blue-600 h-1.5 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Complete Node Route Closure (Full Cordon)
          </span>
          <button onClick={() => setClosure(!closure)}
            className={`w-10 h-5 rounded-full transition-colors ${closure ? "bg-blue-600" : "bg-gray-300"}`}>
            <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform shadow ${closure ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Projections Delay</div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">
              34m <ArrowRight className="w-3 h-3 inline text-green-500" /> <span className="text-green-600">{projected.delay} mins</span>
            </div>
            <div className="text-[10px] text-gray-400">Delay divergence index</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">LP Police Deployment</div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">
              12 units <ArrowRight className="w-3 h-3 inline text-blue-500" /> <span className="text-blue-600">{projected.police} officers</span>
            </div>
            <div className="text-[10px] text-gray-400">Personnel delta: +{projected.police - 12} units</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeployPanel() {
  const [result, setResult] = useState<any>(null);
  const optimize = useOptimizeResources();

  const run = () => {
    optimize.mutate({ data: { crowdSize: 5800, roadClosed: true, severity: "High" } }, {
      onSuccess: (d) => setResult(d)
    });
  };

  const constables = result?.police ?? 77;
  const marshals = result?.marshals ?? 59;
  const barricades = result?.barricades ?? 399;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" /> AI-Recommended Asset Deployments
          </div>
        </div>
        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-200">
          LP/ILP OPTIMIZED
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">BTP Patrol Constables</div>
          <div className="text-2xl font-bold text-gray-900 my-1">{constables}</div>
          <div className="text-[10px] text-gray-400">Full-gear dispatch</div>
        </div>
        <div className="text-center border-x border-gray-100">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Civilian Marshals</div>
          <div className="text-2xl font-bold text-gray-900 my-1">{marshals}</div>
          <div className="text-[10px] text-gray-400">NMT lanes control</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Barricades (meters)</div>
          <div className="text-2xl font-bold text-gray-900 my-1">{barricades}m</div>
          <div className="text-[10px] text-gray-400">High-reflectivity barriers</div>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Spatial Deployment Priority Channels</div>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600">
          <div><span className="font-semibold text-gray-900">35</span> Critical Ju. units <span className="text-gray-400">(45%)</span></div>
          <div><span className="font-semibold text-gray-900">27</span> Event Peri. units <span className="text-gray-400">(35%)</span></div>
          <div><span className="font-semibold text-gray-900">15</span> Active Dive. units <span className="text-gray-400">(20%)</span></div>
        </div>
      </div>
    </div>
  );
}

function DiversionPanel() {
  const [result, setResult] = useState<any>(null);
  const create = useCreateDiversion();

  const run = () => {
    create.mutate({ data: { affectedRoad: "MG Road" } }, {
      onSuccess: (d) => setResult(d)
    });
  };

  const normalEta = result?.routes?.[0]?.eta ?? 12;
  const divEta = result?.routes?.[1]?.eta ?? 18;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-orange-500" /> Alternative Route Diversion Schemes
        </div>
        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-orange-200">
          MAJOR DIVERSION
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-red-500" />
        <span>Active Bottleneck: <span className="text-gray-800 font-medium">MG Road Junction access sectors</span></span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded border border-gray-200 p-2 text-center">
          <div className="text-[10px] text-gray-500 uppercase">Normal ETA</div>
          <div className="text-lg font-bold text-gray-900">{normalEta} mins</div>
        </div>
        <div className="rounded border border-red-200 p-2 text-center bg-red-50">
          <div className="text-[10px] text-red-500 uppercase">Gridlock ETA</div>
          <div className="text-lg font-bold text-red-600">42 mins</div>
        </div>
        <div className="rounded border border-green-200 p-2 text-center bg-green-50">
          <div className="text-[10px] text-green-600 uppercase">Diverted ETA</div>
          <div className="text-lg font-bold text-green-600">{divEta} mins</div>
        </div>
      </div>
      <div className="text-[11px] text-gray-600 flex items-center gap-1">
        <ChevronRight className="w-3 h-3 text-green-500" />
        Residency Road <ArrowRight className="w-3 h-3 mx-0.5" /> Richmond Circle <ArrowRight className="w-3 h-3 mx-0.5" /> Cubbon Road bypass
        <span className="ml-auto text-green-600 font-semibold text-[10px] bg-green-50 px-1.5 py-0.5 rounded">-24m saved</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dispatchFilter, setDispatchFilter] = useState("ALL");
  const [selectedIncident, setSelectedIncident] = useState(INCIDENTS[0]);

  const { data: stats } = useGetEventStats({
    query: { refetchInterval: 30_000, queryKey: ["event-stats"] },
  });
  const { data: seedData = [] } = useGetRecentEvents({
    query: { queryKey: ["recent-events-seed"] },
  });
  const { events: realtimeEvents } = useRealtimeEvents(seedData);

  const activeCount = stats?.activeEvents ?? 5;
  const criticalCount = stats?.criticalAlerts ?? 4;
  const avgDelay = stats?.avgResponseTime ?? 34;
  const resolvedToday = stats?.resolvedToday ?? 3;

  const filteredIncidents = dispatchFilter === "ALL"
    ? INCIDENTS
    : INCIDENTS.filter(i => i.severity.toUpperCase() === dispatchFilter);

  return (
    <div className="p-5 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Active Incidents" value={String(activeCount)}
          sub="+2 new last hour" subColor="text-green-600"
          compare="vs historical baseline" />
        <StatCard icon={AlertTriangle} label="Critical/Bottlenecks" value={String(criticalCount)}
          sub="4 high saturation zones" subColor="text-orange-500"
          compare="vs historical baseline" />
        <StatCard icon={Clock} label="Average Corridor Delay" value={`${avgDelay} min`}
          sub="-4 mins optimized" subColor="text-green-600"
          compare="vs historical baseline" />
        <StatCard icon={Car} label="Coordinated Vehicles" value="68,400"
          sub="+8.4% great absorption" subColor="text-green-600"
          compare="vs historical baseline" />
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-bold text-gray-900">Live Traffic Operational GIS (Bangalore Core)</div>
              <div className="text-[11px] text-gray-500">Use map elements to track active incidents, BTP deployments, and live camera feeds.</div>
            </div>
          </div>
          <div className="relative h-64">
            <MapContainer
              center={[12.9716, 77.5946]} zoom={12}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer url={CARTO_TILE_URL} attribution={CARTO_ATTRIBUTION} />
              <MapplsTrafficLayer />
              {INCIDENTS.map((inc) => (
                <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={inc.icon ?? new L.Icon.Default()}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-bold text-red-600 mb-1">{inc.name}</div>
                      <div className="text-gray-600">{inc.location}</div>
                      <div className="mt-1">Vehicles: {inc.vehicles.toLocaleString()} | Delay: {inc.delay} min</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <Circle center={[12.9758, 77.6094]} radius={800}
                pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.1, weight: 2, dashArray: "6 4" }} />
            </MapContainer>
            {/* Legend overlay */}
            <div className="absolute bottom-2 left-2 bg-white/90 rounded border border-gray-200 px-2.5 py-2 text-[10px] z-[1000] space-y-1">
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-500 inline-block" />Active Route (Open)</div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500 inline-block" />Blocked Segment</div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-purple-500 inline-block border-dashed border" />Proposed Diversion</div>
            </div>
          </div>
        </div>

        {/* Command Center Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-bold text-gray-900 mb-1">Command Center</div>
          <div className="text-[10px] text-gray-400 uppercase mb-3">Alerts</div>
          <div className="space-y-3">
            {ALERTS.map((alert) => (
              <div key={alert.id} className={`rounded-lg border p-3 ${alert.color === "red" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${alert.color === "red" ? "text-red-600" : "text-orange-600"}`}>
                  {alert.type}
                </div>
                <div className="text-xs font-bold text-gray-900 mb-1">{alert.title}</div>
                <div className="text-[11px] text-gray-600">{alert.message}</div>
                {alert.action && (
                  <div className="text-[10px] text-blue-600 mt-1.5 font-medium">{alert.action}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch + Intelligence */}
      <div className="grid grid-cols-2 gap-4">
        {/* Dispatch Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900">Real-Time Dispatch Feed</div>
            </div>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{INCIDENTS.length} INCIDENTS</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full border border-gray-200 rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search by street name, event type..." />
            </div>
          </div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {["ALL", "CRITICAL", "HEAVY", "MODERATE"].map(f => (
              <button key={f} onClick={() => setDispatchFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${dispatchFilter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredIncidents.map((inc) => (
              <div key={inc.id} onClick={() => setSelectedIncident(inc)} className="cursor-pointer">
                <DispatchCard incident={inc} />
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Command Core */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Intelligence Command Core</div>
          <div className="text-base font-bold text-gray-900 mb-0.5">{selectedIncident.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3" /> {selectedIncident.location}
          </div>
          <div className="text-sm text-gray-700 font-medium mb-3">{selectedIncident.vehicles.toLocaleString()} vehicles impacted</div>
          <div className="text-[11px] text-gray-600 mb-4 leading-relaxed">
            High-density gathering of party supporters walking toward Conference Park road. MG Road intersections choked. Outward flow throttled.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Op Event Log Milestones</div>
              <div className="space-y-2">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="shrink-0 w-10 text-[10px] text-blue-600 font-bold">{m.time}</div>
                    <div>
                      <div className="text-[11px] font-semibold text-gray-800">{m.label}</div>
                      <div className="text-[10px] text-gray-500">{m.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">AI Prediction Attribution</div>
              <div className="space-y-1.5">
                {AI_ATTRIBUTION.map((a) => (
                  <div key={a.label} className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-600">{a.label}</span>
                    <span className="text-[11px] font-bold text-gray-900">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 panels */}
      <div className="grid grid-cols-3 gap-4">
        <WhatIfPanel onUpdate={() => {}} />
        <DeployPanel />
        <DiversionPanel />
      </div>
    </div>
  );
}
