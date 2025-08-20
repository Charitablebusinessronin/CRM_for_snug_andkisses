# 📚 ZOHO API DOCUMENTATION
## Complete API Reference with Catalyst Integration
**Updated: August 2025**

---

## 🔐 AUTHENTICATION

### Catalyst Integration
All Zoho API requests are now proxied through the Catalyst backend for improved security and token management.

#### Environment Variables
```env
NEXT_PUBLIC_CATALYST_CRM_URL=https://your-catalyst-instance.com
CATALYST_AUTH_TOKEN=your_catalyst_auth_token
```

#### Request Format
All requests to Zoho APIs should be made through the Catalyst proxy endpoints:

```
GET /api/zoho/{service}?action={action}&[params]
POST /api/zoho/{service}
```

#### Available Services
- `books` - Zoho Books API
- `campaigns` - Zoho Campaigns API
- `crm` - Zoho CRM API

### Authentication Flow

1. **Client-Side Request**
   - Include auth token in headers
   - All tokens are managed by the Catalyst backend

```typescript
// Example API call using the Catalyst proxy
const response = await fetch('/api/zoho/crm?action=contacts&page=1', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});
```

2. **Error Handling**
   - 401: Unauthorized - Invalid or expired token
   - 403: Forbidden - Insufficient permissions
   - 500: Server error - Check server logs

---

## 📧 ZOHO CAMPAIGNS API

### Base URL
```
https://campaigns.zoho.com/api/v1.1
```

### Authentication Header
```javascript
Authorization: Bearer {access_token}
```

### 1. EMAIL TEMPLATES

#### Create Email Template
```javascript
POST /templates
Content-Type: application/json

{
  "template_name": "Healthcare Welcome Email",
  "template_subject": "Welcome to Snug & Kisses Healthcare",
  "template_content": "<html>...</html>",
  "template_type": "HTML",
  "hipaa_compliant": true
}
```

#### Get Email Templates
```javascript
GET /templates
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": [
    {
      "template_id": "123456789",
      "template_name": "Healthcare Welcome Email",
      "template_subject": "Welcome to Snug & Kisses Healthcare",
      "created_time": "2025-08-04T07:30:00Z",
      "modified_time": "2025-08-04T07:30:00Z"
    }
  ]
}
```

#### Update Email Template
```javascript
PUT /templates/{template_id}
Content-Type: application/json

{
  "template_name": "Updated Healthcare Welcome Email",
  "template_subject": "Welcome to Our Healthcare Services",
  "template_content": "<html>Updated content...</html>"
}
```

### 2. EMAIL CAMPAIGNS

#### Create Campaign
```javascript
POST /campaigns
Content-Type: application/json

{
  "campaign_name": "Healthcare Client Welcome Series",
  "campaign_subject": "Welcome to Snug & Kisses",
  "template_id": "123456789",
  "from_email": "noreply@snugandkisses.com",
  "from_name": "Snug & Kisses Healthcare",
  "reply_to": "support@snugandkisses.com",
  "campaign_type": "regular"
}
```

#### Send Campaign
```javascript
POST /campaigns/{campaign_id}/send
Content-Type: application/json

{
  "send_time": "immediate",
  "recipients": [
    {
      "email": "client@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "merge_fields": {
        "service_type": "Initial Consultation",
        "appointment_date": "2025-08-10"
      }
    }
  ]
}
```

#### Get Campaign Metrics
```javascript
GET /campaigns/{campaign_id}/reports
Authorization: Bearer {access_token}

Response:
{
  "campaign_id": "987654321",
  "campaign_name": "Healthcare Client Welcome Series",
  "sent": 150,
  "delivered": 148,
  "opened": 89,
  "clicked": 23,
  "bounced": 2,
  "unsubscribed": 1,
  "delivery_rate": 98.67,
  "open_rate": 60.14,
  "click_rate": 25.84
}
```

### 3. AUTOMATION WORKFLOWS

#### Create Automation
```javascript
POST /automation
Content-Type: application/json

{
  "automation_name": "Healthcare Welcome Sequence",
  "trigger": {
    "type": "api_trigger",
    "event": "client_registered"
  },
  "actions": [
    {
      "type": "send_email",
      "template_id": "123456789",
      "delay": 0
    },
    {
      "type": "send_email",
      "template_id": "123456790",
      "delay": 48
    }
  ]
}
```

