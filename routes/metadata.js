import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = match ? match[1].trim() : 'Untitled';

    res.json({ title, url });
  } catch (error) {
    res.json({ title: 'Untitled', url: req.query.url });
  }
});

export default router;
