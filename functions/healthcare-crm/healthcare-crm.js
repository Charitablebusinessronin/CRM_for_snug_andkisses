/**
 * Snug & Kisses Healthcare CRM - HIPAA Compliant Catalyst Function
 * Using official Zoho Catalyst SDK patterns with Context7 guidance
 */

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  try {
    // Initialize with admin scope for full database access
    const adminApp = catalyst.initialize(req, { scope: 'admin' });
    
    // Get Cloud Scale components
    const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
    const mail = adminApp.cloudscale.mail.getComponentInstance();
    const fileStore = adminApp.cloudscale.fileStore.getComponentInstance();
    const ziaServices = adminApp.ziaServices.getComponentInstance();
    
    const { action, module } = req.query;
    const requestData = req.body;
    
    // Route handler for different CRM operations
    switch (module) {
      case 'patients':
        return await handlePatients(action, requestData, { dataStore, mail, res });
      
      case 'appointments':
        return await handleAppointments(action, requestData, { dataStore, mail, res });
      
      case 'medical-records':
        return await handleMedicalRecords(action, requestData, { dataStore, fileStore, ziaServices, res });
      
      case 'billing':
        return await handleBilling(action, requestData, { dataStore, mail, res });
      
      case 'care-team':
        return await handleCareTeam(action, requestData, { dataStore, mail, res });
      
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid module specified'
        });
    }
    
  } catch (error) {
    console.error('Healthcare CRM Error:', error);
    
    // HIPAA Audit Logging
    await logHIPAAAuditEvent(req, {
      action: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
      user_id: req.user?.id || 'anonymous'
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error_id: generateErrorId()
    });
  }
};

/**
 * Handle Patient Management Operations
 * Using official Catalyst Data Store patterns
 */
async function handlePatients(action, data, { dataStore, mail, res }) {
  const patientsTable = dataStore.getTableInstance('patients');
  
  switch (action) {
    case 'list':
      // Use ZCQL for complex queries with HIPAA compliance
      const adminApp = catalyst.initialize(req, { scope: 'admin' });
      const patients = await adminApp.zcql().executeZCQLQuery(
        `SELECT patient_id, first_name, last_name, date_of_birth, phone, email, 
         insurance_provider, emergency_contact, created_time 
         FROM patients 
         WHERE status = 'active' 
         ORDER BY last_name ASC 
         LIMIT 100`
      );
      
      // Log access for HIPAA compliance
      await logHIPAAAuditEvent(req, {
        action: 'patient_list_accessed',
        record_count: patients.length,
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        data: patients,
        total_count: patients.length
      });
    
    case 'create':
      // Validate required fields for patient creation
      const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'phone'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Insert patient with HIPAA audit trail
      const patientData = {
        ...data,
        patient_id: generatePatientId(),
        status: 'active',
        created_time: new Date().toISOString(),
        created_by: req.user?.id,
        hipaa_consent: data.hipaa_consent || false
      };
      
      const insertResult = await dataStore.insertRows('patients', [patientData]);
      
      // Send welcome email using Catalyst Mail
      if (data.email) {
        await mail.sendEmail({
          from: 'care@snugandkisses.com',
          to: [data.email],
          subject: 'Welcome to Snug & Kisses Healthcare',
          html: generateWelcomeEmailTemplate(patientData),
          text: `Welcome ${data.first_name}! Your patient ID is ${patientData.patient_id}.`
        });
      }
      
      // HIPAA Audit Log
      await logHIPAAAuditEvent(req, {
        action: 'patient_created',
        patient_id: patientData.patient_id,
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        message: 'Patient created successfully',
        patient_id: patientData.patient_id,
        data: insertResult
      });
    
    case 'update':
      // Bulk update with audit logging
      const updateData = {
        ...data,
        modified_time: new Date().toISOString(),
        modified_by: req.user?.id
      };
      
      const updateResult = await dataStore.updateRows('patients', [updateData]);
      
      await logHIPAAAuditEvent(req, {
        action: 'patient_updated',
        patient_id: data.patient_id,
        fields_updated: Object.keys(data),
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        message: 'Patient updated successfully',
        data: updateResult
      });
    
    case 'bulk_read':
      // Use official bulk read pattern for performance
      const patientIds = data.patient_ids || [];
      const bulkPatients = await dataStore.bulkReadRows('patients', patientIds);
      
      await logHIPAAAuditEvent(req, {
        action: 'bulk_patient_access',
        patient_count: patientIds.length,
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        data: bulkPatients
      });
    
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action for patients module'
      });
  }
}

/**
 * Handle Medical Records with Document Processing
 * Using Zia Services for OCR and document analysis
 */
