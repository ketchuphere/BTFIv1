---
name: WebSocket real-time push pattern
description: How WS is wired in this Express/Vite monorepo on Replit — attach point, URL construction, reconnect logic.
---

## Rule
Attach the `ws` WebSocketServer to `http.createServer(app)`, NOT `app.listen()`. Express 5 returns a `Server` from `listen()` but you can't intercept the upgrade event before listening starts — create the server first, attach WS, then call `server.listen()`.

**Why:** `ws` needs to intercept the HTTP `upgrade` event on the Node `Server` instance. If you pass `{ server }` to `WebSocketServer` after `app.listen()` has already started, the upgrade handler may miss early connections.

**How to apply:** Always follow the pattern in `artifacts/api-server/src/index.ts`:
```ts
const server = createServer(app);
attachWs(server);   // registers upgrade handler BEFORE listen
server.listen(port, callback);
```

## WebSocket URL in browser
```ts
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const url = `${protocol}//${window.location.host}/api/ws`;
```
The Replit path-based proxy routes `/api/*` HTTP and WS upgrades to the Express server on port 8080. No special Vite proxy config needed.

## Reconnect hook pattern
`useRealtimeEvents` in `artifacts/btfi/src/hooks/use-realtime-events.ts`:
- Seeds from a REST query (one-time) so the list is populated before the first WS push.
- Exponential backoff (3s → 30s max) on disconnect.
- `seededRef` prevents the seed from overwriting live WS data on re-render.

## esbuild externals
`bufferutil` and `utf-8-validate` (optional native deps of `ws`) are already in the `external` list in `artifacts/api-server/build.mjs` — no extra config needed.
