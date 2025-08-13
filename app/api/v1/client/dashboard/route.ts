import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-enhanced';
import ZohoAuth from '@/lib/zoho/auth';
import { booksHours } from '@/lib/zoho/books-hours';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client data from Zoho CRM
    const clientData = await getClientData(session.user.id);
    
    // Calculate hour balance from Books/CRM
    const hourBalance = await calculateHourBalance(clientData.zohoContactId || session.user.id);
    
    // Get active services from CRM
    const activeServices = await getActiveServices(clientData.zohoContactId || session.user.id);

    return NextResponse.json({
      success: true,
      client: clientData,
      hourBalance,
      activeServices,
      recentActivity: await getRecentActivity(session.user.id),
      upcomingAppointments: await getUpcomingAppointments(session.user.id)
    });

  } catch (error: any) {
    console.error('Client dashboard error:', error);
    
    return NextResponse.json({
      error: 'Failed to load dashboard data',
      details: error.message
    }, { status: 500 });
  }
}

async function getClientData(clientId: string) {
  // Lookup Zoho Contact by external portal user id or email stored in session
  // Fallback to mock shape if not found
  try {
    const auth = new ZohoAuth()
    const token = await auth.getAccessToken()
    const crmBase = process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v2'
    // Try search by External_Id (custom) equals clientId; adjust field as needed
    const criteria = encodeURIComponent(`External_Id:equals:${clientId}`)
    const res = await fetch(`${crmBase}/Contacts/search?criteria=${criteria}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      const contact = data.data?.[0]
      if (contact) {
        return {
          id: clientId,
          zohoContactId: contact.id,
          name: `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim() || 'Client',
          email: contact.Email || 'client@example.com',
          status: contact.Client_Status || 'Active',
          joinDate: contact.Created_Time || new Date().toISOString(),
        }
      }
    }
  } catch {}
  return {
    id: clientId,
    zohoContactId: undefined,
    name: 'Client Name',
    email: 'client@example.com',
    status: 'Active',
    joinDate: new Date().toISOString(),
  }
}

async function calculateHourBalance(zohoContactId: string) {
  const hours = await booksHours.getClientServiceHours(zohoContactId)
  return {
    totalHours: hours.total,
    usedHours: hours.used,
    remainingHours: hours.remaining,
    nextBillingCycle: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

async function getActiveServices(zohoContactId: string) {
  try {
    const auth = new ZohoAuth()
    const token = await auth.getAccessToken()
    const crmBase = process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v2'
    // Assuming a custom module or Deals used as Services; filter open/in progress linked to contact
    const criteria = encodeURIComponent(`(Contact_Name:equals:${zohoContactId}) and (Stage:in:Qualification,Negotiation,Implementation,Delivery)`)
    const res = await fetch(`${crmBase}/Deals/search?criteria=${criteria}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      return (data.data || []).map((d: any) => ({
        id: d.id,
        name: d.Deal_Name || d.Service_Type || 'Service',
        type: 'ongoing',
        startDate: d.Expected_Start_Date || d.Created_Time || new Date().toISOString(),
        endDate: d.Expected_End_Date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        hoursAllocated: Number(d.Hours_Allocated || 0),
        hoursUsed: Number(d.Hours_Used || 0),
      }))
    }
  } catch {}
  return []
}

async function getRecentActivity(clientId: string) {
  // This would query Zoho CRM for recent activities
  return [
    {
      id: 'activity_001',
      type: 'appointment_scheduled',
      description: 'Appointment scheduled for tomorrow',
      timestamp: new Date().toISOString()
    }
  ];
}

async function getUpcomingAppointments(zohoContactId: string) {
  try {
    const auth = new ZohoAuth()
    const token = await auth.getAccessToken()
    const bookingsBase = process.env.ZOHO_BOOKINGS_API_URL || 'https://bookings.zoho.com/api/v1'
    const res = await fetch(`${bookingsBase}/appointments?client_id=${encodeURIComponent(zohoContactId)}&status=scheduled`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      return (data.appointments || []).map((a: any) => ({
        id: a.id,
        date: a.appointment_date,
        time: a.start_time,
        service: a.service_name || a.service_id,
        provider: a.staff_name || a.staff_id,
      }))
    }
  } catch {}
  return []
}