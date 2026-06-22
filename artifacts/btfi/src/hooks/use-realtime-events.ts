import { useState, useEffect, useRef } from "react";
import type { TrafficEvent } from "@workspace/api-client-react";

type WsMessage =
  | { type: "events"; payload: TrafficEvent[] }
  | { type: "event_update"; payload: TrafficEvent };

const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

/**
 * Maintains a live WebSocket connection to /api/ws and returns the latest
 * event list. Falls back gracefully if the browser doesn't support WS or
 * the connection fails — callers can pass `seedEvents` from a REST query
 * to populate the list before the first WS push arrives.
 */
export function useRealtimeEvents(seedEvents: TrafficEvent[] = []) {
  const [events, setEvents] = useState<TrafficEvent[]>(seedEvents);
  const [connected, setConnected] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!seededRef.current && seedEvents.length > 0) {
      setEvents(seedEvents);
      seededRef.current = true;
    }
  }, [seedEvents]);

  useEffect(() => {
    if (typeof WebSocket === "undefined") return;

    let ws: WebSocket | null = null;
    let reconnectDelay = RECONNECT_DELAY_MS;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    function buildUrl(): string {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}/api/ws`;
    }

    function connect() {
      if (stopped) return;

      ws = new WebSocket(buildUrl());

      ws.onopen = () => {
        setConnected(true);
        reconnectDelay = RECONNECT_DELAY_MS;
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as WsMessage;
          if (msg.type === "events") {
            setEvents(msg.payload);
            seededRef.current = true;
          } else if (msg.type === "event_update") {
            setEvents((prev) =>
              prev.map((ev) => (ev.id === msg.payload.id ? msg.payload : ev)),
            );
          }
        } catch {
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!stopped) {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 1.5, MAX_RECONNECT_DELAY_MS);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return { events, connected };
}
