/**
 * Real-time WebSocket System for Live Updates
 * HIPAA-compliant real-time communication for Snug & Kisses CRM
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'
import { ZohoOneClient } from './zoho-one-client'
import { HIPAAComplianceLogger } from './hipaa-audit'
import { UserRole } from '@/types/auth'

export interface WebSocketConnection {
  socketId: string
  userId: string
  userRole: UserRole
  clientId?: string
  lastActivity: Date
  authenticated: boolean
  ipAddress: string
  userAgent: string
}

export interface RealTimeUpdate {
  type: string
  clientId?: string
  userId?: string
  data: any
  timestamp: Date
  priority: 'low' | 'normal' | 'high' | 'critical'
  requiresAck?: boolean
}

export interface ClientPortalUpdate {
  clientId: string
  updateType: 'workflow_progress' | 'appointment_update' | 'message_received' | 'care_notes' | 'billing_update'
  data: any
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export class SnugKissesWebSocketServer {
  private io: SocketIOServer
  private zoho: ZohoOneClient
  private hipaaLogger: HIPAAComplianceLogger
  private connections: Map<string, WebSocketConnection> = new Map()
  private userSockets: Map<string, Set<string>> = new Map() // userId -> socketIds
  private clientRooms: Map<string, Set<string>> = new Map() // clientId -> socketIds
  private updateQueue: Map<string, RealTimeUpdate[]> = new Map()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://your-domain.com'] 
          : ['http://localhost:3000', 'http://localhost:5369'],
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.zoho = new ZohoOneClient()
    this.hipaaLogger = new HIPAAComplianceLogger()
    
    this.setupSocketHandlers()
    this.setupHeartbeat()
    this.setupUpdateProcessor()
  }

  /**
   * Setup WebSocket connection handlers with authentication
   */
  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        await this.authenticateSocket(socket)
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })

    this.io.on('connection', async (socket) => {
      await this.handleConnection(socket)

      // Client Portal Events
      socket.on('join_client_room', async (data) => {
        await this.handleJoinClientRoom(socket, data)
      })

      socket.on('leave_client_room', async (data) => {
        await this.handleLeaveClientRoom(socket, data)
      })

      socket.on('request_workflow_status', async (data) => {
        await this.handleWorkflowStatusRequest(socket, data)
      })

      socket.on('client_portal_action', async (data) => {
        await this.handleClientPortalAction(socket, data)
      })

      // Admin/Employee Events
      socket.on('join_admin_room', async () => {
        await this.handleJoinAdminRoom(socket)
      })

      socket.on('broadcast_update', async (data) => {
        await this.handleBroadcastUpdate(socket, data)
      })

      socket.on('send_client_notification', async (data) => {
        await this.handleClientNotification(socket, data)
      })

      // Care Provider Events
      socket.on('update_care_status', async (data) => {
        await this.handleCareStatusUpdate(socket, data)
      })

      socket.on('submit_care_notes', async (data) => {
        await this.handleCareNotesSubmission(socket, data)
      })

      // General Events
      socket.on('ping', () => {
        socket.emit('pong')
        this.updateLastActivity(socket.id)
      })

      socket.on('disconnect', async (reason) => {
        await this.handleDisconnection(socket, reason)
      })

      // Error handling
      socket.on('error', async (error) => {
        await this.handleSocketError(socket, error)
      })
    })
  }

  /**
   * Authenticate WebSocket connection using JWT
   */
  private async authenticateSocket(socket: any): Promise<void> {
    const token = socket.handshake.auth.token || socket.handshake.query.token

    if (!token) {
      throw new Error('No authentication token provided')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Verify user exists in CRM
      const userRecord = await this.zoho.getCRMRecord('Contacts', decoded.userId)
      if (!userRecord) {
        throw new Error('User not found')
      }

      socket.userId = decoded.userId
      socket.userRole = decoded.role
      socket.clientId = decoded.clientId
      socket.ipAddress = socket.handshake.address
      socket.userAgent = socket.handshake.headers['user-agent']

    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(socket: any): Promise<void> {
    const connection: WebSocketConnection = {
      socketId: socket.id,
      userId: socket.userId,
      userRole: socket.userRole,
      clientId: socket.clientId,
      lastActivity: new Date(),
      authenticated: true,
      ipAddress: socket.ipAddress,
      userAgent: socket.userAgent
    }

    this.connections.set(socket.id, connection)
    
    // Track user sockets
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set())
    }
    this.userSockets.get(socket.userId)!.add(socket.id)

    // Send queued updates for this user
    await this.sendQueuedUpdates(socket.userId, socket.id)

    // Log connection
    await this.hipaaLogger.logWebSocketEvent(socket.userId, 'connection_established', {
      socket_id: socket.id,
      user_role: socket.userRole,
      ip_address: socket.ipAddress
    })

    // Send initial status
    socket.emit('connection_established', {
      status: 'connected',
      server_time: new Date().toISOString(),
      features: this.getAvailableFeatures(socket.userRole)
    })

    console.log(`WebSocket connected: ${socket.userId} (${socket.userRole}) - ${socket.id}`)
  }

  /**
   * Handle client joining their specific room for updates
   */
  private async handleJoinClientRoom(socket: any, data: { clientId: string }): Promise<void> {
    const connection = this.connections.get(socket.id)
    if (!connection) return

    // Verify access permission
    if (connection.userRole === UserRole.CLIENT && connection.clientId !== data.clientId) {
      socket.emit('error', { message: 'Access denied to client room' })
      return
    }

    socket.join(`client_${data.clientId}`)
    
    // Track client room members
    if (!this.clientRooms.has(data.clientId)) {
      this.clientRooms.set(data.clientId, new Set())
    }
    this.clientRooms.get(data.clientId)!.add(socket.id)

    // Send current client status
    const clientStatus = await this.getClientRealTimeStatus(data.clientId)
    socket.emit('client_status_update', clientStatus)

    await this.hipaaLogger.logWebSocketEvent(socket.userId, 'joined_client_room', {
      client_id: data.clientId,
      socket_id: socket.id
    })
  }

  /**
   * Handle workflow status requests
   */
  private async handleWorkflowStatusRequest(socket: any, data: { clientId: string }): Promise<void> {
    try {
      const workflowStatus = await this.getWorkflowRealTimeStatus(data.clientId)
      socket.emit('workflow_status_response', workflowStatus)

    } catch (error) {
      socket.emit('error', { message: 'Failed to fetch workflow status' })
    }
  }

  /**
   * Handle client portal actions (button clicks, form submissions, etc.)
   */
  private async handleClientPortalAction(socket: any, data: any): Promise<void> {
    const connection = this.connections.get(socket.id)
    if (!connection) return

    try {
      // Process the action
      const actionResult = await this.processClientPortalAction(connection.userId, data)
      
      // Send response to client
      socket.emit('portal_action_response', actionResult)

      // Broadcast to care team if needed
      if (actionResult.notifyCareTeam) {
        await this.notifyCareTeam(connection.clientId!, data.action, actionResult)
      }

      await this.hipaaLogger.logWebSocketEvent(connection.userId, 'portal_action', {
        action_type: data.action,
        client_id: connection.clientId,
        success: actionResult.success
      })

    } catch (error) {
      socket.emit('error', { message: 'Action processing failed' })
    }
  }

  /**
   * Handle care status updates from providers
   */
  private async handleCareStatusUpdate(socket: any, data: any): Promise<void> {
    const connection = this.connections.get(socket.id)
    if (!connection || ![UserRole.CONTRACTOR, UserRole.EMPLOYEE].includes(connection.userRole)) {
      return
    }

    try {
      // Update CRM with care status
      await this.zoho.updateCRMRecord('Care_Sessions', data.sessionId, {
        Status: data.status,
        Provider_Notes: data.notes,
        Updated_At: new Date().toISOString()
      })

      // Notify client and admin
      await this.broadcastToClientRoom(data.clientId, {
        type: 'care_status_update',
        clientId: data.clientId,
        userId: connection.userId,
        data: {
          status: data.status,
          notes: data.notes,
          provider_name: await this.getProviderName(connection.userId)
        },
        timestamp: new Date(),
        priority: 'normal'
      })

      socket.emit('care_status_updated', { success: true, sessionId: data.sessionId })

    } catch (error) {
      socket.emit('error', { message: 'Failed to update care status' })
    }
  }

  /**
   * Handle care notes submission
   */
  private async handleCareNotesSubmission(socket: any, data: any): Promise<void> {
    const connection = this.connections.get(socket.id)
    if (!connection || ![UserRole.CONTRACTOR, UserRole.EMPLOYEE].includes(connection.userRole)) {
      return
    }

    try {
      // Save care notes to CRM
      const noteRecord = await this.zoho.createCRMRecord('Care_Notes', {
        Client_ID: data.clientId,
        Provider_ID: connection.userId,
        Session_Date: data.sessionDate,
        Notes: data.notes,
        Care_Categories: data.categories,
        Created_At: new Date().toISOString()
      })

      // Process notes with AI for insights
      const aiInsights = await this.processNotesWithAI(data.notes, data.clientId)

      // Update client portal
      await this.broadcastToClientRoom(data.clientId, {
        type: 'care_notes_added',
        clientId: data.clientId,
        userId: connection.userId,
        data: {
          noteId: noteRecord.id,
          summary: aiInsights.summary,
          categories: data.categories,
          date: data.sessionDate
        },
        timestamp: new Date(),
        priority: 'normal'
      })

      socket.emit('care_notes_submitted', { success: true, noteId: noteRecord.id })

    } catch (error) {
      socket.emit('error', { message: 'Failed to submit care notes' })
    }
  }

  /**
   * Broadcast update to specific client room
   */
  async broadcastToClientRoom(clientId: string, update: RealTimeUpdate): Promise<void> {
    this.io.to(`client_${clientId}`).emit('real_time_update', update)

    // Log broadcast
    await this.hipaaLogger.logWebSocketEvent('system', 'client_room_broadcast', {
      client_id: clientId,
      update_type: update.type,
      priority: update.priority
    })
  }

  /**
   * Send real-time workflow progress update
   */
  async sendWorkflowProgressUpdate(clientId: string, phaseNumber: number, phaseName: string, actionResults: any[]): Promise<void> {
    const update: RealTimeUpdate = {
      type: 'workflow_progress',
      clientId,
      data: {
        current_phase: phaseNumber,
        phase_name: phaseName,
        progress_percentage: Math.round((phaseNumber / 18) * 100),
        completed_actions: actionResults.filter(r => r.success).length,
        total_actions: actionResults.length,
        next_steps: actionResults.filter(r => !r.success).map(r => r.action)
      },
      timestamp: new Date(),
      priority: 'normal'
    }

    await this.broadcastToClientRoom(clientId, update)
  }

  /**
   * Send appointment/scheduling updates
   */
  async sendAppointmentUpdate(clientId: string, appointmentData: any): Promise<void> {
    const update: RealTimeUpdate = {
      type: 'appointment_update',
      clientId,
      data: appointmentData,
      timestamp: new Date(),
      priority: 'high'
    }

    await this.broadcastToClientRoom(clientId, update)
  }

  /**
   * Send billing/payment updates
   */
  async sendBillingUpdate(clientId: string, billingData: any): Promise<void> {
    const update: RealTimeUpdate = {
      type: 'billing_update',
      clientId,
      data: billingData,
      timestamp: new Date(),
      priority: 'normal'
    }

    await this.broadcastToClientRoom(clientId, update)
  }

  /**
   * Send critical alerts
   */
  async sendCriticalAlert(clientId: string, alertData: any): Promise<void> {
    const update: RealTimeUpdate = {
      type: 'critical_alert',
      clientId,
      data: alertData,
      timestamp: new Date(),
      priority: 'critical',
      requiresAck: true
    }

    await this.broadcastToClientRoom(clientId, update)
    
    // Also notify admin room
    this.io.to('admin_room').emit('critical_alert', {
      client_id: clientId,
      alert: alertData,
      timestamp: new Date()
    })
  }

  /**
   * Process client portal action with business logic
   */
  private async processClientPortalAction(userId: string, actionData: any): Promise<any> {
    switch (actionData.action) {
      case 'request_appointment':
        return await this.processAppointmentRequest(userId, actionData.data)
      
      case 'update_preferences':
        return await this.updateClientPreferences(userId, actionData.data)
      
      case 'submit_feedback':
        return await this.processFeedbackSubmission(userId, actionData.data)
      
      case 'request_care_adjustment':
        return await this.processCareAdjustmentRequest(userId, actionData.data)
      
      case 'emergency_request':
        return await this.processEmergencyRequest(userId, actionData.data)
      
      default:
        throw new Error('Unknown portal action')
    }
  }

  // Real-time status getters
  private async getClientRealTimeStatus(clientId: string): Promise<any> {
    try {
      const clientData = await this.zoho.getCRMRecord('Contacts', clientId)
      const activeServices = await this.zoho.searchCRMRecords('Care_Sessions', 
        `Client_ID:equals:${clientId} and Status:equals:Active`)
      
      return {
        client_id: clientId,
        current_phase: clientData.Workflow_Phase || 1,
        active_services: activeServices.length,
        last_activity: clientData.Last_Activity_Date,
        care_provider_online: await this.isCareProviderOnline(clientId),
        upcoming_appointments: await this.getUpcomingAppointments(clientId),
        unread_messages: await this.getUnreadMessageCount(clientId)
      }
    } catch (error) {
      return { error: 'Failed to fetch client status' }
    }
  }

  private async getWorkflowRealTimeStatus(clientId: string): Promise<any> {
    try {
      const clientData = await this.zoho.getCRMRecord('Contacts', clientId)
      const currentPhase = clientData.Workflow_Phase || 1
      
      return {
        client_id: clientId,
        current_phase: currentPhase,
        phase_name: await this.getPhaseName(currentPhase),
        progress_percentage: Math.round((currentPhase / 18) * 100),
        estimated_completion: await this.estimateWorkflowCompletion(clientId),
        recent_activities: await this.getRecentWorkflowActivities(clientId),
        next_milestone: await this.getNextMilestone(currentPhase)
      }
    } catch (error) {
      return { error: 'Failed to fetch workflow status' }
    }
  }

  // Helper methods
  private setupHeartbeat(): void {
    setInterval(() => {
      const now = new Date()
      this.connections.forEach((connection, socketId) => {
        const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime()
        if (timeSinceLastActivity > 300000) { // 5 minutes
          this.io.sockets.sockets.get(socketId)?.disconnect()
        }
      })
    }, 60000) // Check every minute
  }

  private setupUpdateProcessor(): void {
    setInterval(async () => {
      await this.processQueuedUpdates()
    }, 1000) // Process updates every second
  }

  private async processQueuedUpdates(): Promise<void> {
    for (const [userId, updates] of this.updateQueue.entries()) {
      if (updates.length > 0) {
        const userSocketIds = this.userSockets.get(userId)
        if (userSocketIds && userSocketIds.size > 0) {
          // Send updates to all user sockets
          userSocketIds.forEach(socketId => {
            const socket = this.io.sockets.sockets.get(socketId)
            if (socket) {
              updates.forEach(update => {
                socket.emit('real_time_update', update)
              })
            }
          })
          
          // Clear processed updates
          this.updateQueue.delete(userId)
        }
      }
    }
  }

  private updateLastActivity(socketId: string): void {
    const connection = this.connections.get(socketId)
    if (connection) {
      connection.lastActivity = new Date()
    }
  }

  private async handleDisconnection(socket: any, reason: string): Promise<void> {
    const connection = this.connections.get(socket.id)
    if (connection) {
      // Clean up tracking
      this.connections.delete(socket.id)
      this.userSockets.get(connection.userId)?.delete(socket.id)
      
      // Remove from client rooms
      this.clientRooms.forEach(roomSockets => {
        roomSockets.delete(socket.id)
      })

      // Log disconnection
      await this.hipaaLogger.logWebSocketEvent(connection.userId, 'connection_terminated', {
        socket_id: socket.id,
        reason,
        session_duration: Date.now() - connection.lastActivity.getTime()
      })

      console.log(`WebSocket disconnected: ${connection.userId} - ${socket.id} (${reason})`)
    }
  }

  private getAvailableFeatures(userRole: UserRole): string[] {
    const features = {
      [UserRole.CLIENT]: ['workflow_updates', 'appointment_notifications', 'care_updates', 'billing_updates'],
      [UserRole.CONTRACTOR]: ['care_session_updates', 'client_notifications', 'schedule_updates'],
      [UserRole.EMPLOYEE]: ['client_updates', 'workflow_monitoring', 'team_notifications'],
      [UserRole.ADMIN]: ['all_updates', 'system_monitoring', 'user_management', 'analytics']
    }
    
    return features[userRole] || []
  }

  // Additional helper methods (simplified implementations)
  private async sendQueuedUpdates(userId: string, socketId: string): Promise<void> { /* Implementation */ }
  private async processAppointmentRequest(userId: string, data: any): Promise<any> { return { success: true } }
  private async updateClientPreferences(userId: string, data: any): Promise<any> { return { success: true } }
  private async processFeedbackSubmission(userId: string, data: any): Promise<any> { return { success: true } }
  private async processCareAdjustmentRequest(userId: string, data: any): Promise<any> { return { success: true } }
  private async processEmergencyRequest(userId: string, data: any): Promise<any> { return { success: true, notifyCareTeam: true } }
  private async notifyCareTeam(clientId: string, action: string, result: any): Promise<void> { /* Implementation */ }
  private async processNotesWithAI(notes: string, clientId: string): Promise<any> { return { summary: 'AI-generated summary' } }
  private async getProviderName(userId: string): Promise<string> { return 'Provider Name' }
  private async isCareProviderOnline(clientId: string): Promise<boolean> { return false }
  private async getUpcomingAppointments(clientId: string): Promise<any[]> { return [] }
  private async getUnreadMessageCount(clientId: string): Promise<number> { return 0 }
  private async getPhaseName(phase: number): Promise<string> { return `Phase ${phase}` }
  private async estimateWorkflowCompletion(clientId: string): Promise<string> { return '2024-02-15' }
  private async getRecentWorkflowActivities(clientId: string): Promise<any[]> { return [] }
  private async getNextMilestone(currentPhase: number): Promise<string> { return 'Next milestone' }
  private async handleJoinAdminRoom(socket: any): Promise<void> { /* Implementation */ }
  private async handleLeaveClientRoom(socket: any, data: any): Promise<void> { /* Implementation */ }
  private async handleBroadcastUpdate(socket: any, data: any): Promise<void> { /* Implementation */ }
  private async handleClientNotification(socket: any, data: any): Promise<void> { /* Implementation */ }
  private async handleSocketError(socket: any, error: any): Promise<void> { /* Implementation */ }
}