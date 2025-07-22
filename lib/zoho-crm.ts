import { ZCRMRestClient } from 'zcrmsdk';

// Initialize Zoho CRM Client
const initializeCRM = async () => {
  try {
    await ZCRMRestClient.initialize({
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: process.env.ZOHO_ONE_REDIRECT_URI,
      user_identifier: process.env.ZOHO_USER_EMAIL,
    });
  } catch (error) {
    console.error('Failed to initialize Zoho CRM Client:', error);
    throw new Error('CRM Initialization Failed');
  }
};

// Combined function to sync a contact and create a corresponding deal
export const syncContactAndCreateDeal = async (inquiryData: any) => {
  await initializeCRM();

  const contactPayload = {
    First_Name: inquiryData.firstName,
    Last_Name: inquiryData.lastName,
    Email: inquiryData.email,
    Phone: inquiryData.phone || '',
    Description: `Website Inquiry: ${inquiryData.message || 'N/A'}`,
  };

  const contactResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Contacts',
    body: { data: [contactPayload] },
  });

  const contactDetails = contactResponse.data[0].details;
  if (!contactDetails.id) {
    throw new Error('Failed to create contact in CRM');
  }

  const dealPayload = {
    Deal_Name: `Website Inquiry - ${inquiryData.firstName} ${inquiryData.lastName}`,
    Stage: 'Qualification',
    Contact_Name: { id: contactDetails.id },
    Closing_Date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  };

  const dealResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Deals',
    body: { data: [dealPayload] },
  });

  const dealDetails = dealResponse.data[0].details;
  if (!dealDetails.id) {
    throw new Error('Failed to create deal in CRM');
  }

  return { contactId: contactDetails.id, dealId: dealDetails.id };
};

export const createCase = async (contactId: string, serviceType: string) => {
  await initializeCRM();

  const casePayload = {
    Subject: `Service Request - ${serviceType}`,
    Contact_Name: { id: contactId },
    Type: 'Question', // You can customize this
    Status: 'New', // You can customize this
  };

  const caseResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Cases',
    body: { data: [casePayload] },
  });

  const caseDetails = caseResponse.data[0].details;
  if (!caseDetails.id) {
    throw new Error('Failed to create case in CRM');
  }

  return { caseId: caseDetails.id };
};

export const getAppointments = async () => {
  await initializeCRM();

  const coqlQuery = "select id, Subject, Start_DateTime, End_DateTime, Status from Events where Event_Title = 'Appointment'";
  const appointmentsResponse = await ZCRMRestClient.API.COQL.post({ body: { select_query: coqlQuery } });
  
  if (!appointmentsResponse || !appointmentsResponse.data) {
    return [];
  }

  return appointmentsResponse.data.map((event: any) => ({
    id: event.id,
    subject: event.Subject,
    start_time: event.Start_DateTime,
    end_time: event.End_DateTime,
    status: event.Status,
  }));
};

export const createAppointment = async (appointmentData: any) => {
  await initializeCRM();

  const eventPayload = {
    Event_Title: 'Appointment',
    Subject: appointmentData.subject,
    Start_DateTime: appointmentData.startTime,
    End_DateTime: appointmentData.endTime,
    Who_Id: { id: appointmentData.contactId }, // Link to a contact
    // What_Id: { id: '...' } // Optionally link to a Deal, Case, etc.
  };

  const eventResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Events',
    body: { data: [eventPayload] },
  });

  const eventDetails = eventResponse.data[0].details;
  if (!eventDetails.id) {
    throw new Error('Failed to create appointment in CRM');
  }

  return { eventId: eventDetails.id };
};


export const getContactDetails = async (contactId: string) => {
  await initializeCRM();

  const contactResponse = await ZCRMRestClient.API.MODULES.get({
    module: 'Contacts',
    id: contactId,
  });

  if (!contactResponse || !contactResponse.data || !contactResponse.data[0]) {
    throw new Error('Failed to retrieve contact details from CRM');
  }
  
  const contactData = contactResponse.data[0];

  // Assuming custom fields are named Total_Hours and Used_Hours
  return {
    id: contactData.id,
    firstName: contactData.First_Name,
    lastName: contactData.Last_Name,
    email: contactData.Email,
    phone: contactData.Phone,
    totalHours: contactData.Total_Hours || 0,
    usedHours: contactData.Used_Hours || 0,
  };
};

export const getDoulas = async () => {
  await initializeCRM();

  const coqlQuery = "select id, First_Name, Last_Name, Email, Phone, Description, Rating from Contacts where Role = 'Doula'";
  const doulasResponse = await ZCRMRestClient.API.COQL.post({ body: { select_query: coqlQuery } });

  if (!doulasResponse || !doulasResponse.data) {
    return [];
  }

  return doulasResponse.data.map((doula: any) => ({
    id: doula.id,
    firstName: doula.First_Name,
    lastName: doula.Last_Name,
    email: doula.Email,
    phone: doula.Phone,
    description: doula.Description,
    rating: doula.Rating || 0,
  }));
};