#### Trigger Automation
```javascript
POST /automation/{automation_id}/trigger
Content-Type: application/json

{
  "contact_email": "client@example.com",
  "merge_fields": {
    "first_name": "John",
    "service_type": "Initial Consultation",
    "appointment_date": "2025-08-10"
  }
}
```

---

## 📅 ZOHO BOOKINGS API

### Base URL
```
https://bookings.zoho.com/api/v1
```

### 1. SERVICES MANAGEMENT

#### Create Booking Service
```javascript
POST /services
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "service_name": "Initial Health Consultation",
  "service_description": "Comprehensive initial health assessment",
  "duration": 60,
  "price": 150.00,
  "currency": "USD",
  "category": "consultation",
  "staff_required": ["nurse_practitioner"],
  "buffer_before": 15,
  "buffer_after": 15,
  "booking_policy": {
    "advance_booking_days": 30,
    "cancellation_hours": 24,
    "reschedule_hours": 12
  }
}
```

#### Get All Services
```javascript
GET /services
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "services": [
    {
      "service_id": "srv_123456",
      "service_name": "Initial Health Consultation",
      "duration": 60,
      "price": 150.00,
      "currency": "USD",
      "status": "active"
    }
  ]
}
```

### 2. STAFF MANAGEMENT

#### Add Staff Member
```javascript
POST /staff
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "staff_name": "Sarah Johnson, NP",
  "staff_email": "sarah.johnson@snugandkisses.com",
  "role": "Nurse Practitioner",
  "specializations": ["Primary Care", "Chronic Disease Management"],
  "availability": {
    "monday": {
      "available": true,
      "start_time": "08:00",
      "end_time": "17:00",
      "breaks": [
        {
          "start_time": "12:00",
          "end_time": "13:00",
          "description": "Lunch Break"
        }
      ]
    }
  },
  "booking_preferences": {
    "max_bookings_per_day": 12,
    "auto_confirm": true
  }
}
```

#### Get Staff Availability
```javascript
GET /staff/{staff_id}/availability?date=2025-08-10
Authorization: Bearer {access_token}

Response:
{
  "staff_id": "staff_123",
  "date": "2025-08-10",
  "available_slots": [
    {
      "start_time": "08:00",
      "end_time": "09:00",
      "available": true
    },
    {
      "start_time": "09:00",
      "end_time": "10:00",
      "available": false,
      "reason": "booked"
    }
  ]
}
```

### 3. APPOINTMENTS

#### Create Appointment
```javascript
POST /appointments
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "service_id": "srv_123456",
  "staff_id": "staff_123",
  "client_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "appointment_date": "2025-08-10",
  "start_time": "09:00",
  "end_time": "10:00",
  "notes": "Initial consultation for chronic pain management",
  "booking_source": "online"
}
```

#### Get Appointment Details
```javascript
GET /appointments/{appointment_id}
Authorization: Bearer {access_token}

Response:
{
  "appointment_id": "apt_789123",
  "service_name": "Initial Health Consultation",
  "staff_name": "Sarah Johnson, NP",
  "client_name": "John Doe",
  "appointment_date": "2025-08-10",
  "start_time": "09:00",
  "end_time": "10:00",
  "status": "confirmed",
  "created_time": "2025-08-04T08:00:00Z"
}
```

#### Cancel Appointment
```javascript
POST /appointments/{appointment_id}/cancel
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "cancellation_reason": "Client requested cancellation",
  "notify_client": true,
  "refund_amount": 150.00
}
```

#### Reschedule Appointment
```javascript
POST /appointments/{appointment_id}/reschedule
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "new_date": "2025-08-12",
  "new_start_time": "10:00",
  "new_end_time": "11:00",
  "notify_client": true,
  "reason": "Client requested reschedule"
}
```

### 4. AVAILABILITY CHECK

