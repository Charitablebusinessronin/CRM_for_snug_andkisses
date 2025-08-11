import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'client') {
      return NextResponse.json(
        { error: 'Unauthorized - Client access required' }, 
        { status: 401 }
      )
    }

    // Mock client dashboard data - replace with actual database queries
    const dashboardData = {
      client: {
        id: session.user.id,
        name: session.user.name || 'Client User',
        email: session.user.email,
        phone: '+1 (555) 123-4567',
        memberSince: '2024-01-15',
        hourBalance: 24.5
      },
      serviceRequests: [
        {
          id: '1',
          type: 'Postpartum Care',
          status: 'in-progress',
          hoursAllocated: 40,
          hoursUsed: 15.5,
          startDate: '2024-02-01',
          provider: {
            name: 'Maria Rodriguez',
            avatar: '/api/placeholder/avatar/1'
          }
        },
        {
          id: '2', 
          type: 'Lactation Support',
          status: 'completed',
          hoursAllocated: 6,
          hoursUsed: 6,
          startDate: '2024-01-20',
          provider: {
            name: 'Jennifer Smith',
            avatar: '/api/placeholder/avatar/2'
          }
        }
      ],
      hourTransactions: [
        {
          id: '1',
          date: '2024-02-05',
          hours: -4,
          type: 'used',
          description: 'Postpartum care session',
          provider: 'Maria Rodriguez'
        },
        {
          id: '2', 
          date: '2024-02-01',
          hours: 40,
          type: 'purchased',
          description: 'Initial hour package purchase'
        },
        {
          id: '3',
          date: '2024-01-25',
          hours: -2,
          type: 'used', 
          description: 'Lactation consultation',
          provider: 'Jennifer Smith'
        }
      ],
      workflowPhases: [
        {
          id: 1,
          name: 'Initial Inquiry',
          status: 'completed',
          description: 'Service request submitted and reviewed'
        },
        {
          id: 2,
          name: 'Consultation Scheduled',
          status: 'completed', 
          description: 'Initial consultation appointment confirmed'
        },
        {
          id: 3,
          name: 'Provider Matching',
          status: 'completed',
          description: 'Matched with qualified care provider'
        },
        {
          id: 4,
          name: 'Contract Signing',
          status: 'current',
          description: 'Review and sign service agreements',
          dueDate: '2024-02-10'
        },
        {
          id: 5,
          name: 'Service Delivery',
          status: 'pending',
          description: 'Begin receiving care services'
        }
      ]
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Client dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Purchase additional hours
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'client') {
      return NextResponse.json(
        { error: 'Unauthorized - Client access required' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, hours, paymentInfo } = body

    if (action === 'purchase_hours') {
      // Mock hour purchase logic - replace with actual payment processing
      const transaction = {
        id: `txn_${Date.now()}`,
        clientId: session.user.id,
        hours: parseInt(hours),
        amount: parseInt(hours) * 50, // $50 per hour
        paymentMethod: paymentInfo.method,
        status: 'completed',
        createdAt: new Date().toISOString()
      }

      // Here you would:
      // 1. Process payment with Stripe/payment processor
      // 2. Update client hour balance in database
      // 3. Create transaction record
      // 4. Send confirmation email
      // 5. Log for HIPAA audit trail

      return NextResponse.json({
        success: true,
        transaction,
        newBalance: 24.5 + parseInt(hours), // Mock new balance
        message: `Successfully purchased ${hours} hours`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' }, 
      { status: 400 }
    )

  } catch (error) {
    console.error('Client dashboard POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}