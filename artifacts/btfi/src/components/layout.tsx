import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MapPin,
  Brain,
  TrendingUp,
  Users,
  Navigation,
  FileText,
  Settings,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-traffic", label: "Live Traffic", icon: MapPin },
  { href: "/event-intelligence", label: "Event Intelligence", icon: Brain },
  { href: "/congestion", label: "Congestion Forecast", icon: TrendingUp },
  { href: "/resources", label: "Resource Planner", icon: Users },
  { href: "/diversion", label: "Diversion Center", icon: Navigation },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-56 shrink-0 bg-[#0b1120] flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-[#1e2d45]">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">BTFI</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">
            Bengaluru Traffic Police
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-[#1e2d45] hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[#1e2d45]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wide">System Online</span>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight">
            Bengaluru Traffic Flow Intelligence (BTFI)
          </div>
          <div className="text-[11px] text-gray-500 leading-tight">
            Smart City Traffic Operations Command Unit
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          NORMAL OPS
        </div>
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800 leading-tight">Officer K. Kumar</div>
            <div className="text-[10px] text-gray-500 leading-tight">Traffic Control Ops, BTP</div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
