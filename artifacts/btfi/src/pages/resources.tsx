import { useState } from "react";
import { useOptimizeResources } from "@workspace/api-client-react";
import { Users, Shield, MapPin, RefreshCw, Send, CheckCircle } from "lucide-react";

export default function Resources() {
  const [result, setResult] = useState<any>(null);
  const [transmitted, setTransmitted] = useState(false);
  const optimize = useOptimizeResources();

  const run = () => {
    optimize.mutate(
      { data: { crowdSize: 5800, roadClosed: true, severity: "High" } },
      { onSuccess: (d) => setResult(d) }
    );
  };

  const constables = result?.police ?? 77;
  const marshals = result?.marshals ?? 59;
  const barricades = result?.barricades ?? 399;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Linear LP Resource Deployer</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Determine constable dispatch levels and equipment positions prioritizing bottlenecks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Deployments */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-base font-bold text-gray-900">AI-Recommended Asset Deployments</div>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-slate-200">
              LP/ILP OPTIMIZED
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">BTP PATROL CONSTABLES</div>
              <div className="text-4xl font-bold text-gray-900">{constables}</div>
              <div className="text-[11px] text-gray-400 mt-1">Full-gear dispatch</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">CIVILIAN MARSHALS</div>
              <div className="text-4xl font-bold text-gray-900">{marshals}</div>
              <div className="text-[11px] text-gray-400 mt-1">NMT lanes control</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">BARRICADES (METERS)</div>
              <div className="text-4xl font-bold text-gray-900">{barricades}m</div>
              <div className="text-[11px] text-gray-400 mt-1">High-reflectivity barriers</div>
            </div>
          </div>

          {/* Spatial channels */}
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
              SPATIAL DEPLOYMENT PRIORITY CHANNELS
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">Critical Ju.</div>
                <div className="text-lg font-bold text-gray-900">35</div>
                <div className="text-[10px] text-gray-500">units</div>
                <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-red-500 h-1 rounded-full" style={{ width: "45%" }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">(45%)</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">Event Peri.</div>
                <div className="text-lg font-bold text-gray-900">27</div>
                <div className="text-[10px] text-gray-500">units</div>
                <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">(35%)</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">Active Dive.</div>
                <div className="text-lg font-bold text-gray-900">15</div>
                <div className="text-[10px] text-gray-500">units</div>
                <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: "20%" }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">(20%)</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={run}
              disabled={optimize.isPending}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${optimize.isPending ? "animate-spin" : ""}`} />
              Reroll LP solver
            </button>
            <button
              onClick={() => setTransmitted(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 rounded-lg text-sm font-semibold text-white hover:bg-gray-800 transition-colors flex-1 justify-center"
            >
              <Send className="w-4 h-4" />
              {transmitted ? "Orders Transmitted" : "Transmit deployment orders"}
            </button>
          </div>
          {transmitted && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="w-3.5 h-3.5" /> Deployment orders sent to all BTP units
            </div>
          )}
        </div>

        {/* Right: Checklist */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-base font-bold text-gray-900 mb-2">Dispatch Command Checklist</div>
          <div className="text-sm text-gray-500 mb-5">
            Always double-checks line barriers and marshal positions before authorizing BTP dispatch commands.
            Secure links must verify:
          </div>
          <ol className="space-y-4 mb-8">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
              <span className="text-sm text-gray-700">
                Line barricades must be placed in interlocking patterns at 1.5m intervals.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
              <span className="text-sm text-gray-700">
                Civilian marshals should handle pedestrian crossing gates only.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
              <span className="text-sm text-gray-700">
                BTP patrol vehicles should keep outbound escape arteries unrestricted.
              </span>
            </li>
          </ol>

          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">
              AUTHENTICATED // BENGALURU TRAFFIC DEPARTMENT // OFFICE CLERK PROTOCOLS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
