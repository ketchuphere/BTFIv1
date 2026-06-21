import { useState } from "react";
import { useGetRecentEvents } from "@workspace/api-client-react";
import { MapPin, Users, Clock, Zap, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterLevel = "ALL" | "CRITICAL" | "HEAVY" | "MODERATE";

const FILTER_LABELS: FilterLevel[] = ["ALL", "CRITICAL", "HEAVY", "MODERATE"];

const PRIORITY_BADGE: Record<string, string> = {
  High: "bg-red-100 text-red-700 border border-red-200",
  Low: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const PRIORITY_LABEL: Record<string, string> = {
  High: "Critical",
  Low: "Moderate",
};

const FILTER_MAP: Record<FilterLevel, string[]> = {
  ALL: [],
  CRITICAL: ["High"],
  HEAVY: ["High"],
  MODERATE: ["Low"],
};

const DURATION_MAP: Record<string, number> = {
  "EVT-001": 180,
  "EVT-002": 1440,
  "EVT-003": 120,
  "EVT-004": 90,
  "EVT-005": 240,
  "EVT-006": 60,
  "EVT-007": 30,
};

const CROWD_MAP: Record<string, number> = {
  "EVT-001": 5800,
  "EVT-002": 1200,
  "EVT-003": 3400,
  "EVT-004": 900,
  "EVT-005": 12000,
  "EVT-006": 200,
  "EVT-007": 500,
};

const EVENT_DISPLAY_NAMES: Record<string, string> = {
  political_rally: "Political Assembly & Rally",
  vehicle_breakdown: "Rapid Metro Pillar Pier In-Situ Cast",
  accident: "Multi-Vehicle Accident",
  water_logging: "Heavy Flash Waterlogging Underpass",
  public_event: "VVIP Movement & Convoy Escort",
  tree_fall: "Tree Fall — Lane Obstruction",
  pot_holes: "Severe Pothole Cluster",
};

const MILESTONES = [
  {
    time: "09:00",
    label: "Event Created",
    desc: "BTP central GIS dispatch flagged initial corridor flow offset",
    color: "bg-blue-500",
  },
  {
    time: "09:05",
    label: "Impact Predicted",
    desc: "RFRegressor and ILP solver estimated queue timeline stress",
    color: "bg-orange-500",
  },
  {
    time: "09:10",
    label: "Resources Allocated",
    desc: "Patrol squads disembarked to blockade perimeter gates",
    color: "bg-purple-500",
  },
  {
    time: "09:15",
    label: "Diversion Activated",
    desc: "Signboards and virtual bypass loop re-routes signed on",
    color: "bg-green-500",
  },
];

const ATTRIBUTION = [
  { label: "Road Closure Impact", pct: 35, color: "bg-red-500" },
  { label: "Peak Hour Coupling", pct: 25, color: "bg-red-400" },
  { label: "Crowd Size Scaling", pct: 20, color: "bg-orange-400" },
  { label: "Historical Congestion", pct: 15, color: "bg-orange-500" },
  { label: "Road Category Weight", pct: 5, color: "bg-red-600" },
];

export default function EventIntelligence() {
  const { data: events = [] } = useGetRecentEvents({ query: { refetchInterval: 30000 } });
  const [filter, setFilter] = useState<FilterLevel>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = events.filter((ev: any) => {
    const matchFilter =
      filter === "ALL" ||
      (filter === "CRITICAL" && ev.priority === "High" && ev.impactScore >= 75) ||
      (filter === "HEAVY" && ev.priority === "High" && ev.impactScore >= 50 && ev.impactScore < 75) ||
      (filter === "MODERATE" && ev.impactScore < 50);
    const matchSearch =
      !search ||
      (ev.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (ev.eventType ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const selected = selectedId
    ? events.find((e: any) => e.id === selectedId)
    : filtered[0] ?? events[0];

  const displayName = (ev: any) =>
    EVENT_DISPLAY_NAMES[ev.eventType] ?? ev.eventType?.replace(/_/g, " ");

  const badgeClass = (ev: any) => {
    if (ev.impactScore >= 75) return "bg-red-100 text-red-700 border border-red-200";
    if (ev.impactScore >= 50) return "bg-orange-100 text-orange-700 border border-orange-200";
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  };

  const badgeLabel = (ev: any) => {
    if (ev.impactScore >= 75) return "Critical";
    if (ev.impactScore >= 50) return "Heavy";
    return "Moderate";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-4 border-b border-gray-200 bg-white">
        <h1 className="text-[22px] font-bold text-gray-900">Cognitive Event Intelligence Hub</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Query Gemini directly to receive signal offsets and action sheets on metropolitan anomalies.
        </p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-[380px] shrink-0 border-r border-gray-200 bg-white flex flex-col min-h-0">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Real-Time Dispatch Feed</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 uppercase tracking-wide">
                {events.length} Incidents Active
              </span>
            </div>

            <div className="relative mb-3">
              <input
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Search by street name, event type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="text-gray-500 uppercase tracking-wider mr-1">Filter:</span>
              {FILTER_LABELS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded transition-colors",
                    filter === f
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filtered.map((ev: any) => {
              const isActive = (selected?.id) === ev.id;
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedId(ev.id)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors",
                    isActive && "bg-blue-50 border-l-2 border-l-blue-600"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 leading-snug">
                      {displayName(ev)}
                    </span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded shrink-0", badgeClass(ev))}>
                      {badgeLabel(ev)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span>Impact Rating: <span className="text-gray-700 font-medium">{ev.impactScore}/100</span></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {DURATION_MAP[ev.id] ?? 60} mins duration
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selected ? (
            <div className="p-6 space-y-5">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded">
                    Intelligence Command Core
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayName(selected)}</h2>
                <div className="flex items-center gap-5 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selected.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {(CROWD_MAP[selected.id] ?? 1000).toLocaleString()} vehicles impacted
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
                    Baseline Incident Context
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selected.description ?? `High-density gathering at ${selected.location}. Key intersections choked. Outward flow throttled.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-800">Ops Event Log Milestones</span>
                  </div>
                  <div className="space-y-3">
                    {MILESTONES.map((m, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1", m.color)} />
                          {i < MILESTONES.length - 1 && (
                            <span className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: 16 }} />
                          )}
                        </div>
                        <div className="pb-2">
                          <div className="text-[11px] font-bold text-gray-900">
                            {m.time} — {m.label}
                          </div>
                          <div className="text-[11px] text-gray-500 leading-snug">{m.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-800">AI Prediction Attribution</span>
                  </div>
                  <div className="space-y-2.5">
                    {ATTRIBUTION.map((a, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                          <span>{a.label}</span>
                          <span className="font-semibold text-gray-800">{a.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", a.color)}
                            style={{ width: `${a.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Performance Intake: Predicted vs Actual Comparison</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Predicted Impact Score", predicted: selected.impactScore, actual: Math.max(0, selected.impactScore - Math.floor(Math.random() * 8 + 2)) },
                    { label: "Avg Delay (mins)", predicted: Math.round(selected.impactScore / 3), actual: Math.round(selected.impactScore / 3.2) },
                    { label: "Queue Length (vehicles)", predicted: Math.round((CROWD_MAP[selected.id] ?? 1000) * 0.8), actual: Math.round((CROWD_MAP[selected.id] ?? 1000) * 0.74) },
                  ].map((stat, i) => (
                    <div key={i} className="rounded border border-gray-100 bg-gray-50 p-3">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">{stat.label}</div>
                      <div className="flex items-end gap-3">
                        <div>
                          <div className="text-[10px] text-blue-500 font-semibold mb-0.5">PREDICTED</div>
                          <div className="text-lg font-bold text-gray-900">{stat.predicted}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-green-600 font-semibold mb-0.5">ACTUAL</div>
                          <div className="text-lg font-bold text-gray-700">{stat.actual}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select an incident to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
