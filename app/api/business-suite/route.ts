/**
 * Business Suite API Router
 * Unified API endpoint for all business modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { businessSuite } from '@/lib/catalyst-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const action = searchParams.get('action');

    switch (module) {
      case 'dashboard':
        if (action === 'metrics') {
          const metrics = await businessSuite.getDashboardMetrics();
          return NextResponse.json({
            status: 'success',
            data: metrics
          });
        }
        break;

      case 'crm':
        if (action === 'customers') {
          const customers = await businessSuite.getCustomers(50);
          return NextResponse.json({
            status: 'success',
            data: customers
          });
        }
        break;

      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid module or action'
        }, { status: 400 });
    }

    return NextResponse.json({
      status: 'error',
      message: 'Action not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Business Suite API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const body = await request.json();

    switch (module) {
      case 'crm':
        if (action === 'create-customer') {
          const customer = await businessSuite.createCustomer(body);
          return NextResponse.json({
            status: 'success',
            data: customer
          });
        }
        if (action === 'create-deal') {
          const deal = await businessSuite.createDeal(body);
          return NextResponse.json({
            status: 'success',
            data: deal
          });
        }
        break;

      case 'support':
        if (action === 'create-ticket') {
          const ticket = await businessSuite.createSupportTicket(body);
          return NextResponse.json({
            status: 'success',
            data: ticket
          });
        }
        break;

      case 'finance':
        if (action === 'create-invoice') {
          const invoice = await businessSuite.createInvoice(body);
          return NextResponse.json({
            status: 'success',
            data: invoice
          });
        }
        break;

      case 'hr':
        if (action === 'create-employee') {
          const employee = await businessSuite.createEmployee(body);
          return NextResponse.json({
            status: 'success',
            data: employee
          });
        }
        break;

      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid module or action'
        }, { status: 400 });
    }

    return NextResponse.json({
      status: 'error',
      message: 'Action not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Business Suite API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}