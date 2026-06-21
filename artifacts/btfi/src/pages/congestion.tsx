import { useState } from "react";
import { usePredictCongestion } from "@workspace/api-client-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, MapPin, Clock, Activity, RefreshCw, AlertTriangle } from "lucide-react";

const CORRIDORS = [
  { id: "mg-road", label: "MG Road – Hebbal", current: 92, predicted: 88 },
  { id: "silk-board", label: "Silk Board – Electronic City", current: 78, predicted: 82 },
  { id: "orr", label: "Outer Ring Road West", current: 61, predicted: 55 },
  { id: "airport", label: "Airport Road – Hebbal", current: 45, predicted: 49 },
  { id: "bannerghatta", label: "Bannerghatta Road", current: 38, predicted: 42 },
];

function generateTimeSeries(baseLoad: number) {
  return Array.from({ length: 24 }, (_, h) => {
    const hour = h;
    const morning = hour >= 7 && hour <= 10 ? 30 : 0;
    const evening = hour >= 17 && hour <= 20 ? 35 : 0;
    const base = Math.max(5, baseLoad * 0.3);
    const load = Math.min(100, Math.round(base + morning + evening + (Math.random() - 0.5) * 8));
    return { hour: `${String(hour).padStart(2, "0")}:00`, load, predicted: Math.round(load * (0.9 + Math.random() * 0.2)) };
  });
}

export default function CongestionForecast() {
  const [selected, setSelected] = useState(CORRIDORS[0]);
  const [chartData] = useState(() => generateTimeSeries(selected.current));
  const predict = usePredictCongestion();
  const [result, setResult] = useState<any>(null);

  const run = () => {
    predict.mutate(
      { data: { sector: selected.id, timeHorizonHours: 2, currentLoad: selected.current } },
      { onSuccess: (d) => setResult(d) }
    );
  };

  const getSatColor = (v: number) => v >= 80 ? "text-red-600" : v >= 60 ? "text-orange-500" : "text-green-600";
  const getSatBg = (v: number) => v >= 80 ? "bg-red-50 border-red-200" : v >= 60 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200";

  return (
    <div className="p-5 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Congestion Forecast Engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">ML-powered 2-hour traffic load prediction across all active Bengaluru corridors.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Corridor list */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Active Corridors</div>
          <div className="space-y-2">
            {CORRIDORS.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${selected.id === c.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-900 leading-tight">{c.label}</span>
                  <span className={`text-xs font-bold ${getSatColor(c.current)}`}>{c.current}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${c.current >= 80 ? "bg-red-500" : c.current >= 60 ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: `${c.current}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-gray-900">{selected.label}</div>
              <div className="text-[11px] text-gray-500">24-hour load forecast</div>
            </div>
            <button onClick={run} disabled={predict.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
              <Activity className={`w-3.5 h-3.5 ${predict.isPending ? "animate-spin" : ""}`} />
              Run ML Prediction
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                formatter={(v: number) => [`${v}%`]}
              />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical", fontSize: 10, fill: "#ef4444" }} />
              <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} name="Current Load" />
              <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} name="ML Prediction" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-6 h-0.5 bg-blue-500 inline-block" /> Current Load
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-6 h-0.5 bg-green-500 inline-block" style={{ backgroundImage: "repeating-linear-gradient(90deg,#10b981 0 6px,transparent 6px 9px)" }} /> ML Prediction
            </div>
          </div>
          {result && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-bold text-blue-800 mb-1">ML Forecast Result</div>
              <div className="text-xs text-blue-700">
                Predicted peak load: <span className="font-bold">{result.predictedLoad ?? "—"}%</span> at{" "}
                <span className="font-bold">{result.peakTime ?? "—"}</span>.{" "}
                Recommended action: <span className="font-semibold">{result.recommendation ?? "Monitor closely"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
