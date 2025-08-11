'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CreditCard, User, Building, Mail, Phone, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ContactData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface OCRResult {
  extractedText: string;
  contactData: ContactData;
  confidence: number;
  ocrResult: any;
}

interface LeadCreationResult {
  id: string;
  action: 'created' | 'updated';
  message: string;
}

export default function OCRUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadType, setUploadType] = useState<'businessCard' | 'document'>('businessCard');
  const [documentType, setDocumentType] = useState('general');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [leadResult, setLeadResult] = useState<LeadCreationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setOcrResult(null);
    setLeadResult(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or PDF files only.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      const fileData = await fileToBase64(file);
      
      // Determine action based on upload type
      const action = uploadType === 'businessCard' ? 'extractBusinessCard' : 'extractDocument';
      
      // Call OCR API
      const response = await fetch('/api/v1/zia/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user' // This should come from auth context
        },
        body: JSON.stringify({
          action,
          fileData,
          fileName: file.name,
          mimeType: file.type,
          documentType: uploadType === 'document' ? documentType : undefined
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'OCR processing failed');
      }

      setOcrResult(result.data);

      // If it's a business card with good confidence, offer to create lead
      if (uploadType === 'businessCard' && result.data.confidence > 70) {
        // Auto-create lead if we have sufficient data
        const contactData = result.data.contactData;
        if (contactData.name || contactData.email || contactData.phone) {
          await createLeadFromOCR(contactData, file.name, result.data.confidence);
        }
      }

    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const createLeadFromOCR = async (contactData: ContactData, sourceFile: string, confidence: number) => {
    try {
      const response = await fetch('/api/v1/zia/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user' // This should come from auth context
        },
        body: JSON.stringify({
          action: 'createLeadFromOCR',
          contactData,
          sourceFile,
          confidence
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Lead creation failed');
      }

      setLeadResult({
        id: result.data.id,
        action: result.action,
        message: result.message
      });

    } catch (err) {
      console.error('Lead creation error:', err);
      setError(`OCR successful, but lead creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const resetUploader = () => {
    setOcrResult(null);
    setLeadResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Zia OCR Document Processor</h2>
        <p className="text-gray-600">Upload business cards or documents to extract contact information automatically</p>
      </div>

      {/* Upload Type Selection */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setUploadType('businessCard')}
          className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
            uploadType === 'businessCard'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Business Card
        </button>
        <button
          onClick={() => setUploadType('document')}
          className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
            uploadType === 'document'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Document
        </button>
      </div>

      {/* Document Type Selection (for documents) */}
      {uploadType === 'document' && (
        <div className="flex justify-center">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="general">General Document</option>
            <option value="invoice">Invoice</option>
            <option value="contract">Contract</option>
            <option value="receipt">Receipt</option>
          </select>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Processing with Zia OCR...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your {uploadType === 'businessCard' ? 'business card' : 'document'} here
            </p>
            <p className="text-sm text-gray-500">or click to browse files</p>
            <p className="text-xs text-gray-400 mt-2">Supports JPEG, PNG, GIF, PDF (max 10MB)</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Processing Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-green-800">
              OCR Processing Complete (Confidence: {ocrResult.confidence}%)
            </h3>
          </div>

          {uploadType === 'businessCard' && ocrResult.contactData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact Information
                </h4>
                {ocrResult.contactData.name && (
                  <div className="text-sm">
                    <span className="font-medium">Name:</span> {ocrResult.contactData.name}
                  </div>
                )}
                {ocrResult.contactData.email && (
                  <div className="text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {ocrResult.contactData.email}
                  </div>
                )}
                {ocrResult.contactData.phone && (
                  <div className="text-sm flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {ocrResult.contactData.phone}
                  </div>
                )}
                {ocrResult.contactData.website && (
                  <div className="text-sm">
                    <span className="font-medium">Website:</span> {ocrResult.contactData.website}
                  </div>
                )}
              </div>

              {/* Company Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Company Information
                </h4>
                {ocrResult.contactData.company && (
                  <div className="text-sm">
                    <span className="font-medium">Company:</span> {ocrResult.contactData.company}
                  </div>
                )}
                {ocrResult.contactData.title && (
                  <div className="text-sm">
                    <span className="font-medium">Title:</span> {ocrResult.contactData.title}
                  </div>
                )}
                {ocrResult.contactData.address && (
                  <div className="text-sm flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    {ocrResult.contactData.address}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Extracted Text */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View Raw Extracted Text
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
              {ocrResult.extractedText}
            </div>
          </details>
        </div>
      )}

      {/* Lead Creation Result */}
      {leadResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <h4 className="text-blue-800 font-medium">
                Lead {leadResult.action === 'created' ? 'Created' : 'Updated'} Successfully
              </h4>
              <p className="text-blue-700 text-sm mt-1">{leadResult.message}</p>
              <p className="text-blue-600 text-xs mt-1">Lead ID: {leadResult.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {(ocrResult || error) && (
        <div className="text-center">
          <button
            onClick={resetUploader}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Process Another File
          </button>
        </div>
      )}
    </div>
  );
}
