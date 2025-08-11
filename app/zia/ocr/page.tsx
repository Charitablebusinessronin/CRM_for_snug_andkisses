import OCRUploader from '@/components/zia/OCRUploader';

export default function OCRPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Zia AI OCR Document Processor
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Leverage Zoho's powerful Zia AI to automatically extract contact information from business cards 
            and documents. Upload images or PDFs to instantly populate your CRM with accurate lead data.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Card OCR</h3>
            <p className="text-gray-600 text-sm">
              Automatically extract names, emails, phone numbers, companies, and addresses from business card images.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Lead Creation</h3>
            <p className="text-gray-600 text-sm">
              Instantly create new leads in your CRM with extracted contact data, or update existing leads with additional information.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600 text-sm">
              All OCR processing includes comprehensive audit logging and secure data handling for healthcare compliance.
            </p>
          </div>
        </div>

        {/* OCR Uploader Component */}
        <div className="bg-white rounded-lg shadow-sm border">
          <OCRUploader />
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Business Cards</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Select "Business Card" mode</li>
                <li>Upload a clear image of the business card</li>
                <li>Review extracted contact information</li>
                <li>Lead will be automatically created if confidence is high</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Documents</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Select "Document" mode and choose document type</li>
                <li>Upload invoice, contract, or general document</li>
                <li>Review extracted text and structured data</li>
                <li>Use extracted information for record keeping</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Supported Formats</h4>
              <ul className="space-y-1">
                <li>• JPEG/JPG images</li>
                <li>• PNG images</li>
                <li>• GIF images</li>
                <li>• PDF documents</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Processing Features</h4>
              <ul className="space-y-1">
                <li>• Zia AI OCR engine</li>
                <li>• Multi-language support</li>
                <li>• Confidence scoring</li>
                <li>• Duplicate detection</li>
                <li>• Real-time processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
