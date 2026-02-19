const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Service Worker - no cache so updates propagate immediately
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Manifest
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Icons - match icon-192.png, icon-512.png
app.get('/icon-:size.png', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=604800');
  res.sendFile(path.join(__dirname, 'public', `icon-${req.params.size}.png`));
});

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌙 Ramadhan Planner running at http://localhost:${PORT}`);
  });
}

module.exports = app;