#### Check Available Slots
```javascript
GET /availability?service_id=srv_123456&date=2025-08-10&staff_id=staff_123
Authorization: Bearer {access_token}

Response:
{
  "service_id": "srv_123456",
  "date": "2025-08-10",
  "available_slots": [
    {
      "start_time": "08:00",
      "end_time": "09:00",
      "staff_id": "staff_123",
      "staff_name": "Sarah Johnson, NP"
    },
    {
      "start_time": "10:00",
      "end_time": "11:00",
      "staff_id": "staff_123",
      "staff_name": "Sarah Johnson, NP"
    }
  ]
}
```

---

## 🔄 ZOHO CRM API

### Base URL
```
https://www.zohoapis.com/crm/v2
```

### 1. LEADS MANAGEMENT

#### Create Lead
```javascript
POST /Leads
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "data": [
    {
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "john.doe@example.com",
      "Phone": "+1234567890",
      "Lead_Source": "Website",
      "Lead_Status": "New",
      "Company": "Healthcare Client",
      "Description": "Interested in initial health consultation",
      "Next_Appointment": "2025-08-10T09:00:00Z",
      "Service_Interest": "Initial Consultation"
    }
  ]
}
```

#### Update Lead
```javascript
PUT /Leads/{lead_id}
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "data": [
    {
      "Lead_Status": "Appointment Scheduled",
      "Next_Appointment": "2025-08-10T09:00:00Z",
      "Assigned_Staff": "Sarah Johnson, NP",
      "Last_Activity_Time": "2025-08-04T08:00:00Z"
    }
  ]
}
```

#### Get Lead Details
```javascript
GET /Leads/{lead_id}
Authorization: Bearer {access_token}

Response:
{
  "data": [
    {
      "id": "123456789012345678",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "john.doe@example.com",
      "Lead_Status": "Appointment Scheduled",
      "Created_Time": "2025-08-04T08:00:00Z",
      "Modified_Time": "2025-08-04T08:30:00Z"
    }
  ]
}
```

#### Search Leads
```javascript
GET /Leads/search?criteria=Email:equals:john.doe@example.com
Authorization: Bearer {access_token}

Response:
{
  "data": [
    {
      "id": "123456789012345678",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "john.doe@example.com",
      "Lead_Status": "Appointment Scheduled"
    }
  ]
}
```

### 2. CONTACTS MANAGEMENT

#### Convert Lead to Contact
```javascript
POST /Leads/{lead_id}/actions/convert
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "data": [
    {
      "overwrite": true,
      "notify_lead_owner": true,
      "notify_new_entity_owner": true,
      "Contacts": {
        "First_Name": "John",
        "Last_Name": "Doe",
        "Email": "john.doe@example.com"
      },
      "Deals": {
        "Deal_Name": "Healthcare Services - John Doe",
        "Stage": "Qualification",
        "Amount": 150.00
      }
    }
  ]
}
```

---

## 🌊 ZOHO FLOW API

### Base URL
```
https://flow.zoho.com/api/v1
```

### 1. WORKFLOW AUTOMATION

#### Create Flow
```javascript
POST /flows
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "flow_name": "Healthcare Client Onboarding",
  "description": "Automated workflow for new healthcare clients",
  "trigger": {
    "type": "webhook",
    "webhook_url": "https://snugandkisses.com/api/webhooks/zoho-flow"
  },
  "actions": [
    {
      "type": "create_crm_lead",
      "module": "Leads",
      "data": {
        "First_Name": "{{trigger.first_name}}",
        "Last_Name": "{{trigger.last_name}}",
        "Email": "{{trigger.email}}",
        "Lead_Source": "Website"
      }
    },
    {
      "type": "send_campaign_email",
      "campaign_id": "123456789",
      "recipient": "{{trigger.email}}"
    }
  ]
}
```

#### Trigger Flow via Webhook
```javascript
POST https://flow.zoho.com/webhook/{webhook_id}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "service_interest": "Initial Consultation",
  "source": "website_form"
}
```

---

## 📊 WEBHOOK ENDPOINTS

### 1. Zoho CRM Webhooks
```javascript
// Webhook URL: https://snugandkisses.com/api/webhooks/zoho-crm
POST /api/webhooks/zoho-crm
Content-Type: application/json

{
  "module": "Leads",
  "operation": "create",
  "resource_uri": "/crm/v2/Leads/123456789012345678",
  "ids": ["123456789012345678"],
  "data": [
    {
      "id": "123456789012345678",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "john.doe@example.com"
    }
  ]
}
```

