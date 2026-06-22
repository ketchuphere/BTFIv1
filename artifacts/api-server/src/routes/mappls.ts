import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

router.get("/mappls/token", async (req, res) => {
  const clientId = process.env.MAPPLS_CLIENT_ID;
  const clientSecret = process.env.MAPPLS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(503).json({ error: "Mappls OAuth credentials not configured on server" });
    return;
  }

  if (cache && Date.now() < cache.expiresAt) {
    res.json({ token: cache.token });
    return;
  }

  try {
    const response = await fetch(
      "https://outpost.mappls.com/api/security/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      req.log.error({ status: response.status, body: text }, "Mappls token exchange failed");
      res.status(502).json({ error: "Mappls token exchange failed" });
      return;
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    const expiresIn = data.expires_in ?? 21600;
    cache = {
      token: data.access_token,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    req.log.info({ expiresIn }, "Mappls token refreshed");
    res.json({ token: cache.token });
  } catch (err) {
    req.log.error({ err }, "Mappls token fetch error");
    res.status(502).json({ error: "Failed to reach Mappls auth server" });
  }
});

export default router;
