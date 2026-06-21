import { useGetRecentEvents } from "@workspace/api-client-react";
import { Brain, MapPin, Clock, AlertTriangle, RefreshCw } from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
  active: "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

export default function EventIntelligence() {
  const { data: events, isLoading, refetch } = useGetRecentEvents({ query: { refetchInterval: 30000 } });

  return (
    <div className="p-5 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Event Intelligence Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-classified incident feed with predictive attribution and anomaly detection.</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 grid grid-cols-6 gap-4 text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
            <div>ID</div>
            <div className="col-span-2">Event</div>
            <div>Location</div>
            <div>Status</div>
            <div>Time</div>
          </div>
          {(events ?? []).map((ev: any, i: number) => (
            <div key={ev.id ?? i} className="px-5 py-4 border-b border-gray-100 grid grid-cols-6 gap-4 hover:bg-gray-50 transition-colors">
              <div className="text-xs font-mono text-blue-600 font-semibold">{ev.id}</div>
              <div className="col-span-2">
                <div className="text-sm font-semibold text-gray-900">{ev.type?.replace(/_/g, " ")}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> AI-classified
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{ev.location}</span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${SEVERITY_COLORS[ev.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {ev.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
