"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Heart, Baby } from "lucide-react"

/**
 * The main component for the job board.
 * It displays a list of available jobs and allows contractors to filter and apply for them.
 * @returns {JSX.Element} The job board component.
 */
export function JobBoard() {
  const [jobs] = useState([
    {
      id: 1,
      type: "Postpartum",
      title: "Postpartum Support - New Mom",
      client: "Anonymous Client",
      date: "2024-01-20",
      time: "10:00 AM - 6:00 PM",
      duration: "8 hours",
      location: "Downtown Area",
      distance: "2.3 miles",
      rate: "$25/hr",
      total: "$200",
      description:
        "Looking for experienced postpartum doula to help with newborn care, light housework, and emotional support.",
      requirements: ["Newborn care experience", "CPR certified", "References required"],
      urgent: false,
    },
    {
      id: 2,
      type: "Birth Support",
      title: "Birth Doula - First Time Mom",
      client: "Anonymous Client",
      date: "2024-01-25",
      time: "On-call (estimated 12-16 hours)",
      duration: "Variable",
      location: "Midtown Hospital",
      distance: "5.1 miles",
      rate: "$35/hr",
      total: "$420-560",
      description:
        "First-time mom seeking birth doula for hospital birth. Looking for continuous support during labor.",
      requirements: ["Birth doula certification", "Hospital experience", "Available on-call"],
      urgent: true,
    },
    {
      id: 3,
      type: "Backup Care",
      title: "Emergency Childcare - 2 Children",
      client: "Anonymous Client",
      date: "2024-01-18",
      time: "7:00 AM - 7:00 PM",
      duration: "12 hours",
      location: "Suburban Area",
      distance: "8.2 miles",
      rate: "$20/hr",
      total: "$240",
      description: "Need backup childcare for 2 children (ages 3 and 6) due to family emergency.",
      requirements: ["Childcare experience", "Background check", "Own transportation"],
      urgent: true,
    },
  ])

  const getJobIcon = (type: string) => {
    switch (type) {
      case "Postpartum":
        return <Heart className="h-5 w-5" />
      case "Birth Support":
        return <Baby className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getJobColor = (type: string) => {
    switch (type) {
      case "Postpartum":
        return "border-[#D7C7ED] text-[#3B2352] bg-[#D7C7ED]/10"
      case "Birth Support":
        return "border-[#3B2352] text-[#3B2352] bg-[#3B2352]/10"
      case "Backup Care":
        return "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10"
      default:
        return "border-gray-300 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Find Jobs</CardTitle>
          <CardDescription>Filter available opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="postpartum">Postpartum</SelectItem>
                <SelectItem value="birth">Birth Support</SelectItem>
                <SelectItem value="backup">Backup Care</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Max distance (miles)" type="number" />
            <Input placeholder="Min rate ($/hr)" type="number" />
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className={`border-[#3B2352]/20 ${job.urgent ? "ring-2 ring-[#D4AF37]/50" : ""}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getJobColor(job.type)}>
                    {getJobIcon(job.type)}
                    {job.type}
                  </Badge>
                  {job.urgent && (
                    <Badge variant="destructive" className="bg-[#D4AF37] text-white">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#3B2352]">{job.total}</div>
                  <div className="text-sm text-gray-600">{job.rate}</div>
                </div>
              </div>
              <CardTitle className="text-xl" style={{ fontFamily: "Merriweather, serif" }}>
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700" style={{ fontFamily: "Lato, sans-serif" }}>
                {job.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {job.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {job.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {job.location} ({job.distance})
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#3B2352] mb-2">Requirements:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#D7C7ED] rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
                  style={{ fontFamily: "Nunito Sans, sans-serif" }}
                >
                  Express Interest
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
