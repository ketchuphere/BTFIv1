import { useState } from "react";
import { useCreateDiversion, useOptimizeResources } from "@workspace/api-client-react";
import { Navigation, MapPin, Download, ArrowRight, Clock, Users, ChevronRight } from "lucide-react";

export default function Diversion() {
  const [crowd, setCrowd] = useState(5000);
  const [duration, setDuration] = useState(120);
  const [closure, setClosure] = useState(false);
  const [activeTab, setActiveTab] = useState<"primary" | "secondary">("primary");
  const [divResult, setDivResult] = useState<any>(null);

  const createDiversion = useCreateDiversion();
  const optimize = useOptimizeResources();

  const handleDivert = () => {
    createDiversion.mutate({ data: { affectedRoad: "MG Road" } }, {
      onSuccess: (d) => setDivResult(d),
    });
  };

  const projected = {
    delay: Math.max(10, Math.round(34 - (closure ? 8 : 0) + (crowd / 1000) * 0.5 - (duration / 60))),
    police: Math.round(12 + (crowd / 500) + (closure ? 15 : 0)),
  };

  const normalEta = 12;
  const gridlockEta = 42;
  const divEta = divResult?.routes?.[0]?.eta ?? 18;

  const primaryRoute = divResult?.routes?.[0] ?? {
    name: "Primary Loop Channel",
    description: "Residency Road → Richmond Circle → Cubbon Road bypass",
    etaSaving: 24,
    signagePoints: 24,
  };

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Alternative Route Routing terminal</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Setup arterial bypass routes dynamically routing traffic around the active hazard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Diversion Schemes */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-500" />
              <span className="text-base font-bold text-gray-900">Alternative Route Diversion Schemes</span>
            </div>
            <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase border border-orange-200">
              MAJOR DIVERSION
            </span>
          </div>

          {/* Active bottleneck */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span>Active Bottleneck: <span className="font-semibold text-gray-900">MG Road Junction access sectors</span></span>
          </div>

          {/* ETA comparison */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg border border-gray-200 p-3 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">NORMAL ETA</div>
              <div className="text-2xl font-bold text-gray-900">{normalEta}</div>
              <div className="text-xs text-gray-500">mins</div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <div className="text-[10px] text-red-500 uppercase tracking-wide mb-1">GRIDLOCK ETA</div>
              <div className="text-2xl font-bold text-red-600">{gridlockEta}</div>
              <div className="text-xs text-red-400">mins</div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <div className="text-[10px] text-green-600 uppercase tracking-wide mb-1">DIVERTED ETA</div>
              <div className="text-2xl font-bold text-green-600">{divEta}</div>
              <div className="text-xs text-green-400">mins</div>
            </div>
          </div>

          {/* Route tabs */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
            <button
              onClick={() => setActiveTab("primary")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                activeTab === "primary"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Primary Loop Channel
            </button>
            <button
              onClick={() => setActiveTab("secondary")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors border-l border-gray-200 ${
                activeTab === "secondary"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Secondary Bypass Channel
            </button>
          </div>

          {/* Route detail */}
          <div className="space-y-3 mb-5">
            {activeTab === "primary" ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ChevronRight className="w-4 h-4 text-green-500 shrink-0" />
                <span>Residency Road <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-400" /> Richmond Circle <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-400" /> Cubbon Road bypass</span>
                <span className="ml-auto bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded border border-green-200 shrink-0">
                  -24m saved
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Domlur Flyover <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-400" /> Indiranagar 100ft Road <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-400" /> HAL Airport Road</span>
                <span className="ml-auto bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200 shrink-0">
                  -18m saved
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <span className="text-[8px] text-gray-500">i</span>
              </div>
              Requires {activeTab === "primary" ? 24 : 18} active Variable signage points
            </div>
          </div>

          <button
            onClick={handleDivert}
            disabled={createDiversion.isPending}
            className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {createDiversion.isPending ? "Processing..." : "Download Operational Plan"}
          </button>
        </div>

        {/* Right: What-If Simulator */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-base font-bold text-gray-900">Tactical What-If Traffic Simulator</div>
              <div className="text-xs text-gray-500 mt-0.5">Adjust parameters to simulate traffic outcomes</div>
            </div>
            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-gray-200">
              MICRO-SIM DECK V1.0
            </span>
          </div>

          <div className="space-y-6">
            {/* Crowd slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  Crowd Size Swarm (attendees)
                </label>
                <span className="text-sm font-bold text-gray-900">{crowd.toLocaleString()}</span>
              </div>
              <input
                type="range" min={500} max={20000} step={500} value={crowd}
                onChange={e => setCrowd(+e.target.value)}
                className="w-full h-1.5 rounded accent-blue-600"
              />
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Corridor Event Duration
                </label>
                <span className="text-sm font-bold text-gray-900">{duration} mins</span>
              </div>
              <input
                type="range" min={30} max={480} step={30} value={duration}
                onChange={e => setDuration(+e.target.value)}
                className="w-full h-1.5 rounded accent-blue-600"
              />
            </div>

            {/* Route closure toggle */}
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-gray-700 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-gray-400" />
                Complete Node Route Closure (Full Cordon)
              </label>
              <button
                onClick={() => setClosure(!closure)}
                className={`relative w-11 h-6 rounded-full transition-colors ${closure ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${closure ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Results */}
            <div className="border-t border-gray-100 pt-5 grid grid-cols-2 gap-5">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Projections Delay</div>
                <div className="text-sm font-bold text-gray-900">
                  34m <ArrowRight className="w-3.5 h-3.5 inline text-green-500 mx-0.5" />
                  <span className="text-green-600">{projected.delay} mins</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Delay divergence index</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">LP Police Deployment</div>
                <div className="text-sm font-bold text-gray-900">
                  12 units <ArrowRight className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" />
                  <span className="text-blue-600">{projected.police} officers</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Personnel delta: +{projected.police - 12} units</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
