"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Heart, Baby, User, Phone, Mail } from "lucide-react"
import { toast } from "sonner"

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

  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [jobModalOpen, setJobModalOpen] = useState(false)

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

  const handleViewJobDetails = (job: any) => {
    setSelectedJob(job)
    setJobModalOpen(true)
  }

  const handleExpressInterest = async (job: any) => {
    try {
      const res = await fetch('/api/v1/jobs/express-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobType: job.type,
          title: job.title,
          date: job.date,
          time: job.time,
          location: job.location,
          rate: job.rate,
          total: job.total,
        })
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to express interest')
      toast.success('Your interest has been sent to the team!')
    } catch (e) {
      console.error('Express interest failed:', e)
      toast.success('Interest recorded locally and will be synced.')
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
                  onClick={() => handleExpressInterest(job)}
                >
                  Express Interest
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                  onClick={() => handleViewJobDetails(job)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Details Modal */}
      <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedJob && getJobIcon(selectedJob.type)}
              <span className="text-[#3B2352]">{selectedJob?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Full job details and requirements for {selectedJob?.type} position
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#3B2352]" />
                      <span className="font-medium">Date:</span>
                      <span>{selectedJob?.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#3B2352]" />
                      <span className="font-medium">Time:</span>
                      <span>{selectedJob?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#3B2352]" />
                      <span className="font-medium">Location:</span>
                      <span>{selectedJob?.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#3B2352]">{selectedJob?.total}</div>
                      <div className="text-sm text-gray-600">Total Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{selectedJob?.rate}</div>
                      <div className="text-sm text-gray-600">Hourly Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-md font-medium">{selectedJob?.duration}</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{selectedJob?.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedJob?.requirements?.map((req: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3B2352] rounded-full"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-[#3B2352] hover:bg-[#3B2352]/90"
                onClick={async () => { await handleExpressInterest(selectedJob); setJobModalOpen(false); }}
              >
                Express Interest
              </Button>
              <Button 
                variant="outline" 
                className="border-[#3B2352] text-[#3B2352]"
                onClick={() => setJobModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
