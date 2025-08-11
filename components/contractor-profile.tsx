"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, Mail, Star, Upload, FileText, CheckCircle, AlertCircle, Camera } from "lucide-react"
import { useRouter } from 'next/navigation';

/**
 * The main component for the contractor profile.
 * It displays and allows editing of the contractor's profile information, onboarding status, and documents.
 * @returns {JSX.Element} The contractor profile component.
 */
export function ContractorProfile({ userId, existingProfile = null }) {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    ...existingProfile
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = existingProfile ? `/api/v1/profiles/${userId}` : '/api/v1/profiles';
      const method = existingProfile ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          ...profile,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Profile ${method === 'POST' ? 'creation' : 'update'} failed: ${errorData}`);
      }

      const result = await response.json();
      
      // Redirect based on role after successful creation/update
      const redirectPath = profile.role === 'client' ? '/client/dashboard' 
                          : profile.role === 'contractor' ? '/contractor/dashboard'
                          : '/dashboard';
      
      router.push(redirectPath);
      
    } catch (err) {
      console.error('Profile operation failed:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [profileImage, setProfileImage] = useState < string > ("/placeholder.svg?height=96&width=96")
  const [isUploading, setIsUploadingState] = useState(false)
  const fileInputRef = useRef < HTMLInputElement > (null)
  
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or GIF image.')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.')
      return
    }

    setIsUploadingState(true)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile_photo')
      formData.append('user_id', 'contractor_001')

      // Upload to Quick Actions API (we'll create this endpoint)
      const response = await fetch('/api/v1/file-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        setProfileImage(result.file_url || URL.createObjectURL(file))
        toast.success('Profile photo uploaded successfully!')
      } else {
        // Fallback: show the image locally even if upload fails
        setProfileImage(URL.createObjectURL(file))
        toast.success('Profile photo updated (stored locally)')
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Fallback: show the image locally
      setProfileImage(URL.createObjectURL(file))
      toast.success('Profile photo updated (stored locally)')
    } finally {
      setIsUploadingState(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-[#3B2352]/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] text-xl">JD</AvatarFallback>
              </Avatar>
              
              {/* Upload Button Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                   onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-6 w-6 text-white" />
              </div>
              
              {/* Progress Indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#3B2352] mb-2" style={{ fontFamily: "Merriweather, serif" }}>
                Jessica Davis
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-[#3B2352] text-white">Certified Doula</Badge>
                <Badge className="bg-[#D7C7ED] text-[#3B2352]">Postpartum Specialist</Badge>
                <Badge className="bg-[#D4AF37] text-white">5 Years Experience</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Downtown Area, 10 mile radius
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (555) 123-4567
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  jessica.davis@email.com
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#D4AF37]" />
                  4.9/5 (23 reviews)
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-[#3B2352] text-[#3B2352]"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Update Photo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Status */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Onboarding Status</CardTitle>
          <CardDescription>Complete all requirements to become active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { item: "Background Check", status: "completed", required: true },
              { item: "Contract Signed", status: "completed", required: true },
              { item: "Orientation Completed", status: "completed", required: true },
              { item: "Profile Bio", status: "completed", required: true },
              { item: "Availability Set", status: "completed", required: true },
              { item: "Insurance Documents", status: "pending", required: true },
              { item: "Reference Verification", status: "in-progress", required: true },
            ].map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-[#D7C7ED]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {requirement.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : requirement.status === "in-progress" ? (
                    <AlertCircle className="h-5 w-5 text-[#D4AF37]" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{requirement.item}</span>
                  {requirement.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={requirement.status === "completed" ? "default" : "secondary"}
                  className={
                    requirement.status === "completed"
                      ? "bg-green-500"
                      : requirement.status === "in-progress"
                        ? "bg-[#D4AF37]"
                        : "bg-red-500"
                  }
                >
                  {requirement.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Profile Information</CardTitle>
          <CardDescription>Update your professional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile(prev => ({...prev, firstName: e.target.value}))}
                required
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last Name" 
                value={profile.lastName}
                onChange={(e) => setProfile(prev => ({...prev, lastName: e.target.value}))}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            
            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
              required
              className="w-full border rounded px-3 py-2"
            />
            
            <input
              type="tel"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
              className="w-full border rounded px-3 py-2"
            />
            
            <select
              value={profile.role}
              onChange={(e) => setProfile(prev => ({...prev, role: e.target.value}))}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Role</option>
              <option value="client">Client</option>
              <option value="contractor">Contractor/Doula</option>
              <option value="admin">Administrator</option>
            </select>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Documents</CardTitle>
          <CardDescription>Manage your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Resume.pdf", type: "Resume", uploaded: "2024-01-01", status: "approved" },
              { name: "Certification.pdf", type: "Certification", uploaded: "2024-01-01", status: "approved" },
              { name: "Contract_Signed.pdf", type: "Contract", uploaded: "2024-01-05", status: "approved" },
              { name: "Insurance.pdf", type: "Insurance", uploaded: "2024-01-10", status: "pending" },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-[#D7C7ED]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#3B2352]" />
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-600">
                      {doc.type} • Uploaded {doc.uploaded}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={doc.status === "approved" ? "default" : "secondary"}
                  className={doc.status === "approved" ? "bg-green-500" : "bg-[#D4AF37]"}
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 border-2 border-dashed border-[#D7C7ED] rounded-lg text-center">
            <Upload className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload additional documents</p>
            <Button 
              variant="outline" 
              className="border-[#3B2352] text-[#3B2352]"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                input.multiple = true
                input.onchange = async (e) => {
                  const files = (e.target as HTMLInputElement).files
                  if (!files) return
                  
                  for (const file of Array.from(files)) {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', 'document')
                    formData.append('user_id', 'contractor_001')
                    
                    try {
                      const response = await fetch('/api/v1/file-upload', {
                        method: 'POST',
                        body: formData
                      })
                      const result = await response.json()
                      if (result.success) {
                        toast.success(`${file.name} uploaded successfully!`)
                      } else {
                        toast.error(`Failed to upload ${file.name}: ${result.error}`)
                      }
                    } catch (error) {
                      toast.error(`Error uploading ${file.name}`)
                    }
                  }
                }
                input.click()
              }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
