import { NextRequest } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';
import { ziaAnalytics } from '@/lib/zia-analytics';
import respond from '@/lib/api-respond'

const CATALYST_FUNCTION_URL = process.env.CATALYST_FUNCTION_URL || 'https://snugcrm-891124823.development.catalystserverless.com/server/business-suite';

/**
 * Zia OCR API Endpoint
 * Handles business card and document OCR processing via Catalyst functions
 */

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const requestBody = await request.json();
    const { action, fileData, fileName, mimeType, documentType, contactData, sourceFile, confidence } = requestBody;

    // Validate required parameters
    if (!action) {
      return respond.badRequest('Missing required parameter: action')
    }

    let catalystResponse;
    let data;

    // Log audit event for OCR request
    await logAuditEvent({
      action: `ZIA_OCR_REQUEST_${action.toUpperCase()}`,
      user_id: userId,
      data: {
        action,
        fileName: fileName || 'unknown',
        documentType: documentType || 'unknown',
        hasFileData: !!fileData
      },
      timestamp: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      origin: request.headers.get('origin') || 'unknown',
      request_id: crypto.randomUUID()
    });

    switch (action) {
      case 'extractBusinessCard':
        // Validate business card extraction parameters
        if (!fileData || !fileName || !mimeType) {
          return respond.badRequest('Missing required parameters for business card extraction: fileData, fileName, mimeType')
        }

        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}/extractBusinessCard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0',
            'x-user-id': userId
          },
          body: JSON.stringify({
            fileData,
            fileName,
            mimeType
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst OCR function call failed: ${catalystResponse.status} ${catalystResponse.statusText}`);
        }

        data = await catalystResponse.json();
        
        // Log successful extraction
        await logAuditEvent({
          action: 'ZIA_OCR_BUSINESS_CARD_SUCCESS',
          user_id: userId,
          data: {
            fileName,
            extractedFieldsCount: Object.keys(data.data?.contactData || {}).length,
            confidence: data.data?.confidence || 0
          },
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          origin: request.headers.get('origin') || 'unknown',
          request_id: crypto.randomUUID(),
          result: 'success'
        });

        return respond.ok({
          ...data.data,
          _source: 'zia-ocr-catalyst'
        })

      case 'extractDocument':
        // Validate document extraction parameters
        if (!fileData || !fileName || !mimeType) {
          return respond.badRequest('Missing required parameters for document extraction: fileData, fileName, mimeType')
        }

        // Enhanced OCR with document type detection
        try {
          const ocrResult = await ziaAnalytics.performOCRWithDocumentDetection(
            fileData, 
            documentType
          );

          data = {
            data: {
              text: ocrResult.text,
              confidence: ocrResult.confidence,
              document_type_detected: ocrResult.document_type_detected,
              structured_data: ocrResult.structured_data,
              bounding_boxes: ocrResult.bounding_boxes
            }
          };

        } catch (ziaError) {
          // Fallback to Catalyst function if Zia fails
          catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}/extractDocument`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Snug-Kisses-CRM/2.0',
              'x-user-id': userId
            },
            body: JSON.stringify({
              fileData,
              fileName,
              mimeType,
              documentType: documentType || 'general'
            })
          });

          if (!catalystResponse.ok) {
            throw new Error(`Both Zia and Catalyst OCR failed: ${catalystResponse.status} ${catalystResponse.statusText}`);
          }

          data = await catalystResponse.json();
        }
        
        // Log successful extraction
        await logAuditEvent({
          action: 'ZIA_OCR_DOCUMENT_SUCCESS',
          user_id: userId,
          data: {
            fileName,
            documentType: documentType || 'general',
            extractedFieldsCount: Object.keys(data.data?.documentData || {}).length,
            confidence: data.data?.confidence || 0
          },
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          origin: request.headers.get('origin') || 'unknown',
          request_id: crypto.randomUUID(),
          result: 'success'
        });

        return respond.ok({
          ...data.data,
          _source: 'zia-ocr-catalyst'
        })

      case 'createLeadFromOCR':
        // Validate lead creation parameters
        if (!contactData) {
          return respond.badRequest('Missing required parameter: contactData')
        }

        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}/createLeadFromOCR`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0',
            'x-user-id': userId
          },
          body: JSON.stringify({
            contactData,
            sourceFile: sourceFile || 'unknown',
            confidence: confidence || 0
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst OCR lead creation failed: ${catalystResponse.status} ${catalystResponse.statusText}`);
        }

        data = await catalystResponse.json();
        
        // Log successful lead creation
        await logAuditEvent({
          action: 'ZIA_OCR_LEAD_CREATION_SUCCESS',
          user_id: userId,
          data: {
            leadId: data.data?.id,
            sourceFile: sourceFile || 'unknown',
            confidence: confidence || 0,
            action: data.action || 'unknown'
          },
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          origin: request.headers.get('origin') || 'unknown',
          request_id: crypto.randomUUID(),
          result: 'success'
        });

        if (data.action === 'created') {
          return respond.created({
            ...data.data,
            action: data.action,
            _source: 'zia-ocr-catalyst'
          })
        }
        return respond.ok({
          ...data.data,
          action: data.action,
          _source: 'zia-ocr-catalyst'
        })

      default:
        return respond.badRequest(`Unsupported action: ${action}`, undefined, {
          supportedActions: ['extractBusinessCard', 'extractDocument', 'createLeadFromOCR']
        })
    }

  } catch (error) {
    console.error('Zia OCR API Error:', error);

    // Log error audit event
    await logAuditEvent({
      action: 'ZIA_OCR_API_ERROR',
      user_id: request.headers.get('x-user-id') || 'anonymous',
      error_message: (error instanceof Error ? error.message : String(error)),
      timestamp: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      origin: request.headers.get('origin') || 'unknown',
      request_id: crypto.randomUUID(),
      result: 'error'
    });

    return respond.serverError('Zia OCR processing failed', 'zia_ocr_error', (error as any)?.message)
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Log audit event for OCR status request
    await logAuditEvent({
      action: 'ZIA_OCR_STATUS_REQUEST',
      user_id: userId,
      timestamp: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      origin: request.headers.get('origin') || 'unknown',
      request_id: crypto.randomUUID()
    });

    return respond.ok({
      service: 'Zia OCR API',
      version: '1.0.0',
      status: 'operational',
      supportedActions: [
        'extractBusinessCard',
        'extractDocument', 
        'createLeadFromOCR'
      ],
      supportedFileTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/pdf'
      ],
      features: [
        'Business card contact extraction',
        'Document text extraction',
        'Auto-lead creation from OCR data',
        'HIPAA compliant audit logging',
        'Duplicate detection and prevention'
      ]
    })

  } catch (error) {
    console.error('Zia OCR Status Error:', error);
    
    return respond.serverError('Failed to get OCR service status', 'zia_ocr_status_error', (error as any)?.message)
  }
}
