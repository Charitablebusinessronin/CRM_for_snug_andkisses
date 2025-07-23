"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, Mail, Star, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

/**
 * The main component for the contractor profile.
 * It displays and allows editing of the contractor's profile information, onboarding status, and documents.
 * @returns {JSX.Element} The contractor profile component.
 */
export function ContractorProfile() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-[#3B2352]/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] text-xl">JD</AvatarFallback>
            </Avatar>
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
            <Button variant="outline" className="border-[#3B2352] text-[#3B2352]">
              <Upload className="h-4 w-4 mr-2" />
              Update Photo
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="Jessica" />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Davis" />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              defaultValue="I am a certified postpartum doula with 5 years of experience supporting families during their transition to parenthood. I specialize in newborn care, breastfeeding support, and helping families establish healthy routines."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input id="certifications" defaultValue="DONA International, CPR/First Aid" />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" defaultValue="5" type="number" />
            </div>
          </div>

          <div>
            <Label htmlFor="specialties">Specialties</Label>
            <Input id="specialties" defaultValue="Postpartum care, Newborn care, Breastfeeding support" />
          </div>

          <div>
            <Label htmlFor="availability">Service Areas</Label>
            <Input id="availability" defaultValue="Downtown, Midtown, Suburban areas within 10 miles" />
          </div>

          <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">Update Profile</Button>
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
            <Button variant="outline" className="border-[#3B2352] text-[#3B2352]">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
