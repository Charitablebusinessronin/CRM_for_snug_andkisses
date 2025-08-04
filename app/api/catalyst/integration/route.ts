/**
 * Catalyst Business Suite Integration API
 * Handles CRM, Marketing, Support, Finance, and HR modules
 */

import { NextRequest, NextResponse } from 'next/server'
import { BusinessSuiteAPI } from '@/lib/catalyst-client'
import { logAuditEvent } from '@/lib/hipaa-audit-edge'

const businessSuite = new BusinessSuiteAPI()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    const action = searchParams.get('action')
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Log access for HIPAA compliance
    await logAuditEvent({
      action: `CATALYST_${module?.toUpperCase()}_${action?.toUpperCase()}`,
      resource: `/api/catalyst/integration`,
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'catalyst-integration',
      request_id: crypto.randomUUID(),
      result: 'success'
    })

    switch (module) {
      case 'crm':
        return await handleCRMRequest(action, searchParams, userId)
      
      case 'marketing':
        return await handleMarketingRequest(action, searchParams, userId)
      
      case 'support':
        return await handleSupportRequest(action, searchParams, userId)
      
      case 'finance':
        return await handleFinanceRequest(action, searchParams, userId)
      
      case 'hr':
        return await handleHRRequest(action, searchParams, userId)
      
      case 'dashboard':
        return await handleDashboardRequest(action, searchParams, userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid module specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Catalyst integration error:', error)
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CATALYST_INTEGRATION_ERROR',
      resource: '/api/catalyst/integration',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'catalyst-integration',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { module, action, data } = body
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Log access for HIPAA compliance
    await logAuditEvent({
      action: `CATALYST_${module?.toUpperCase()}_CREATE`,
      resource: `/api/catalyst/integration`,
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'catalyst-integration',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { module, action }
    })

    switch (module) {
      case 'crm':
        return await handleCRMCreation(action, data, userId)
      
      case 'support':
        return await handleSupportCreation(action, data, userId)
      
      case 'finance':
        return await handleFinanceCreation(action, data, userId)
      
      case 'hr':
        return await handleHRCreation(action, data, userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid module for creation' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Catalyst creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// CRM Module Handlers
async function handleCRMRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'list-customers':
      const limit = parseInt(params.get('limit') || '50')
      const customers = await businessSuite.getCustomers(limit)
      return NextResponse.json({ customers })
    
    case 'get-dashboard':
      const metrics = await businessSuite.getDashboardMetrics()
      return NextResponse.json({ metrics })
    
    default:
      return NextResponse.json(
        { error: 'Invalid CRM action' },
        { status: 400 }
      )
  }
}

async function handleCRMCreation(action: string, data: any, userId: string) {
  switch (action) {
    case 'create-customer':
      const customer = await businessSuite.createCustomer(data)
      return NextResponse.json({ customer })
    
    case 'create-deal':
      const deal = await businessSuite.createDeal(data)
      return NextResponse.json({ deal })
    
    default:
      return NextResponse.json(
        { error: 'Invalid CRM creation action' },
        { status: 400 }
      )
  }
}

// Support Module Handlers
async function handleSupportRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'list-tickets':
      // This would integrate with Catalyst data store
      return NextResponse.json({ 
        tickets: [],
        message: 'Support tickets integration ready' 
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Support action' },
        { status: 400 }
      )
  }
}

async function handleSupportCreation(action: string, data: any, userId: string) {
  switch (action) {
    case 'create-ticket':
      const ticket = await businessSuite.createSupportTicket(data)
      return NextResponse.json({ ticket })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Support creation action' },
        { status: 400 }
      )
  }
}

// Finance Module Handlers
async function handleFinanceRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'list-invoices':
      return NextResponse.json({ 
        invoices: [],
        message: 'Finance module integration ready' 
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Finance action' },
        { status: 400 }
      )
  }
}

async function handleFinanceCreation(action: string, data: any, userId: string) {
  switch (action) {
    case 'create-invoice':
      const invoice = await businessSuite.createInvoice(data)
      return NextResponse.json({ invoice })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Finance creation action' },
        { status: 400 }
      )
  }
}

// HR Module Handlers
async function handleHRRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'list-employees':
      return NextResponse.json({ 
        employees: [],
        message: 'HR module integration ready' 
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid HR action' },
        { status: 400 }
      )
  }
}

async function handleHRCreation(action: string, data: any, userId: string) {
  switch (action) {
    case 'create-employee':
      const employee = await businessSuite.createEmployee(data)
      return NextResponse.json({ employee })
    
    default:
      return NextResponse.json(
        { error: 'Invalid HR creation action' },
        { status: 400 }
      )
  }
}

// Marketing Module Handlers
async function handleMarketingRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'list-campaigns':
      return NextResponse.json({ 
        campaigns: [],
        message: 'Marketing automation integration ready' 
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Marketing action' },
        { status: 400 }
      )
  }
}

// Dashboard Module Handlers
async function handleDashboardRequest(action: string | null, params: URLSearchParams, userId: string) {
  switch (action) {
    case 'get-metrics':
      const dashboardMetrics = await businessSuite.getDashboardMetrics()
      return NextResponse.json({ 
        metrics: dashboardMetrics,
        timestamp: new Date().toISOString(),
        status: 'active'
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid Dashboard action' },
        { status: 400 }
      )
  }
}