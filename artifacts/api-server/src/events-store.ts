import { logger } from "./lib/logger";

export interface TrafficEvent {
  id: string;
  eventType: string;
  location: string;
  status: string;
  priority: string;
  startTime: string;
  impactScore: number;
  description?: string | null;
}

export const events: TrafficEvent[] = [
  {
    id: "EVT-001",
    eventType: "political_rally",
    location: "MG Road, Bengaluru",
    status: "active",
    priority: "High",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    impactScore: 87,
    description: "Mass political rally with road closures",
  },
  {
    id: "EVT-002",
    eventType: "vehicle_breakdown",
    location: "Silk Board Junction, ORR East",
    status: "active",
    priority: "High",
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    impactScore: 62,
    description: "Heavy vehicle breakdown blocking 2 lanes",
  },
  {
    id: "EVT-003",
    eventType: "accident",
    location: "Hebbal Flyover, Bengaluru",
    status: "resolved",
    priority: "High",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    impactScore: 74,
    description: "Multi-vehicle accident, cleared",
  },
  {
    id: "EVT-004",
    eventType: "water_logging",
    location: "Whitefield Main Road",
    status: "active",
    priority: "High",
    startTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    impactScore: 55,
    description: "Heavy waterlogging after monsoon rains",
  },
  {
    id: "EVT-005",
    eventType: "public_event",
    location: "M Chinnaswamy Stadium, CBD",
    status: "resolved",
    priority: "High",
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    impactScore: 91,
    description: "IPL cricket match, post-event dispersal",
  },
  {
    id: "EVT-006",
    eventType: "tree_fall",
    location: "Sankey Road, Sadashivanagar",
    status: "closed",
    priority: "Low",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    impactScore: 30,
    description: "Tree fell blocking one lane, removed",
  },
  {
    id: "EVT-007",
    eventType: "pot_holes",
    location: "Old Madras Road, Halasuru",
    status: "active",
    priority: "High",
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    impactScore: 45,
    description: "Severe pothole causing traffic slowdown",
  },
];

type BroadcastFn = (data: string) => void;
let _broadcast: BroadcastFn | null = null;

export function setBroadcaster(fn: BroadcastFn): void {
  _broadcast = fn;
}

function broadcastEvents(): void {
  if (!_broadcast) return;
  _broadcast(JSON.stringify({ type: "events", payload: events }));
}

const DRIFT = 4;

function tick(): void {
  const active = events.filter((e) => e.status === "active");
  if (active.length === 0) return;

  const target = active[Math.floor(Math.random() * active.length)];
  const delta = Math.floor(Math.random() * (DRIFT * 2 + 1)) - DRIFT;
  target.impactScore = Math.max(10, Math.min(100, target.impactScore + delta));

  logger.debug(
    { id: target.id, impactScore: target.impactScore },
    "Event score ticked",
  );

  broadcastEvents();
}

setInterval(tick, 8_000);
