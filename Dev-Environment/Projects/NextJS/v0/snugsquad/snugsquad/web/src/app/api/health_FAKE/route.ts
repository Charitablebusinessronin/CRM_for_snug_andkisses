import { NextRequest, NextResponse } from 'next/server';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected';
    auth: 'available' | 'unavailable';
    catalyst: 'available' | 'unavailable';
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Check database connectivity (Zoho CRM)
    const databaseStatus = await checkDatabase();
    
    // Check auth service
    const authStatus = await checkAuth();
    
    // Check Catalyst functions
    const catalystStatus = await checkCatalyst();
    
    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseStatus,
        auth: authStatus,
        catalyst: catalystStatus,
      },
      performance: {
        responseTime,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
      },
    };
    
    // Determine overall health
    const allServicesHealthy = Object.values(healthResult.services).every(
      status => status === 'connected' || status === 'available'
    );
    
    if (!allServicesHealthy) {
      healthResult.status = 'unhealthy';
    }
    
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthResult, { status: statusCode });
    
  } catch (error) {
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'disconnected',
        auth: 'unavailable',
        catalyst: 'unavailable',
      },
      performance: {
        responseTime: Date.now() - startTime,
        memoryUsage: 0,
      },
    };
    
    return NextResponse.json(errorResult, { status: 503 });
  }
}

async function checkDatabase(): Promise<'connected' | 'disconnected'> {
  try {
    // Placeholder for Zoho CRM connectivity check
    // In real implementation, this would make a lightweight API call to Zoho CRM
    const response = await fetch(`https://www.zohoapis.com/crm/v3/org`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (response.ok) {
      return 'connected';
    } else {
      return 'disconnected';
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'disconnected';
  }
}

async function checkAuth(): Promise<'available' | 'unavailable'> {
  try {
    // Check if Catalyst Embedded Auth is responding
    const authDomain = process.env.NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_DOMAIN;
    if (!authDomain) {
      return 'unavailable';
    }
    
    const response = await fetch(`https://${authDomain}/auth/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok ? 'available' : 'unavailable';
  } catch (error) {
    console.error('Auth health check failed:', error);
    return 'unavailable';
  }
}

async function checkCatalyst(): Promise<'available' | 'unavailable'> {
  try {
    // Check Catalyst functions availability
    const projectId = process.env.CATALYST_PROJECT_ID;
    if (!projectId) {
      return 'unavailable';
    }
    
    const response = await fetch(`https://${projectId}.catalyst.zoho.com/baas/v1/functions/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok ? 'available' : 'unavailable';
  } catch (error) {
    console.error('Catalyst health check failed:', error);
    return 'unavailable';
  }
}
