"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// Force runtime rendering so query params like ?compose=true work when served from your port
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const compose = searchParams.get('compose') === 'true'
  
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/client/message-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          urgencyLevel: 'normal'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Message Sent",
          description: result.message || "Your message has been sent to the care team",
        })
        setMessage('')
        router.push('/client/dashboard')
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactProvider = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/client/contact-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: 'demo-client', // This should come from session
          contactMethod: 'phone',
          urgencyLevel: 'normal'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Provider Contacted",
          description: result.message || "Your care provider has been notified",
        })
        router.push('/client/dashboard')
      } else {
        throw new Error('Failed to contact provider')
      }
    } catch (error) {
      console.error('Contact provider error:', error)
      toast({
        title: "Error",
        description: "Failed to contact provider. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/client/dashboard')}
            className="text-[#3B2352]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-[#3B2352]">
            {compose ? 'Contact Care Team' : 'Messages'}
          </h1>
        </div>

        {compose ? (
          /* Compose Message */
          <Card className="border-[#3B2352]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#3B2352] to-[#4A2C5A] text-white">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Message to Care Team
              </CardTitle>
              <CardDescription className="text-gray-200">
                Send a secure message to your assigned care provider and support team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="message" className="text-[#3B2352] font-medium">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-[#D7C7ED]/50 focus:border-[#3B2352] min-h-[150px] mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleContactProvider}
                  disabled={isLoading}
                  variant="outline"
                  className="border-[#3B2352] text-[#3B2352]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3B2352] mr-2"></div>
                      Contacting...
                    </>
                  ) : (
                    'Request Call Back'
                  )}
                </Button>
              </div>

              <Alert className="border-[#D4AF37]/50 bg-[#D4AF37]/5">
                <AlertDescription className="text-sm">
                  <strong>Response Time:</strong> Normal messages receive a response within 2-4 hours. 
                  For urgent matters, use the "Request Call Back" button or call our 24/7 line.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          /* Message History */
          <Card className="border-[#3B2352]/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3B2352]">Message History</CardTitle>
              <CardDescription>
                Your conversation history with the care team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No messages yet</p>
                <Button 
                  onClick={() => router.push('/client/messages?compose=true')}
                  className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
                >
                  Send Your First Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
