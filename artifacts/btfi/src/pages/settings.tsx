import { useState } from "react";
import { Settings, Bell, Shield, Globe, Database, RefreshCw, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [alerts, setAlerts] = useState(true);
  const [mlEnabled, setMlEnabled] = useState(true);
  const [autoDisvert, setAutoDisvert] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure BTFI platform preferences, alert thresholds, and integrations.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* General */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-600" />
            <div className="text-sm font-bold text-gray-900">General Configuration</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Data Refresh Interval
              </label>
              <select value={refreshInterval} onChange={e => setRefreshInterval(+e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={10}>Every 10 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 60 seconds</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Default City Zone
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Bengaluru Core</option>
                <option>North Bengaluru</option>
                <option>South Bengaluru</option>
                <option>East Bengaluru</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Map Tile Provider
              </label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>CartoDB Light (default)</option>
                <option>OpenStreetMap</option>
                <option>CartoDB Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts & ML */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-orange-500" />
            <div className="text-sm font-bold text-gray-900">Alerts & Intelligence</div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Enable Real-Time Alerts", value: alerts, set: setAlerts, desc: "Push command center notifications for critical events" },
              { label: "ML Prediction Engine", value: mlEnabled, set: setMlEnabled, desc: "Activate Random Forest impact forecasting model" },
              { label: "Auto-Deploy Diversions", value: autoDisvert, set: setAutoDisvert, desc: "Automatically activate signed routes on critical events" },
            ].map(({ label, value, set, desc }) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
                </div>
                <button onClick={() => set(!value)}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition-colors mt-0.5 ${value ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-600" />
            <div className="text-sm font-bold text-gray-900">Security & Access</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Authentication</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">BTP SSO Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Officer ID</span>
              <span className="text-xs font-mono text-gray-600">KK-BTP-0042</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Access Level</span>
              <span className="text-xs font-bold text-blue-600">Traffic Control Ops</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">Session Expires</span>
              <span className="text-xs text-gray-500">8 hours</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-purple-600" />
            <div className="text-sm font-bold text-gray-900">API & Data Sources</div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Traffic Prediction API", status: "online" },
              { label: "Congestion ML Engine", status: "online" },
              { label: "Resource LP Solver", status: "syncing" },
              { label: "GIS Tile Server", status: "online" },
              { label: "CCTV Feed Aggregator", status: "online" },
            ].map(({ label, status }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  status === "online" ? "text-green-600 bg-green-50" :
                  status === "syncing" ? "text-orange-600 bg-orange-50" :
                  "text-red-600 bg-red-50"
                }`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
