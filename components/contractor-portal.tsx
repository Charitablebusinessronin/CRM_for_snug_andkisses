"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Briefcase, MessageSquare, DollarSign, PlusCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ContractorPortal() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Contractor Portal</h1>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-primary text-primary-foreground">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="job-board"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Job Board
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="shift-notes"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Shift Notes
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="invoicing"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Invoicing
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Messages
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Next shift: Tomorrow, 10 AM</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Job Postings</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Check the job board!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">From Admin & Client</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Shift Notes</CardTitle>
                  <CardDescription>Your latest submitted shift summaries.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <h3 className="font-semibold">Client: Sarah M.</h3>
                        <p className="text-sm text-muted-foreground">Date: 2024-07-10 | Duration: 4 hrs</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <h3 className="font-semibold">Client: David L.</h3>
                        <p className="text-sm text-muted-foreground">Date: 2024-07-08 | Duration: 6 hrs</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Perform common tasks quickly.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Button className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" /> Submit New Shift Note
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" /> Update Availability
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <MessageSquare className="h-4 w-4 mr-2" /> Compose New Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="job-board">
            <Card>
              <CardHeader>
                <CardTitle>Job Board</CardTitle>
                <CardDescription>Browse available shifts and express interest.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Postpartum Doula - Overnight</h3>
                      <p className="text-sm text-muted-foreground">
                        Client: New Family | Location: Downtown | Date: 2024-07-20
                      </p>
                    </div>
                    <Button>Express Interest</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Sitter - Weekend Day</h3>
                      <p className="text-sm text-muted-foreground">
                        Client: Existing Client | Location: Suburbs | Date: 2024-07-22
                      </p>
                    </div>
                    <Button>Express Interest</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Birth Doula - On Call</h3>
                      <p className="text-sm text-muted-foreground">
                        Client: First-time Parents | Location: City Center | Date: Aug 2024
                      </p>
                    </div>
                    <Button>Express Interest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
                <CardDescription>View your confirmed shifts and update availability.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                  <p>Your personal calendar and availability management would be integrated here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shift-notes">
            <Card>
              <CardHeader>
                <CardTitle>Shift Note Submission</CardTitle>
                <CardDescription>Submit notes for completed shifts.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" placeholder="e.g., Sarah Mitchell" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift-date">Shift Date</Label>
                  <Input id="shift-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift-duration">Shift Duration (hours)</Label>
                  <Input id="shift-duration" type="number" placeholder="e.g., 4" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Shift Notes</Label>
                  <Textarea id="notes" placeholder="Enter detailed notes about the shift..." rows={5} />
                </div>
                <Button className="w-full">Submit Shift Note</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Manage your personal information and onboarding status.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue="Jessica Davis" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Label htmlFor="role-type">Role Type</Label>
                  <Input id="role-type" defaultValue="Postpartum Doula" readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Experienced postpartum doula passionate about supporting new families."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input id="resume" type="file" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headshot">Headshot</Label>
                  <Input id="headshot" type="file" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video">Intro Video</Label>
                  <Input id="video" type="file" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Orientation Status</Label>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoicing">
            <Card>
              <CardHeader>
                <CardTitle>Invoicing</CardTitle>
                <CardDescription>Submit invoices and track payment status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" /> Create New Invoice
                  </Button>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">INV-001</TableCell>
                        <TableCell>Sarah M.</TableCell>
                        <TableCell>$400</TableCell>
                        <TableCell>Pending Approval</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INV-002</TableCell>
                        <TableCell>David L.</TableCell>
                        <TableCell>$600</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communicate with admin and clients.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Admin: New Job Posting</h3>
                      <p className="text-sm text-muted-foreground">"Check out the new overnight shift available!"</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Client Sarah M.: Question about next visit</h3>
                      <p className="text-sm text-muted-foreground">"Can we adjust the start time tomorrow?"</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  <Button className="w-full mt-4">Compose New Message</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
