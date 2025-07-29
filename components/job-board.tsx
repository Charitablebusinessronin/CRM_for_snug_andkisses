"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, DollarSign } from "lucide-react"
import { Calendar } from "lucide-react"

export default function JobBoard() {
  const [filterServiceType, setFilterServiceType] = useState("All Service Types")
  const [filterLocation, setFilterLocation] = useState("")

  const jobPostings = [
    {
      id: 1,
      title: "Postpartum Doula - Overnight",
      serviceType: "Postpartum",
      client: "New Family",
      location: "Downtown",
      date: "2024-07-20",
      time: "9 PM - 5 AM",
      pay: "$35/hr",
      description: "Seeking an experienced postpartum doula for overnight support.",
    },
    {
      id: 2,
      title: "Sitter - Weekend Day",
      serviceType: "Sitter",
      client: "Existing Client",
      location: "Suburbs",
      date: "2024-07-22",
      time: "10 AM - 4 PM",
      pay: "$25/hr",
      description: "Reliable sitter needed for two children (ages 3 and 6) on a Saturday.",
    },
    {
      id: 3,
      title: "Birth Doula - On Call",
      serviceType: "Birth",
      client: "First-time Parents",
      location: "City Center",
      date: "Aug 2024 (on call)",
      time: "Flexible",
      pay: "Flat Rate",
      description: "Seeking a compassionate birth doula for on-call support.",
    },
    {
      id: 4,
      title: "Postpartum Doula - Daytime",
      serviceType: "Postpartum",
      client: "Returning Client",
      location: "North End",
      date: "2024-07-25",
      time: "9 AM - 1 PM",
      pay: "$30/hr",
      description: "Daytime support for a family with a newborn, focusing on feeding and light household tasks.",
    },
  ]

  const filteredJobs = jobPostings.filter((job) => {
    const matchesService = filterServiceType !== "All Service Types" ? job.serviceType === filterServiceType : true
    const matchesLocation = filterLocation ? job.location.toLowerCase().includes(filterLocation.toLowerCase()) : true
    return matchesService && matchesLocation
  })

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
        <h1 className="text-xl font-semibold text-primary-foreground">Job Board</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Job Postings</CardTitle>
            <CardDescription>Browse and express interest in new shifts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Service Types">All Service Types</SelectItem>
                  <SelectItem value="Postpartum">Postpartum</SelectItem>
                  <SelectItem value="Sitter">Sitter</SelectItem>
                  <SelectItem value="Birth">Birth</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by Location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => {
                  setFilterServiceType("All Service Types")
                  setFilterLocation("")
                }}
              >
                Clear Filters
              </Button>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="grid gap-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="border-[#D7C7ED]/50">
                    <CardHeader>
                      <CardTitle className="text-[#3B2352]">{job.title}</CardTitle>
                      <CardDescription className="text-gray-600">Client: {job.client}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-[#3B2352]" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-[#3B2352]" /> {job.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-[#3B2352]" /> {job.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign className="h-4 w-4 text-[#D4AF37]" /> {job.pay}
                      </div>
                      <p className="text-sm text-gray-800 mt-2">{job.description}</p>
                      <Button className="mt-4 w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                        Express Interest
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No job postings match your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
