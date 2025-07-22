import { ZCRMRestClient } from 'zcrmsdk';

// Initialize Zoho CRM Client
const initializeCRM = async () => {
  try {
    await ZCRMRestClient.initialize({
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: process.env.ZOHO_ONE_REDIRECT_URI, // Using the more generic redirect URI
      user_identifier: process.env.ZOHO_USER_EMAIL,
      // Note: Token storage needs a robust implementation, placeholder for now
      // token_management: 'token_storage_module.TokenStorage',
    });
  } catch (error) {
    console.error('Failed to initialize Zoho CRM Client:', error);
    throw new Error('CRM Initialization Failed');
  }
};

// Combined function to sync a contact and create a corresponding deal
export const syncContactAndCreateDeal = async (inquiryData: any) => {
  await initializeCRM();

  // 1. Create or Update Contact in Zoho CRM
  const contactPayload = {
    First_Name: inquiryData.firstName,
    Last_Name: inquiryData.lastName,
    Email: inquiryData.email,
    Phone: inquiryData.phone || '',
    Description: `Website Inquiry: ${inquiryData.message || 'N/A'}`,
  };

  const contactResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Contacts',
    body: JSON.stringify([contactPayload]),
  });

  const contactDetails = contactResponse.data[0].details;
  if (!contactDetails.id) {
    throw new Error('Failed to create contact in CRM');
  }

  // 2. Create a Deal (Lead) associated with the Contact
  const dealPayload = {
    Deal_Name: `Website Inquiry - ${inquiryData.firstName} ${inquiryData.lastName}`,
    Stage: 'Qualification', // Default stage for new web leads
    Contact_Name: { id: contactDetails.id }, // Link to the newly created contact
    Closing_Date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Tentative close date 30 days out
  };

  const dealResponse = await ZCRMRestClient.API.MODULES.post({
    module: 'Deals',
    body: JSON.stringify([dealPayload]),
  });

  const dealDetails = dealResponse.data[0].details;
  if (!dealDetails.id) {
    // Optional: Add logic to delete the contact if deal creation fails
    throw new Error('Failed to create deal in CRM');
  }

  return { contactId: contactDetails.id, dealId: dealDetails.id };
};
