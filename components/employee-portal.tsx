"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, MessageSquare, FileText, User } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function EmployeePortal() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Employee Portal</h1>
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
                value="schedule"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="clients"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger
                value="shift-notes"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Shift Notes
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
                  <CardTitle className="text-sm font-medium">Assigned Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Currently managing</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Next shift: Tomorrow, 2 PM</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Shift Notes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">For client Sarah M.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">From Admin & Team</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Assigned Clients</CardTitle>
                  <CardDescription>Read-only access to client profiles.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Interaction</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Sarah Mitchell</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>2024-07-15</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Jessica Brown</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>2024-07-12</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Team Communications</CardTitle>
                  <CardDescription>Latest updates from your team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Team Meeting Reminder</p>
                        <p className="text-sm text-muted-foreground">"Don't forget our weekly sync on Friday."</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New Policy Update</p>
                        <p className="text-sm text-muted-foreground">"Review the updated shift logging guidelines."</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
                <CardDescription>View your personal and team master schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                  <p>Your personal and team master schedule would be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Client Profiles</CardTitle>
                <CardDescription>Read-only access to client details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Last Shift</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Sarah Mitchell</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>Postpartum Doula</TableCell>
                      <TableCell>2024-07-15</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jessica Brown</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>Night Nanny</TableCell>
                      <TableCell>2024-07-12</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Michael Chen</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>Birth Doula</TableCell>
                      <TableCell>2024-07-10</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shift-notes">
            <Card>
              <CardHeader>
                <CardTitle>Submit Shift Notes</CardTitle>
                <CardDescription>Record details for client shifts.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client-select">Client</Label>
                  <Input id="client-select" placeholder="Select client" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift-date">Date of Shift</Label>
                  <Input id="shift-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift-duration">Duration (hours)</Label>
                  <Input id="shift-duration" type="number" placeholder="e.g., 4" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Enter detailed shift notes..." rows={5} />
                </div>
                <Button className="w-full">Submit Notes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Internal Messages</CardTitle>
                <CardDescription>Communicate with your team and admin.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Admin: Policy Update</h3>
                      <p className="text-sm text-muted-foreground">"Please review the new client intake process."</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Team: Schedule Sync</h3>
                      <p className="text-sm text-muted-foreground">"Reminder for tomorrow's schedule review."</p>
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
