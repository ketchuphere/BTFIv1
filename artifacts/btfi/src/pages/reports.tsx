import { useGetEventStats, useGetRecentEvents } from "@workspace/api-client-react";
import { FileText, Download, Calendar, TrendingUp, Activity, Users, Clock } from "lucide-react";

export default function Reports() {
  const { data: stats } = useGetEventStats();
  const { data: events } = useGetRecentEvents();

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="p-5 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operations Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daily traffic management summary — {today}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Total Incidents", value: String(events?.length ?? 7), sub: "Today", color: "text-blue-600" },
          { icon: TrendingUp, label: "Resolved Events", value: String(stats?.resolvedToday ?? 3), sub: "Successfully closed", color: "text-green-600" },
          { icon: Clock, label: "Avg Response Time", value: `${stats?.avgResponseTime ?? 8}m`, sub: "Per incident", color: "text-orange-500" },
          { icon: Users, label: "Officers Deployed", value: "77", sub: "BTP constables", color: "text-purple-600" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Report sections */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Recent Incident Summary</div>
          <div className="space-y-2">
            {(events ?? []).map((ev: any, i: number) => (
              <div key={ev.id ?? i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs font-mono text-blue-600 w-16 shrink-0">{ev.id}</span>
                <span className="text-xs text-gray-700 flex-1">{ev.type?.replace(/_/g, " ")}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ev.status === "active" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">System Performance</div>
          <div className="space-y-3">
            {[
              { label: "Prediction Engine Accuracy", value: "94.2%", pct: 94 },
              { label: "CCTV Feed Uptime", value: "98.2%", pct: 98 },
              { label: "Alert Response Rate", value: "87.5%", pct: 88 },
              { label: "Diversion Compliance", value: "72.1%", pct: 72 },
            ].map(({ label, value, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