### 2. Zoho Campaigns Webhooks
```javascript
// Webhook URL: https://snugandkisses.com/api/webhooks/zoho-campaigns
POST /api/webhooks/zoho-campaigns
Content-Type: application/json

{
  "event_type": "email_opened",
  "campaign_id": "123456789",
  "recipient_email": "john.doe@example.com",
  "timestamp": "2025-08-04T08:30:00Z",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

### 3. Zoho Bookings Webhooks
```javascript
// Webhook URL: https://snugandkisses.com/api/webhooks/zoho-bookings
POST /api/webhooks/zoho-bookings
Content-Type: application/json

{
  "event_type": "appointment_booked",
  "appointment_id": "apt_789123",
  "service_id": "srv_123456",
  "staff_id": "staff_123",
  "client_email": "john.doe@example.com",
  "appointment_date": "2025-08-10",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

---

## 🔒 SECURITY & COMPLIANCE

### HIPAA Compliance Headers
```javascript
const HIPAA_HEADERS = {
  'X-HIPAA-Compliant': 'true',
  'X-Audit-Log': 'enabled',
  'X-Data-Classification': 'PHI',
  'X-Encryption': 'AES-256-GCM'
};
```

### Rate Limiting
```javascript
// Zoho API Rate Limits
const RATE_LIMITS = {
  crm: {
    requests_per_minute: 100,
    requests_per_day: 25000
  },
  campaigns: {
    requests_per_minute: 50,
    requests_per_day: 10000
  },
  bookings: {
    requests_per_minute: 60,
    requests_per_day: 15000
  }
};
```

### Error Handling
```javascript
// Standard Zoho API Error Response
{
  "code": "INVALID_REQUEST_METHOD",
  "details": {},
  "message": "The http request method type is not a valid one",
  "status": "error"
}

// Common Error Codes
const ZOHO_ERROR_CODES = {
  'AUTHENTICATION_FAILURE': 'Invalid access token',
  'INVALID_REQUEST_METHOD': 'HTTP method not allowed',
  'REQUIRED_FIELD_MISSING': 'Required field is missing',
  'DUPLICATE_DATA': 'Duplicate record found',
  'MANDATORY_NOT_FOUND': 'Mandatory field not found',
  'INVALID_DATA': 'Invalid data provided'
};
```

---

## 🧪 TESTING ENDPOINTS

### Test Authentication
```javascript
GET https://www.zohoapis.com/crm/v2/org
Authorization: Bearer {access_token}

// Success Response
{
  "org": [
    {
      "id": "123456789",
      "company_name": "Snug & Kisses Healthcare",
      "primary_email": "admin@snugandkisses.com"
    }
  ]
}
```

### Test Webhook Delivery
```javascript
// Test webhook endpoint
POST https://snugandkisses.com/api/test/webhook
Content-Type: application/json

{
  "test": true,
  "service": "zoho_crm",
  "event": "lead_created",
  "timestamp": "2025-08-04T08:00:00Z"
}
```

---

## 📈 MONITORING & ANALYTICS

### API Usage Tracking
```javascript
// Track API calls for monitoring
const API_METRICS = {
  endpoint: '/crm/v2/Leads',
  method: 'POST',
  response_time: 245,
  status_code: 201,
  timestamp: '2025-08-04T08:00:00Z',
  user_agent: 'Snug-Kisses-CRM/1.0'
};
```

### Health Check Endpoints
```javascript
// Check Zoho service status
GET https://status.zoho.com/api/v1/status

// Internal health check
GET https://snugandkisses.com/api/health/zoho
Response: {
  "status": "healthy",
  "services": {
    "crm": "operational",
    "campaigns": "operational", 
    "bookings": "operational"
  },
  "last_check": "2025-08-04T08:00:00Z"
}
```

---

*API Documentation compiled by Priya Sharma | Zoho Stack Team*  
*Last Updated: August 4, 2025 | Sprint 3 Implementation*  
*Version: 1.0.0 | HIPAA Compliant | Production Ready*