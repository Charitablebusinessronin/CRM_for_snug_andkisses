const express = require('express');
const router = express.Router();
const { HIPAAAuditLogger } = require('../utils/hipaa-audit-logger');

// Generate SVG Avatar
router.get('/svg/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const size = parseInt(req.query.size || '100', 10);

    await HIPAAAuditLogger.logAccess({
      userId: req.headers['x-user-id'] || 'anonymous',
      action: 'GET_AVATAR_SVG',
      resource: `/avatar/svg/${userId}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      details: { targetUserId: userId, format: 'svg', size },
    });

    const initials = userId.substring(0, 2).toUpperCase();
    const backgroundColor = generateColor(userId);

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${backgroundColor}"/>
        <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dy="0.35em" 
              font-family="Arial, sans-serif" font-size="${Math.floor(size / 3)}" fill="white">
          ${initials}
        </text>
      </svg>
    `;

    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Avatar SVG generation error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
});

// Generate PNG Avatar (placeholder -> redirect to SVG)
router.get('/png/:userId', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    res.redirect(`/avatar/svg/${req.params.userId}${qs ? `?${qs}` : ''}`);
  } catch (error) {
    console.error('Avatar PNG generation error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
});

function generateColor(userId) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

module.exports = router;