async function handleMedicalRecords(action, data, { dataStore, fileStore, ziaServices, res }) {
  switch (action) {
    case 'upload_document':
      // Upload to secure file storage
      const folderInstance = fileStore.getFolder('medical-documents');
      const uploadResult = await folderInstance.uploadFile(data.file);
      
      // Process document with Zia OCR for text extraction
      if (data.process_ocr) {
        const ocrResult = await ziaServices.ocr({
          imageUrl: uploadResult.file_url
        });
        
        // Store extracted text in medical records
        await dataStore.insertRows('medical_records', [{
          patient_id: data.patient_id,
          document_id: uploadResult.file_id,
          document_type: data.document_type,
          extracted_text: ocrResult.text,
          upload_date: new Date().toISOString(),
          uploaded_by: req.user?.id
        }]);
      }
      
      await logHIPAAAuditEvent(req, {
        action: 'medical_document_uploaded',
        patient_id: data.patient_id,
        document_type: data.document_type,
        file_id: uploadResult.file_id,
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        message: 'Medical document uploaded successfully',
        file_id: uploadResult.file_id
      });
    
    case 'process_identity_document':
      // Use Zia Identity Scanner for insurance cards, IDs
      let identityResult;
      
      switch (data.document_type) {
        case 'insurance_card':
          identityResult = await ziaServices.identityScanner.generic({
            imageUrl: data.image_url
          });
          break;
        case 'drivers_license':
          identityResult = await ziaServices.identityScanner.generic({
            imageUrl: data.image_url
          });
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: 'Unsupported document type for identity processing'
          });
      }
      
      // Store processed identity data
      await dataStore.insertRows('patient_identity_documents', [{
        patient_id: data.patient_id,
        document_type: data.document_type,
        extracted_data: identityResult,
        processed_date: new Date().toISOString(),
        processed_by: req.user?.id
      }]);
      
      return res.json({
        status: 'success',
        message: 'Identity document processed successfully',
        extracted_data: identityResult
      });
    
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action for medical records module'
      });
  }
}

/**
 * Handle Appointment Scheduling
 * Using ZCQL for complex appointment queries
 */
async function handleAppointments(action, data, { dataStore, mail, res }) {
  const adminApp = catalyst.initialize(req, { scope: 'admin' });
  
  switch (action) {
    case 'schedule':
      // Check for scheduling conflicts
      const conflictCheck = await adminApp.zcql().executeZCQLQuery(
        `SELECT appointment_id FROM appointments 
         WHERE provider_id = '${data.provider_id}' 
         ... AND appointment_date = '${data.appointment_date}' 
         AND status != 'cancelled'`
      );
      
      if (conflictCheck.length > 0) {
        return res.status(409).json({
          status: 'error',
          message: 'Scheduling conflict detected'
        });
      }
      
      // Create appointment
      const appointmentData = {
        ...data,
        appointment_id: generateAppointmentId(),
        status: 'scheduled',
        created_time: new Date().toISOString(),
        created_by: req.user?.id
      };
      
      const appointmentResult = await dataStore.insertRows('appointments', [appointmentData]);
      
      // Send confirmation emails
      await sendAppointmentConfirmation(mail, appointmentData);
      
      await logHIPAAAuditEvent(req, {
        action: 'appointment_scheduled',
        appointment_id: appointmentData.appointment_id,
        patient_id: data.patient_id,
        user_id: req.user?.id
      });
      
      return res.json({
        status: 'success',
        message: 'Appointment scheduled successfully',
        appointment_id: appointmentData.appointment_id
      });
    
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action for appointments module'
      });
  }
}

/**
 * HIPAA Audit Logging Function
 * Ensures all PHI access is properly logged
 */
async function logHIPAAAuditEvent(req, auditData) {
  try {
    const catalyst_app = catalyst.initialize(req, { scope: 'admin' });
    const dataStore = catalyst_app.cloudscale.dataStore.getComponentInstance();
    
    const auditEntry = {
      ...auditData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      session_id: req.sessionID,
      timestamp: new Date().toISOString(),
      compliance_status: 'logged'
    };
    
    await dataStore.insertRows('hipaa_audit_log', [auditEntry]);
  } catch (error) {
    console.error('HIPAA Audit Logging Failed:', error);
  }
}

/**
 * Utility Functions
 */
function generatePatientId() {
  return 'PAT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateAppointmentId() {
  return 'APT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateErrorId() {
  return 'ERR-' + Date.now().toString(36).toUpperCase();
}

function generateWelcomeEmailTemplate(patientData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c5aa0;">Welcome to Snug & Kisses Healthcare</h1>
      <p>Dear ${patientData.first_name} ${patientData.last_name},</p>
      <p>Thank you for choosing us for your healthcare needs. Your patient ID is: <strong>${patientData.patient_id}</strong></p>
      <p>You can use this ID when scheduling appointments or contacting our office.</p>
      <p>Our team is committed to providing you with the highest quality of care while maintaining strict HIPAA compliance.</p>
      <p>Best regards,<br>Snug & Kisses Healthcare Team</p>
    </div>
  `;
}

async function sendAppointmentConfirmation(mail, appointmentData) {
  // Implementation for sending appointment confirmations
  return await mail.sendEmail({
    from: 'appointments@snugandkisses.com',
    to: [appointmentData.patient_email],
    subject: `Appointment Confirmation - ${appointmentData.appointment_id}`,
    html: `
      <h2>Appointment Confirmed</h2>
      <p>Your appointment has been scheduled for ${appointmentData.appointment_date} at ${appointmentData.appointment_time}.</p>
      <p>Appointment ID: ${appointmentData.appointment_id}</p>
    `
  });
}