"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, DollarSign, Users, Activity, Mail, Phone, MapPin } from "lucide-react"

// Define a type for your client data
interface Client {
  name: string
  status: string
  lastContact: string
  nextVisit: string
}

export function ClientPortal() {
  // Changed to named export
  const [activeTab, setActiveTab] = useState("dashboard")
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoadingClients(true)
        setClientError(null)
        // Fetch data from your Next.js API route, which in turn calls Zoho Catalyst
        const response = await fetch("/api/catalyst/clients")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch clients from Catalyst backend.")
        }
        const data: Client[] = await response.json()
        setClients(data)
      } catch (error: any) {
        setClientError(error.message)
        console.error("Error fetching clients:", error)
      } finally {
        setLoadingClients(false)
      }
    }

    fetchClients()
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Client Portal</h1>
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
                value="requests"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Requests
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Support
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
                  <CardTitle className="text-sm font-medium">Hours Purchased</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">120</div>
                  <p className="text-xs text-muted-foreground">+20 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Used</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85</div>
                  <p className="text-xs text-muted-foreground">+15 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">35</div>
                  <p className="text-xs text-muted-foreground">Hours remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Doula</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Sarah Johnson</div>
                  <p className="text-xs text-muted-foreground">Next visit: July 25th</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Info Sheet</CardTitle>
                  <CardDescription>Your personal and service details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Sarah Mitchell" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="sarah.m@example.com" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="(555) 123-4567" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Main St, Anytown, USA" readOnly />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Doula/Sitter Request Forms</CardTitle>
                  <CardDescription>Submit new requests or view past ones.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Button className="w-full">New Doula Request</Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    New Sitter Request
                  </Button>
                  <Button className="w-full" variant="secondary">
                    View Past Requests
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Fetched Clients from Zoho Catalyst</CardTitle>
                <CardDescription>
                  {loadingClients ? (
                    "Loading clients from Zoho Catalyst backend..."
                  ) : clientError ? (
                    <span className="text-red-500">
                      Error: {clientError} Please ensure your Zoho Catalyst API is running and accessible.
                    </span>
                  ) : (
                    "This data is fetched from your Zoho Catalyst backend via a Next.js API route."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length > 0 && !loadingClients && !clientError ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Next Visit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.status}</TableCell>
                          <TableCell>{client.lastContact}</TableCell>
                          <TableCell>{client.nextVisit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  !loadingClients && !clientError && <p>No clients found in Zoho Catalyst or data is empty.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Your Service Requests</CardTitle>
                <CardDescription>Manage your doula and sitter requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Postpartum Doula Request</h3>
                      <p className="text-sm text-muted-foreground">Status: Pending Interview</p>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Night Nanny Sitter Request</h3>
                      <p className="text-sm text-muted-foreground">Status: Matched with Jessica D.</p>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </div>
                  <Button className="w-full mt-4">Submit New Request</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage Dashboard</CardTitle>
                <CardDescription>Track your purchased hours and invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Invoice #2023-001</h3>
                      <p className="text-sm text-muted-foreground">Amount: $1,200 | Status: Paid</p>
                    </div>
                    <Button variant="outline">View Invoice</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h3 className="font-semibold">Invoice #2023-002</h3>
                      <p className="text-sm text-muted-foreground">Amount: $800 | Status: Due</p>
                    </div>
                    <Button variant="default">Pay Now</Button>
                  </div>
                  <Button className="w-full mt-4">Purchase More Hours</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get assistance with your services.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@snugandkisses.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">(800) 555-1234</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Office Address</h3>
                    <p className="text-sm text-muted-foreground">456 Comfort Lane, Suite 100, Serenity City</p>
                  </div>
                </div>
                <Button className="w-full mt-4">Submit a Support Ticket</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
