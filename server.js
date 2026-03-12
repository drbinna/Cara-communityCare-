/**
 * Cara · CommunityCare — Backend Server
 *
 * Tiny Express server that creates Retell web-calls.
 * The RETELL_API_KEY stays server-side (never exposed to the browser).
 *
 * Endpoints:
 *   POST /api/create-web-call  →  { access_token }
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Retell from 'retell-sdk';

const app = express();
app.use(cors());
app.use(express.json());

// ── Retell client (server-side only) ──
const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });

// ── Create a web call ──
app.post('/api/create-web-call', async (_req, res) => {
  try {
    const webCallResponse = await retell.call.createWebCall({
      agent_id: process.env.RETELL_AGENT_ID,
    });

    res.json({ access_token: webCallResponse.access_token });
  } catch (err) {
    console.error('Retell createWebCall error:', err);
    res.status(500).json({ error: err.message || 'Failed to create web call' });
  }
});

// ── Health check ──
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ──
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅  Cara backend running on http://localhost:${PORT}`);
});
