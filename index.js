const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// Helper to send static file
const send = (file, headers = {}) => (req, res) => {
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.sendFile(path.join(PUBLIC, file));
};

// Service Worker — must be no-cache for updates to work
app.get('/sw.js', send('sw.js', {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Content-Type': 'application/javascript',
  'Service-Worker-Allowed': '/'
}));

// Manifest
app.get('/manifest.json', send('manifest.json', {
  'Content-Type': 'application/manifest+json; charset=utf-8',
  'Cache-Control': 'public, max-age=86400'
}));

// Icons & screenshot
const imgHeaders = { 'Cache-Control': 'public, max-age=604800' };
app.get('/icon-192.png',          send('icon-192.png', imgHeaders));
app.get('/icon-512.png',          send('icon-512.png', imgHeaders));
app.get('/icon-192-maskable.png', send('icon-192-maskable.png', imgHeaders));
app.get('/icon-512-maskable.png', send('icon-512-maskable.png', imgHeaders));
app.get('/screenshot.png',        send('screenshot.png', imgHeaders));

// Main HTML — no-cache so users always get fresh version
app.get('/', send('index.html', {
  'Cache-Control': 'no-cache',
  'Content-Type': 'text/html; charset=utf-8'
}));

// Catch-all
app.use(express.static(PUBLIC));
app.get('*', send('index.html', { 'Cache-Control': 'no-cache' }));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌙 Ramadhan Planner → http://localhost:${PORT}`);
  });
}

module.exports = app;
