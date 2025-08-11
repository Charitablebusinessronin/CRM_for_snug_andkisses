"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  MessageSquare, 
  Send, 
  Users, 
  Clock, 
  Loader2,
  Circle
} from "lucide-react"

interface TeamMessage {
  id: string
  user_id: string
  user_name: string
  message: string
  timestamp: string
  channel: string
  type: 'message' | 'status_update' | 'request'
}

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'available' | 'busy' | 'offline'
  last_seen: string
  current_clients: number
  avatar?: string
}

interface TeamMessagingProps {
  currentUserId?: string
  currentUserName?: string
}

export function TeamMessaging({ 
  currentUserId = 'emp_001', 
  currentUserName = 'Current User' 
}: TeamMessagingProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentChannel, setCurrentChannel] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load messages from API
  const loadMessages = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    
    try {
      const response = await fetch(`/api/v1/team-messages?channel=${currentChannel}&limit=50`, {
        headers: { 'x-user-id': currentUserId }
      })
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data || [])
        if (result.data?.length > 0) {
          setTimeout(scrollToBottom, 100)
        }
      } else {
        if (showLoading) {
          toast.error('Failed to load messages: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      if (showLoading) {
        toast.error('Error connecting to team messaging')
      }
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  // Load team members status
  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/v1/team-messages', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUserId 
        },
        body: JSON.stringify({ action: 'get_team_status' })
      })
      const result = await response.json()
      
      if (result.success) {
        setTeamMembers(result.data || [])
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/v1/team-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
          'x-user-name': currentUserName
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          channel: currentChannel,
          type: 'message'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setNewMessage('')
        // Immediately add the new message to avoid waiting for refresh
        setMessages(prev => [result.data, ...prev])
        toast.success('Message sent!')
        setTimeout(scrollToBottom, 100)
      } else {
        toast.error('Failed to send message: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error sending message')
    } finally {
      setIsSending(false)
    }
  }

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return time.toLocaleDateString()
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-500'
      case 'busy': return 'text-yellow-500'
      case 'offline': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  // Load initial data and set up auto-refresh
  useEffect(() => {
    loadMessages(true)
    loadTeamMembers()

    // Set up auto-refresh every 10 seconds
    refreshIntervalRef.current = setInterval(() => {
      loadMessages(false) // Don't show loading for background refresh
    }, 10000)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [currentChannel])

  return (
    <div className="h-full flex flex-col max-h-[600px]">
      {/* Header */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Team Messages
          <Badge variant="outline" className="ml-auto">
            #{currentChannel}
          </Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex flex-1 gap-4 px-6 pb-6 overflow-hidden">
        {/* Team Members Sidebar */}
        <div className="w-48 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <Users className="h-4 w-4" />
                Team ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50">
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-[#D7C7ED] text-[#3B2352]">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={`h-2 w-2 absolute -bottom-0.5 -right-0.5 ${getStatusColor(member.status)} fill-current`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] text-xs">
                              {message.user_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-sm">{message.user_name}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getRelativeTime(message.timestamp)}
                              </span>
                              {message.type !== 'message' && (
                                <Badge variant="outline" className="text-xs">
                                  {message.type.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 break-words">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card className="mt-3">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="px-3"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Auto-refresh: 10s</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}