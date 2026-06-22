import { IncomingMessage } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { events, setBroadcaster } from "./events-store";
import { logger } from "./lib/logger";

let wss: WebSocketServer | null = null;

export function attachWs(server: Server): void {
  wss = new WebSocketServer({ server, path: "/api/ws" });

  setBroadcaster((data: string) => {
    if (!wss) return;
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    logger.info({ ip: req.socket.remoteAddress }, "WS client connected");

    ws.send(JSON.stringify({ type: "events", payload: events }));

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 25_000);

    ws.on("pong", () => {});

    ws.on("close", () => {
      clearInterval(ping);
      logger.info({ ip: req.socket.remoteAddress }, "WS client disconnected");
    });

    ws.on("error", (err) => {
      clearInterval(ping);
      logger.warn({ err }, "WS client error");
    });
  });

  logger.info("WebSocket server attached at /api/ws");
}
