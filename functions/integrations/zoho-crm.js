const { ZCRMRestClient } = require("zcrmsdk")

const initializeCRM = async () => {
  return await ZCRMRestClient.initialize({
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    redirect_uri: "https://your-app.com/oauth2callback",
    user_identifier: process.env.ZOHO_USER_EMAIL,
    token_management: "token_storage_module.TokenStorage",
  })
}

module.exports.syncCustomerToCRM = async (customerData) => {
  try {
    await initializeCRM()

    // Create contact in Zoho CRM
    const response = await ZCRMRestClient.API.MODULES.post({
      module: "Contacts",
      body: JSON.stringify([
        {
          First_Name: customerData.firstName,
          Last_Name: customerData.lastName,
          Email: customerData.email,
          Phone: customerData.phone,
          Mailing_Street: customerData.address.street,
          Mailing_City: customerData.address.city,
          Mailing_State: customerData.address.state,
          Mailing_Code: customerData.address.zipCode,
          Description: `Emergency Contact: ${customerData.emergencyContact.name} (${customerData.emergencyContact.phone})`,
        },
      ]),
    })

    return response.data[0].details.id
  } catch (error) {
    console.error("Error syncing customer to CRM:", error)
    throw error
  }
}

module.exports.createDeal = async (appointmentData, customerData) => {
  try {
    await initializeCRM()

    const response = await ZCRMRestClient.API.MODULES.post({
      module: "Deals",
      body: JSON.stringify([
        {
          Deal_Name: `${appointmentData.serviceType} - ${customerData.firstName} ${customerData.lastName}`,
          Amount: appointmentData.totalAmount,
          Stage: "Qualification",
          Contact_Name: customerData.crmId,
          Closing_Date: appointmentData.startDateTime.split("T")[0],
          Description: appointmentData.notes || "",
        },
      ]),
    })

    return response.data[0].details.id
  } catch (error) {
    console.error("Error creating deal in CRM:", error)
    throw error
  }
}
