"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Brain, Users, MapPin, Clock, Star, DollarSign, Search,
  Filter, TrendingUp, CheckCircle, AlertCircle, Zap, Heart
} from "lucide-react"
import { MatchingEngine } from "../services/MatchingEngine"
import type { MatchingRequest, MatchingResponse, MatchResult, ClientRequirements } from "../types/MatchingTypes"

interface MatchingDashboardProps {
  onMatchCompleted?: (matches: MatchResult[]) => void
}

/**
 * AI Matching Dashboard Component - HIPAA Compliant Caregiver Matching Interface
 * Advanced AI-powered matching system for healthcare caregiver selection
 */
export function MatchingDashboard({ onMatchCompleted }: MatchingDashboardProps) {
  const [clientRequirements, setClientRequirements] = useState<Partial<ClientRequirements>>({
    clientId: '',
    location: {
      address: '',
      coordinates: { latitude: 45.5152, longitude: -122.6784 },
      radius: 25
    },
    careNeeds: {
      primary: [],
      specialized: []
    },
    schedule: {
      startDate: '',
      frequency: 'daily',
      timeSlots: [],
      flexibility: 'flexible'
    },
    preferences: {
      languagePreferences: ['English'],
      experienceLevel: 'intermediate'
    },
    budget: {
      hourlyRateRange: { min: 50, max: 100 }
    },
    urgency: 'within-week'
  })
  
  const [matchResults, setMatchResults] = useState<MatchingResponse | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)
  const [showRequirementsForm, setShowRequirementsForm] = useState(false)
  const [recentMatches, setRecentMatches] = useState<MatchingResponse[]>([])

  const matchingEngine = new MatchingEngine()

  useEffect(() => {
    // Load recent matching history
    loadRecentMatches()
  }, [])

  const loadRecentMatches = async () => {
    // TODO: Implement loading recent matches from API
    setRecentMatches([])
  }

  const handleStartMatching = async () => {
    if (!clientRequirements.clientId || !clientRequirements.location?.address) {
      return
    }

    try {
      setIsMatching(true)

      const request: MatchingRequest = {
        requestId: `match_${Date.now()}`,
        clientRequirements: clientRequirements as ClientRequirements,
        maxResults: 10,
        priority: clientRequirements.urgency === 'immediate' ? 'urgent' : 'standard',
        requestedAt: new Date().toISOString(),
        requestedBy: 'admin@snugkisses.com'
      }

      const response = await matchingEngine.findMatches(request)
      setMatchResults(response)
      setRecentMatches(prev => [response, ...prev.slice(0, 9)]) // Keep last 10

      if (onMatchCompleted) {
        onMatchCompleted(response.matches)
      }

    } catch (error) {
      console.error('Matching failed:', error)
    } finally {
      setIsMatching(false)
    }
  }

  const handleAcceptMatch = async (match: MatchResult) => {
    try {
      // TODO: Implement match acceptance logic
      console.log('Accepting match:', match)
      
      // Update match status
      const updatedResults = {
        ...matchResults!,
        matches: matchResults!.matches.map(m => 
          m.matchId === match.matchId 
            ? { ...m, status: 'accepted' as const }
            : m
        )
      }
      setMatchResults(updatedResults)
      
    } catch (error) {
      console.error('Failed to accept match:', error)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800'
      case 'within-24h': return 'bg-orange-100 text-orange-800'
      case 'within-week': return 'bg-blue-100 text-blue-800'
      case 'flexible': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-[#3B2352]" />
              <span>AI Caregiver Matching</span>
            </div>
          </CardTitle>
          <CardDescription>
            Advanced AI-powered system for matching clients with qualified caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Our AI system analyzes location, qualifications, availability, and preferences 
                to find the best caregiver matches for your clients.
              </p>
            </div>
            <Button
              onClick={() => setShowRequirementsForm(true)}
              className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Matches
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {matchResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#3B2352]">
                {matchResults.matches.length}
              </p>
              <p className="text-sm text-gray-600">Matches Found</p>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#3B2352]">
                {matchResults.processingTimeMs}ms
              </p>
              <p className="text-sm text-gray-600">Processing Time</p>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#3B2352]">
                {matchResults.matches.length > 0 
                  ? formatScore(Math.max(...matchResults.matches.map(m => m.overallScore)))
                  : '0'
                }
              </p>
              <p className="text-sm text-gray-600">Best Score</p>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4 text-center">
              <Filter className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#3B2352]">
                {matchResults.totalCandidatesEvaluated}
              </p>
              <p className="text-sm text-gray-600">Evaluated</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Match Results */}
      {matchResults && matchResults.matches.length > 0 && (
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle>Match Results</CardTitle>
            <CardDescription>
              Caregivers ranked by compatibility with your requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchResults.matches.map((match, index) => (
                <Card key={match.matchId} className="border-[#D7C7ED]/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#D7C7ED] rounded-full flex items-center justify-center">
                          <span className="text-[#3B2352] font-semibold">#{index + 1}</span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#3B2352]">
                            Caregiver {match.caregiverId}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>Match Score: {formatScore(match.overallScore)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="h-4 w-4" />
                              <span>Confidence: {formatScore(match.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={match.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {match.status}
                        </Badge>
                        <span className={`text-lg font-bold ${getScoreColor(match.overallScore)}`}>
                          {formatScore(match.overallScore)}
                        </span>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className={`ml-2 font-medium ${getScoreColor(match.breakdown.locationScore)}`}>
                          {match.breakdown.locationScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Qualifications:</span>
                        <span className={`ml-2 font-medium ${getScoreColor(match.breakdown.qualificationScore)}`}>
                          {match.breakdown.qualificationScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Availability:</span>
                        <span className={`ml-2 font-medium ${getScoreColor(match.breakdown.availabilityScore)}`}>
                          {match.breakdown.availabilityScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Performance:</span>
                        <span className={`ml-2 font-medium ${getScoreColor(match.breakdown.performanceScore)}`}>
                          {match.breakdown.performanceScore}
                        </span>
                      </div>
                    </div>

                    {/* Strengths and Concerns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {match.explanation.strengths.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-600 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Strengths
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.explanation.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {match.explanation.concerns.length > 0 && (
                        <div>
                          <h5 className="font-medium text-orange-600 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Considerations
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.explanation.concerns.map((concern, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Estimated Cost */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-[#3B2352]" />
                        <span className="text-sm font-medium">Estimated Cost:</span>
                        <span className="text-lg font-bold text-[#3B2352]">
                          ${match.estimatedCost.hourlyRate}/hour
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMatch(match)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Match Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Score Breakdown</h4>
                                <div className="space-y-2">
                                  {Object.entries(match.breakdown).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                                      <span className={getScoreColor(value as number)}>{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {match.explanation.recommendations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Recommendations</h4>
                                  <ul className="space-y-1">
                                    {match.explanation.recommendations.map((rec, i) => (
                                      <li key={i} className="text-sm text-gray-600">• {rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {match.status !== 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptMatch(match)}
                            className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Form Dialog */}
      <Dialog open={showRequirementsForm} onOpenChange={setShowRequirementsForm}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Requirements</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client ID</Label>
                <Input
                  value={clientRequirements.clientId}
                  onChange={(e) => setClientRequirements(prev => ({
                    ...prev,
                    clientId: e.target.value
                  }))}
                  placeholder="Enter client ID..."
                />
              </div>
              
              <div>
                <Label>Urgency</Label>
                <Select 
                  value={clientRequirements.urgency}
                  onValueChange={(value: any) => setClientRequirements(prev => ({
                    ...prev,
                    urgency: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="within-24h">Within 24 Hours</SelectItem>
                    <SelectItem value="within-week">Within a Week</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#3B2352]">Location</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={clientRequirements.location?.address}
                    onChange={(e) => setClientRequirements(prev => ({
                      ...prev,
                      location: { ...prev.location!, address: e.target.value }
                    }))}
                    placeholder="Enter client address..."
                  />
                </div>
                <div>
                  <Label>Search Radius (miles)</Label>
                  <Input
                    type="number"
                    value={clientRequirements.location?.radius}
                    onChange={(e) => setClientRequirements(prev => ({
                      ...prev,
                      location: { ...prev.location!, radius: parseInt(e.target.value) || 25 }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#3B2352]">Budget</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    value={clientRequirements.budget?.hourlyRateRange?.min}
                    onChange={(e) => setClientRequirements(prev => ({
                      ...prev,
                      budget: {
                        ...prev.budget!,
                        hourlyRateRange: {
                          ...prev.budget!.hourlyRateRange!,
                          min: parseInt(e.target.value) || 50
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Max Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    value={clientRequirements.budget?.hourlyRateRange?.max}
                    onChange={(e) => setClientRequirements(prev => ({
                      ...prev,
                      budget: {
                        ...prev.budget!,
                        hourlyRateRange: {
                          ...prev.budget!.hourlyRateRange!,
                          max: parseInt(e.target.value) || 100
                        }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <Label>Required Experience Level</Label>
              <Select 
                value={clientRequirements.preferences?.experienceLevel}
                onValueChange={(value: any) => setClientRequirements(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences!, experienceLevel: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                  <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                  <SelectItem value="expert">Expert (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowRequirementsForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRequirementsForm(false)
                  handleStartMatching()
                }}
                disabled={!clientRequirements.clientId || !clientRequirements.location?.address || isMatching}
                className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
              >
                {isMatching ? "Finding Matches..." : "Start Matching"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* No Results State */}
      {matchResults && matchResults.matches.length === 0 && (
        <Card className="border-[#3B2352]/20">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
              No Matches Found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any caregivers matching your criteria.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              {matchResults.metadata.reasons.map((reason, index) => (
                <p key={index}>• {reason}</p>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowRequirementsForm(true)}
            >
              Adjust Requirements
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}