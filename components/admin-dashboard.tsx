"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Mail,
  MessageSquare,
  PlusCircle,
  Search,
  User,
  Users,
  XCircle,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Admin Dashboard</h1>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-primary text-primary-foreground">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applicants"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Applicants
              </TabsTrigger>
              <TabsTrigger
                value="clients"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">150</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Shifts</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (QTD)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last quarter</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Applicant Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={[
                        { name: "New", total: 120 },
                        { name: "Qualified", total: 80 },
                        { name: "Interview", total: 50 },
                        { name: "Orientation", total: 30 },
                        { name: "Active", total: 60 },
                      ]}
                    >
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Log</CardTitle>
                  <CardDescription>Latest actions across the CRM.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New applicant: Jane Doe</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Shift confirmed: Client Sarah M.</p>
                        <p className="text-sm text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Interview cancelled: John Smith</p>
                        <p className="text-sm text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New message from Contractor Emily R.</p>
                        <p className="text-sm text-muted-foreground">4 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Tracking</CardTitle>
                <CardDescription>Manage and track all doula and sitter applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Input placeholder="Search applicants..." className="max-w-sm" />
                  <Button>
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add New Applicant
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Application Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Jane Doe</TableCell>
                      <TableCell>Doula</TableCell>
                      <TableCell>New</TableCell>
                      <TableCell>2024-07-15</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">John Smith</TableCell>
                      <TableCell>Sitter</TableCell>
                      <TableCell>Interview</TableCell>
                      <TableCell>2024-07-10</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Emily White</TableCell>
                      <TableCell>Dual</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>2024-06-01</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage all client profiles and service history.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Input placeholder="Search clients..." className="max-w-sm" />
                  <Button>
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add New Client
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Contractor</TableHead>
                      <TableHead>Hours Remaining</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Sarah Mitchell</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>Jessica Davis</TableCell>
                      <TableCell>24</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">David Lee</TableCell>
                      <TableCell>Intake Complete</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Maria Garcia</TableCell>
                      <TableCell>Archived</TableCell>
                      <TableCell>Emily White</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Management</CardTitle>
                <CardDescription>View and manage all interviews and shift schedules.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                  <p>Full calendar view and conflict management would be integrated here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>BI & Reports</CardTitle>
                <CardDescription>Generate and export key performance indicators and usage metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" /> Generate Monthly Contractor Report
                  </Button>
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" /> Generate Client Usage Report
                  </Button>
                  <Button className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" /> Export Email Logs
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <p>Zoho Analytics integration for detailed dashboards would be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
