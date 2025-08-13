import { Router, Response, Request } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const router = Router();

// Color palette for consistent avatar generation
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#84cc16', '#f97316', '#3b82f6'
];

// Generate consistent color based on ID
function generateAvatarColor(id: string): string {
  const hash = crypto.createHash('md5').update(id).digest('hex');
  const colorIndex = parseInt(hash.substring(0, 2), 16) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

// Generate initials from ID (fallback method)
function generateInitials(id: string): string {
  if (!id) return 'U';
  
  // If ID is numeric, use 'U' + last digit
  if (/^\d+$/.test(id)) {
    return `U${id.slice(-1)}`;
  }
  
  // If ID has letters, use first two letters
  const letters = id.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (letters.length >= 2) {
    return letters.substring(0, 2);
  } else if (letters.length === 1) {
    return letters + id.slice(-1);
  }
  
  // Fallback
  return 'U' + (id.length % 10);
}

// GET /api/placeholder/avatar/:id - Generate SVG avatar
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const avatarId = req.params.id;
    const size = parseInt(req.query.size as string) || 40;
    const format = (req.query.format as string) || 'svg';
    
    logger.debug(`Generating avatar for ID: ${avatarId}, size: ${size}, format: ${format}`);
    
    if (format === 'redirect') {
      // Redirect to external avatar service
      const avatarSeed = `user-${avatarId}`;
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=random&size=${size}`;
      res.redirect(avatarUrl);
      return;
    }
    
    // Generate SVG locally
    const initials = generateInitials(avatarId);
    const backgroundColor = generateAvatarColor(avatarId);
    const textColor = '#ffffff';
    const fontSize = Math.max(12, size * 0.4);
    
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${fontSize}" 
              font-weight="500" 
              fill="${textColor}">
          ${initials}
        </text>
      </svg>
    `;
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('ETag', crypto.createHash('md5').update(`${avatarId}-${size}`).digest('hex'));
    
    res.send(svg.trim());
    
  } catch (error) {
    logger.error('Error generating avatar:', error);
    
    // Return a default avatar on error
    const defaultSize = 40;
    const defaultSvg = `
      <svg width="${defaultSize}" height="${defaultSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#6b7280"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
              font-family="system-ui" font-size="16" font-weight="500" fill="white">
          ?
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(defaultSvg.trim());
  }
});

// GET /api/placeholder/avatar/:id/png - Generate PNG avatar (redirect to service)
router.get('/:id/png', (req: Request, res: Response): void => {
  try {
    const avatarId = req.params.id;
    const size = parseInt(req.query.size as string) || 40;
    
    logger.debug(`Generating PNG avatar for ID: ${avatarId}, size: ${size}`);
    
    // Redirect to external PNG generation service
    const avatarSeed = `user-${avatarId}`;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${avatarSeed}&backgroundColor=random&size=${size}`;
    
    res.redirect(avatarUrl);
    
  } catch (error) {
    logger.error('Error generating PNG avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PNG avatar',
      fallback: `/api/placeholder/avatar/${req.params.id}?format=svg`
    });
  }
});

// GET /api/placeholder/avatar/:id/info - Get avatar information
router.get('/:id/info', (req: Request, res: Response): void => {
  try {
    const avatarId = req.params.id;
    const initials = generateInitials(avatarId);
    const backgroundColor = generateAvatarColor(avatarId);
    
    const avatarInfo = {
      id: avatarId,
      initials,
      backgroundColor,
      textColor: '#ffffff',
      availableFormats: ['svg', 'png'],
      availableSizes: [24, 32, 40, 48, 64, 80, 96, 128],
      urls: {
        svg: `/api/placeholder/avatar/${avatarId}`,
        png: `/api/placeholder/avatar/${avatarId}/png`,
        redirect: `/api/placeholder/avatar/${avatarId}?format=redirect`
      },
      examples: {
        small: `/api/placeholder/avatar/${avatarId}?size=24`,
        medium: `/api/placeholder/avatar/${avatarId}?size=40`,
        large: `/api/placeholder/avatar/${avatarId}?size=64`
      }
    };
    
    res.json({
      success: true,
      data: avatarInfo,
      message: `Avatar information for ID: ${avatarId}`
    });
    
  } catch (error) {
    logger.error('Error getting avatar info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get avatar information'
    });
  }
});

// GET /api/placeholder/avatar - List available avatar options
router.get('/', (req: Request, res: Response): void => {
  const documentation = {
    success: true,
    message: 'Avatar placeholder API',
    endpoints: {
      'GET /api/placeholder/avatar/:id': {
        description: 'Generate SVG avatar for user ID',
        parameters: {
          id: 'User ID (required)',
          size: 'Avatar size in pixels (optional, default: 40)',
          format: 'Output format: "svg" or "redirect" (optional, default: "svg")'
        },
        examples: [
          '/api/placeholder/avatar/1',
          '/api/placeholder/avatar/1?size=64',
          '/api/placeholder/avatar/user123?format=redirect'
        ]
      },
      'GET /api/placeholder/avatar/:id/png': {
        description: 'Redirect to PNG avatar service',
        parameters: {
          id: 'User ID (required)',
          size: 'Avatar size in pixels (optional, default: 40)'
        },
        examples: [
          '/api/placeholder/avatar/1/png',
          '/api/placeholder/avatar/1/png?size=64'
        ]
      },
      'GET /api/placeholder/avatar/:id/info': {
        description: 'Get avatar information and available URLs',
        parameters: {
          id: 'User ID (required)'
        },
        examples: [
          '/api/placeholder/avatar/1/info',
          '/api/placeholder/avatar/user123/info'
        ]
      }
    },
    features: [
      'Consistent colors based on user ID',
      'Generated initials from user ID',
      'SVG and PNG format support',
      'Configurable sizes',
      'Caching headers for performance',
      'Fallback error handling'
    ],
    colors: AVATAR_COLORS,
    defaultSize: 40,
    supportedSizes: [24, 32, 40, 48, 64, 80, 96, 128]
  };
  
  res.json(documentation);
});

export { router as avatarRoutes };