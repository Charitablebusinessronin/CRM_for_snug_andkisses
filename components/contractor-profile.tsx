"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle, XCircle, FileText, Video, ImageIcon } from "lucide-react"

export default function ContractorProfile() {
  const [onboardingStatus, setOnboardingStatus] = useState("pending-docs") // active, pending-docs, orientation, declined

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">My Profile</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your profile details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" defaultValue="Jessica Davis" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="jessica.d@example.com" type="email" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="(555) 987-6543" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="789 Oak Ave, Townsville, USA" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                defaultValue="Experienced postpartum doula passionate about supporting new families and ensuring a smooth transition into parenthood."
                rows={4}
              />
            </div>
            <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Update your role, certifications, and availability.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role-type">Role Type</Label>
                <Select defaultValue="postpartum-doula">
                  <SelectTrigger id="role-type">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postpartum-doula">Postpartum Doula</SelectItem>
                    <SelectItem value="sitter">Sitter</SelectItem>
                    <SelectItem value="birth-doula">Birth Doula</SelectItem>
                    <SelectItem value="dual">Dual (Doula & Sitter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input id="specialties" placeholder="e.g., Newborn care, sleep consulting" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability">Availability (can be synced to iCal/Google)</Label>
              <Textarea id="availability" placeholder="e.g., Mon-Fri 9 AM - 5 PM, Weekends by arrangement" rows={3} />
            </div>
            <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
              Update Professional Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding & Documents</CardTitle>
            <CardDescription>Track your onboarding status and upload required documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label>Overall Onboarding Status:</Label>
              <span className={`font-semibold ${onboardingStatus === "active" ? "text-green-600" : "text-orange-500"}`}>
                {onboardingStatus === "active" && "Active"}
                {onboardingStatus === "pending-docs" && "Pending Documents"}
                {onboardingStatus === "orientation" && "Orientation Required"}
                {onboardingStatus === "declined" && "Declined"}
              </span>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>Resume</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="resume-upload" type="file" className="max-w-[150px]" />
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {onboardingStatus === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span>Headshot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="headshot-upload" type="file" className="max-w-[150px]" />
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {onboardingStatus === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <span>Intro Video</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="video-upload" type="file" className="max-w-[150px]" />
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {onboardingStatus === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>Contract/NDA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="contract-upload" type="file" className="max-w-[150px]" />
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {onboardingStatus === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Label>Contract Expiration:</Label>
              <span className="font-semibold text-muted-foreground">2025-12-31</span>
            </div>
            <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">Update Documents</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
