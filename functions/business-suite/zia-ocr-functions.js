const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');

/**
 * Zia OCR Functions for Business Card and Document Processing
 * Extracts contact information and auto-populates CRM data
 */

module.exports = (app) => {
  
  /**
   * Extract contact information from business card using Zia OCR
   * @param {Object} fileStream - File stream of the uploaded image
   * @param {Object} options - OCR processing options
   * @returns {Object} Extracted contact data
   */
  app.post('/extractBusinessCard', async (req, res) => {
    try {
      const zcatalyst = catalyst.initialize(req);
      const zia = zcatalyst.zia();
      
      // Get file from request
      const { fileData, fileName, mimeType } = req.body;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(mimeType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and GIF are supported.');
      }
      
      // Convert base64 to buffer and create temporary file
      const buffer = Buffer.from(fileData, 'base64');
      const tempFilePath = `/tmp/${fileName}`;
      fs.writeFileSync(tempFilePath, buffer);
      
      // Extract text using Zia OCR
      const ocrPromise = zia.extractOpticalCharacters(fs.createReadStream(tempFilePath), {
        "modelType": "OCR",
        "language": "eng"
      });
      
      const ocrResult = await ocrPromise;
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      // Parse extracted text for contact information
      const extractedText = ocrResult.predictions?.[0]?.text || '';
      const contactData = parseBusinessCardText(extractedText);
      
      // Log audit event
      await logAuditEvent(zcatalyst, {
        action: 'OCR_BUSINESS_CARD_EXTRACTION',
        userId: req.headers['x-user-id'] || 'system',
        details: {
          fileName,
          extractedFieldsCount: Object.keys(contactData).length,
          confidence: ocrResult.predictions?.[0]?.confidence || 0
        },
        timestamp: new Date().toISOString(),
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.status(200).json({
        success: true,
        data: {
          extractedText,
          contactData,
          confidence: ocrResult.predictions?.[0]?.confidence || 0,
          ocrResult
        },
        message: 'Business card processed successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('OCR Business Card Error:', error);
      
      // Log error audit event
      await logAuditEvent(zcatalyst, {
        action: 'OCR_BUSINESS_CARD_ERROR',
        userId: req.headers['x-user-id'] || 'system',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({
        success: false,
        error: 'OCR processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  /**
   * Extract text from invoice or contract documents
   * @param {Object} fileStream - File stream of the uploaded document
   * @returns {Object} Extracted document data
   */
  app.post('/extractDocument', async (req, res) => {
    try {
      const zcatalyst = catalyst.initialize(req);
      const zia = zcatalyst.zia();
      
      const { fileData, fileName, mimeType, documentType } = req.body;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(mimeType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are supported.');
      }
      
      // Convert base64 to buffer and create temporary file
      const buffer = Buffer.from(fileData, 'base64');
      const tempFilePath = `/tmp/${fileName}`;
      fs.writeFileSync(tempFilePath, buffer);
      
      // Extract text using Zia OCR with advanced settings
      const ocrPromise = zia.extractOpticalCharacters(fs.createReadStream(tempFilePath), {
        "modelType": "OCR",
        "language": "eng",
        "mode": "advanced"
      });
      
      const ocrResult = await ocrPromise;
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      // Parse extracted text based on document type
      const extractedText = ocrResult.predictions?.[0]?.text || '';
      const documentData = parseDocumentText(extractedText, documentType);
      
      // Log audit event
      await logAuditEvent(zcatalyst, {
        action: 'OCR_DOCUMENT_EXTRACTION',
        userId: req.headers['x-user-id'] || 'system',
        details: {
          fileName,
          documentType,
          extractedFieldsCount: Object.keys(documentData).length,
          confidence: ocrResult.predictions?.[0]?.confidence || 0
        },
        timestamp: new Date().toISOString(),
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.status(200).json({
        success: true,
        data: {
          extractedText,
          documentData,
          documentType,
          confidence: ocrResult.predictions?.[0]?.confidence || 0,
          ocrResult
        },
        message: 'Document processed successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('OCR Document Error:', error);
      
      // Log error audit event
      await logAuditEvent(zcatalyst, {
        action: 'OCR_DOCUMENT_ERROR',
        userId: req.headers['x-user-id'] || 'system',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({
        success: false,
        error: 'Document OCR processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  /**
   * Auto-create lead from extracted business card data
   * @param {Object} contactData - Extracted contact information
   * @returns {Object} Created lead data
   */
  app.post('/createLeadFromOCR', async (req, res) => {
    try {
      const zcatalyst = catalyst.initialize(req);
      const { contactData, sourceFile, confidence } = req.body;
      
      // Validate minimum required data
      if (!contactData.name && !contactData.email && !contactData.phone) {
        throw new Error('Insufficient contact data extracted. At least name, email, or phone is required.');
      }
      
      // Prepare lead data for CRM
      const leadData = {
        first_name: contactData.firstName || contactData.name?.split(' ')[0] || '',
        last_name: contactData.lastName || contactData.name?.split(' ').slice(1).join(' ') || '',
        company: contactData.company || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        mobile: contactData.mobile || contactData.phone || '',
        website: contactData.website || '',
        designation: contactData.title || contactData.position || '',
        lead_source: 'Business Card OCR',
        lead_status: 'New',
        description: `Lead created from OCR extraction of ${sourceFile}. Confidence: ${confidence}%`,
        street: contactData.address || '',
        city: contactData.city || '',
        state: contactData.state || '',
        zip_code: contactData.zipCode || '',
        country: contactData.country || '',
        // Custom fields for OCR tracking
        ocr_source_file: sourceFile,
        ocr_confidence: confidence,
        ocr_extracted_at: new Date().toISOString()
      };
      
      // Use existing createLead function
      const datastore = zcatalyst.datastore();
      const leadsTable = datastore.table('Leads');
      
      // Check for duplicates
      const existingLeads = await leadsTable.getRecords({
        where: `email = '${leadData.email}' OR phone = '${leadData.phone}'`
      });
      
      if (existingLeads.length > 0) {
        // Update existing lead with OCR data
        const existingLead = existingLeads[0];
        const updatedData = {
          ...leadData,
          id: existingLead.id,
          lead_status: 'Updated via OCR',
          description: `${existingLead.description || ''}\n\nUpdated from OCR extraction of ${sourceFile}. Confidence: ${confidence}%`
        };
        
        const updatedLead = await leadsTable.updateRecord(updatedData);
        
        // Log audit event
        await logAuditEvent(zcatalyst, {
          action: 'LEAD_UPDATED_FROM_OCR',
          userId: req.headers['x-user-id'] || 'system',
          leadId: updatedLead.id,
          details: { sourceFile, confidence, action: 'updated_existing' },
          timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
          success: true,
          data: updatedLead,
          message: 'Existing lead updated with OCR data',
          action: 'updated',
          timestamp: new Date().toISOString()
        });
        
      } else {
        // Create new lead
        const newLead = await leadsTable.insertRecord(leadData);
        
        // Log audit event
        await logAuditEvent(zcatalyst, {
          action: 'LEAD_CREATED_FROM_OCR',
          userId: req.headers['x-user-id'] || 'system',
          leadId: newLead.id,
          details: { sourceFile, confidence, action: 'created_new' },
          timestamp: new Date().toISOString()
        });
        
        res.status(201).json({
          success: true,
          data: newLead,
          message: 'New lead created from OCR data',
          action: 'created',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Create Lead from OCR Error:', error);
      
      // Log error audit event
      await logAuditEvent(zcatalyst, {
        action: 'LEAD_OCR_CREATION_ERROR',
        userId: req.headers['x-user-id'] || 'system',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to create lead from OCR data',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Parse business card text to extract contact information
 * @param {string} text - Raw OCR extracted text
 * @returns {Object} Parsed contact data
 */
function parseBusinessCardText(text) {
  const contactData = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Email regex
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    contactData.email = emailMatch[0];
  }
  
  // Phone regex (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    contactData.phone = phoneMatch[0];
  }
  
  // Website regex
  const websiteRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const websiteMatch = text.match(websiteRegex);
  if (websiteMatch) {
    contactData.website = websiteMatch[0];
  }
  
  // Name extraction (usually first line or line with proper case)
  const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/;
  for (const line of lines) {
    if (nameRegex.test(line) && !contactData.name) {
      contactData.name = line;
      const nameParts = line.split(' ');
      contactData.firstName = nameParts[0];
      contactData.lastName = nameParts.slice(1).join(' ');
      break;
    }
  }
  
  // Company extraction (look for common business indicators)
  const businessKeywords = ['LLC', 'Inc', 'Corp', 'Company', 'Ltd', 'Group', 'Associates', 'Partners'];
  for (const line of lines) {
    if (businessKeywords.some(keyword => line.includes(keyword)) && !contactData.company) {
      contactData.company = line;
      break;
    }
  }
  
  // Title/Position extraction
  const titleKeywords = ['CEO', 'President', 'Manager', 'Director', 'VP', 'Vice President', 'Founder', 'Owner'];
  for (const line of lines) {
    if (titleKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase())) && !contactData.title) {
      contactData.title = line;
      break;
    }
  }
  
  // Address extraction (look for patterns with numbers and common address words)
  const addressRegex = /\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)/i;
  for (const line of lines) {
    if (addressRegex.test(line) && !contactData.address) {
      contactData.address = line;
      break;
    }
  }
  
  return contactData;
}

/**
 * Parse document text based on document type
 * @param {string} text - Raw OCR extracted text
 * @param {string} documentType - Type of document (invoice, contract, etc.)
 * @returns {Object} Parsed document data
 */
function parseDocumentText(text, documentType) {
  const documentData = { type: documentType };
  
  switch (documentType) {
    case 'invoice':
      // Extract invoice-specific data
      const invoiceRegex = /Invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i;
      const invoiceMatch = text.match(invoiceRegex);
      if (invoiceMatch) {
        documentData.invoiceNumber = invoiceMatch[1];
      }
      
      const amountRegex = /Total\s*:?\s*\$?([0-9,]+\.?[0-9]*)/i;
      const amountMatch = text.match(amountRegex);
      if (amountMatch) {
        documentData.amount = amountMatch[1];
      }
      break;
      
    case 'contract':
      // Extract contract-specific data
      const contractRegex = /Contract\s*#?\s*:?\s*([A-Z0-9-]+)/i;
      const contractMatch = text.match(contractRegex);
      if (contractMatch) {
        documentData.contractNumber = contractMatch[1];
      }
      break;
      
    default:
      // General document parsing
      documentData.extractedText = text;
  }
  
  // Common extractions for all document types
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
  const dateMatches = text.match(dateRegex);
  if (dateMatches) {
    documentData.dates = dateMatches;
  }
  
  return documentData;
}

/**
 * Log audit events for HIPAA compliance
 * @param {Object} zcatalyst - Catalyst instance
 * @param {Object} eventData - Audit event data
 */
async function logAuditEvent(zcatalyst, eventData) {
  try {
    const datastore = zcatalyst.datastore();
    const auditTable = datastore.table('AuditLog');
    
    await auditTable.insertRecord({
      ...eventData,
      component: 'ZIA_OCR_SERVICE',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
