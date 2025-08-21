"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, Download, Eye, Calendar, User, Baby, 
  Heart, Shield, AlertCircle, CheckCircle, Lock
} from "lucide-react"
import { ClientDataService } from "../services/ClientDataService"
import type { HealthRecord, VitalSigns, MedicalHistory } from "../types/ClientTypes"

interface HealthRecordsProps {
  clientId: string
}

/**
 * Health Records Component - HIPAA Compliant Medical Record Access
 * Provides secure access to postpartum health records and medical history
 */
export function HealthRecords({ clientId }: HealthRecordsProps) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)

  const clientDataService = new ClientDataService()

  useEffect(() => {
    loadHealthData()
  }, [clientId])

  const loadHealthData = async () => {
    try {
      setLoading(true)
      const [records, vitals, history] = await Promise.all([
        clientDataService.getHealthRecords(clientId),
        clientDataService.getVitalSigns(clientId),
        clientDataService.getMedicalHistory(clientId)
      ])
      
      setHealthRecords(records)
      setVitalSigns(vitals)
      setMedicalHistory(history)
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadRecord = async (recordId: string) => {
    try {
      await clientDataService.downloadHealthRecord(recordId)
    } catch (error) {
      console.error('Failed to download record:', error)
      alert('Failed to download record. Please try again.')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'postpartum-checkup': return Heart
      case 'lab-results': return FileText
      case 'imaging': return Eye
      case 'vaccination': return Shield
      case 'mental-health': return User
      case 'newborn-care': return Baby
      default: return FileText
    }
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'postpartum-checkup': return 'text-pink-600'
      case 'lab-results': return 'text-blue-600'
      case 'imaging': return 'text-purple-600'
      case 'vaccination': return 'text-green-600'
      case 'mental-health': return 'text-orange-600'
      case 'newborn-care': return 'text-teal-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading your health records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HIPAA Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">HIPAA Protected Health Information</h4>
              <p className="text-blue-800 text-sm">
                Your health records are protected under HIPAA regulations. All access is logged for your security.
                Only you and authorized healthcare providers can view this information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                Your Medical Records
              </CardTitle>
              <CardDescription>
                View and download your postpartum care medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthRecords.length > 0 ? (
                <div className="space-y-4">
                  {healthRecords.map((record) => {
                    const IconComponent = getRecordTypeIcon(record.type)
                    return (
                      <div key={record.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <IconComponent className={`h-6 w-6 mt-1 ${getRecordTypeColor(record.type)}`} />
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#3B2352] mb-1">
                                {record.title}
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(record.date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{record.providerName}</span>
                                </div>
                                {record.summary && (
                                  <p className="text-gray-700 mt-2">{record.summary}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Badge
                              variant="secondary"
                              className="bg-[#D7C7ED] text-[#3B2352]"
                            >
                              {record.type.replace('-', ' ')}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadRecord(record.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {record.findings && record.findings.length > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-[#D7C7ED]">
                            <h5 className="font-medium text-[#3B2352] mb-2">Key Findings:</h5>
                            <ul className="space-y-1">
                              {record.findings.map((finding, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {record.recommendations && record.recommendations.length > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-200">
                            <h5 className="font-medium text-[#3B2352] mb-2">Recommendations:</h5>
                            <ul className="space-y-1">
                              {record.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No medical records available</p>
                  <p className="text-sm text-gray-500">Your records will appear here after appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                Vital Signs History
              </CardTitle>
              <CardDescription>
                Track your postpartum vital signs and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vitalSigns.length > 0 ? (
                <div className="space-y-4">
                  {vitalSigns.map((vital) => (
                    <div key={vital.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <span className="font-semibold text-[#3B2352]">
                            {formatDate(vital.date)}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {vital.takenBy}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vital.bloodPressure && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Blood Pressure</p>
                            <p className="font-semibold text-[#3B2352]">{vital.bloodPressure}</p>
                          </div>
                        )}
                        {vital.heartRate && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Heart Rate</p>
                            <p className="font-semibold text-[#3B2352]">{vital.heartRate} bpm</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Temperature</p>
                            <p className="font-semibold text-[#3B2352]">{vital.temperature}°F</p>
                          </div>
                        )}
                        {vital.weight && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Weight</p>
                            <p className="font-semibold text-[#3B2352]">{vital.weight} lbs</p>
                          </div>
                        )}
                      </div>

                      {vital.notes && (
                        <div className="mt-3 p-2 bg-white rounded text-sm">
                          <p className="font-medium text-[#3B2352]">Notes:</p>
                          <p className="text-gray-700">{vital.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vital signs recorded</p>
                  <p className="text-sm text-gray-500">Vital signs will be recorded during appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                Medical History
              </CardTitle>
              <CardDescription>
                Your comprehensive medical history and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#3B2352] mb-1">
                            {item.condition}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Diagnosed: {formatDate(item.diagnosedDate)}</p>
                            {item.status && (
                              <Badge
                                variant="secondary"
                                className={
                                  item.status === 'active'
                                    ? 'bg-red-100 text-red-800'
                                    : item.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {item.status}
                              </Badge>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-gray-700 mt-2 text-sm">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No medical history recorded</p>
                  <p className="text-sm text-gray-500">Medical history will be updated during appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                Healthcare Documents
              </CardTitle>
              <CardDescription>
                Access your healthcare documents and forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Lock className="h-16 w-16 text-[#D7C7ED] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                  Secure Document Portal
                </h3>
                <p className="text-gray-600 mb-4">
                  HIPAA-compliant document management coming soon
                </p>
                <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                  Coming Soon - Document Portal
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}