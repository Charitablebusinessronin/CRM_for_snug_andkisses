// Zoho CRM REST API Integration
// Uses direct API calls instead of SDK for simplicity and reliability

interface ZohoRecord {
  [key: string]: any;
}

interface ZohoResponse {
  data: Array<{
    code: string;
    details: {
      id: string;
    };
    message: string;
    status: string;
  }>;
}

export class ZohoCRM {
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v2';
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN || '';
  }

  // Create a record in any Zoho CRM module
  async createRecord(module: string, data: ZohoRecord): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${module}`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [data]
        }),
      });

      if (!response.ok) {
        throw new Error(`Zoho API error: ${response.status} ${response.statusText}`);
      }

      const result: ZohoResponse = await response.json();
      
      if (result.data && result.data[0] && result.data[0].status === 'success') {
        return result.data[0].details.id;
      }
      
      throw new Error(`Zoho record creation failed: ${result.data[0]?.message || 'Unknown error'}`);
    } catch (error) {
      console.error('Zoho CRM API Error:', error);
      return null;
    }
  }

  // Create employee/client record in Leads module
  async createEmployeeRecord(employeeData: any): Promise<string | null> {
    const zohoRecord = {
      Last_Name: employeeData.fullName || 'Unknown',
      Email: employeeData.email,
      Phone: employeeData.phone,
      Company: employeeData.employer || 'Snugs and Kisses Client',
      Lead_Source: 'Employee Portal',
      Description: `Employee info submitted via portal. Address: ${employeeData.address || 'Not provided'}`,
      // Add custom fields as needed
      Custom_Field_1: JSON.stringify(employeeData), // Store full data as JSON for now
    };

    return this.createRecord('Leads', zohoRecord);
  }

  // Create service request in Cases module
  async createServiceRequest(serviceData: any): Promise<string | null> {
    const zohoRecord = {
      Subject: `Service Request: ${serviceData.serviceType}`,
      Status: 'New',
      Priority: 'Medium',
      Origin: 'Employee Portal',
      Description: `Service request for ${serviceData.serviceType} submitted via employee portal.`,
      // Link to employee if we have the ID
      Related_To: serviceData.employeeId || null,
    };

    return this.createRecord('Cases', zohoRecord);
  }
}
