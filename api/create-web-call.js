/**
 * Vercel Serverless Function — POST /api/create-web-call
 *
 * Creates a Retell web call and returns the access token.
 * Environment variables RETELL_API_KEY and RETELL_AGENT_ID
 * must be set in the Vercel project settings.
 */

import Retell from 'retell-sdk';

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webCallResponse = await retell.call.createWebCall({
      agent_id: process.env.RETELL_AGENT_ID,
    });

    return res.status(200).json({ access_token: webCallResponse.access_token });
  } catch (err) {
    console.error('Retell createWebCall error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create web call' });
  }
}
