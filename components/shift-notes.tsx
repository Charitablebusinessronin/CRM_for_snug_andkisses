"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ShiftNotes() {
  const [activeTab, setActiveTab] = useState("submit")

  const submittedNotes = [
    {
      id: 1,
      client: "Sarah Mitchell",
      date: "2024-07-15",
      duration: "4 hours",
      notes: "Baby fed well, good nap schedule. Discussed next steps with parents.",
    },
    {
      id: 2,
      client: "David Lee",
      date: "2024-07-12",
      duration: "6 hours",
      notes: "Overnight support. Baby slept through the night. Parents got much-needed rest.",
    },
    {
      id: 3,
      client: "Emily White",
      date: "2024-07-10",
      duration: "3 hours",
      notes: "Daytime visit. Assisted with light chores and provided emotional support.",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Shift Notes</h1>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-primary text-primary-foreground">
              <TabsTrigger
                value="submit"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Submit New Note
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
              >
                Notes History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Shift Note</CardTitle>
                <CardDescription>Record details for a recently completed shift.</CardDescription>
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
                <div className="grid gap-2">
                  <Label htmlFor="sign-off">Upload Digital Shift Sign-off (PDF/Image)</Label>
                  <Input id="sign-off" type="file" />
                </div>
                <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">Submit Shift Note</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Shift Notes History</CardTitle>
                <CardDescription>Review all your submitted shift notes.</CardDescription>
              </CardHeader>
              <CardContent>
                {submittedNotes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes Summary</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submittedNotes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell className="font-medium">{note.client}</TableCell>
                          <TableCell>{note.date}</TableCell>
                          <TableCell>{note.duration}</TableCell>
                          <TableCell>{note.notes.substring(0, 50)}...</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No shift notes submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
