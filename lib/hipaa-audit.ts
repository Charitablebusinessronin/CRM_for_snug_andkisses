/**
 * This file contains the implementation of a HIPAA audit logger.
 * It provides functionality for logging, storing, and verifying audit events.
 */
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

interface AuditEvent {
  action: string
  resource?: string
  method?: string
  user_id?: string
  ip_address: string
  user_agent: string
  timestamp: string
  origin: string
  request_id: string
  data?: any
  result?: "success" | "failure" | "error"
  error_message?: string
}

interface AuditLog extends AuditEvent {
  id: string
  hash: string
  previous_hash?: string
}

class HIPAAAuditLogger {
  private logDir: string
  private dbLogs: AuditLog[] = []

  constructor() {
    this.logDir = path.join(process.cwd(), "logs", "hipaa-audit")
    this.ensureLogDirectory()
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true })
    } catch (error) {
      console.error("Failed to create audit log directory:", error)
    }
  }

  private generateHash(data: string, previousHash?: string): string {
    const content = previousHash ? `${previousHash}${data}` : data
    return crypto.createHash("sha256").update(content).digest("hex")
  }

  private async getLastHash(): Promise<string | undefined> {
    try {
      const files = await fs.readdir(this.logDir)
      const logFiles = files
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse()

      if (logFiles.length === 0) return undefined

      const lastFile = path.join(this.logDir, logFiles[0])
      const content = await fs.readFile(lastFile, "utf-8")
      const logs = JSON.parse(content)

      return logs.length > 0 ? logs[logs.length - 1].hash : undefined
    } catch (error) {
      console.error("Failed to get last hash:", error)
      return undefined
    }
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const id = crypto.randomUUID()
      const previousHash = await this.getLastHash()
      const eventData = JSON.stringify({ ...event, id })
      const hash = this.generateHash(eventData, previousHash)

      const auditLog: AuditLog = {
        ...event,
        id,
        hash,
        previous_hash: previousHash,
      }

      // Store in memory for quick access
      this.dbLogs.push(auditLog)

      // Write to file for persistence
      await this.writeToFile(auditLog)

      // Send to Zoho CRM for centralized logging
      await this.sendToZohoCRM(auditLog)

      // Optional: Send to cloud storage for backup
      if (process.env.HIPAA_CLOUD_BACKUP === "true") {
        await this.sendToCloudStorage(auditLog)
      }
    } catch (error) {
      console.error("HIPAA audit logging failed:", error)
      // Critical: HIPAA audit failures should be escalated
      await this.escalateAuditFailure(event, error)
    }
  }

  private async writeToFile(auditLog: AuditLog): Promise<void> {
    const date = new Date().toISOString().split("T")[0]
    const filename = `audit-${date}.json`
    const filepath = path.join(this.logDir, filename)

    try {
      let existingLogs: AuditLog[] = []

      try {
        const content = await fs.readFile(filepath, "utf-8")
        existingLogs = JSON.parse(content)
      } catch {
        // File doesn't exist yet, start with empty array
      }

      existingLogs.push(auditLog)
      await fs.writeFile(filepath, JSON.stringify(existingLogs, null, 2))
    } catch (error) {
      console.error("Failed to write audit log to file:", error)
      throw error
    }
  }

  private async sendToZohoCRM(auditLog: AuditLog): Promise<void> {
    try {
      // Create a custom module record in Zoho CRM for audit trails
      const zohoData = {
        Audit_ID: auditLog.id,
        Action: auditLog.action,
        Resource: auditLog.resource || "",
        User_ID: auditLog.user_id || "anonymous",
        IP_Address: auditLog.ip_address,
        Timestamp: auditLog.timestamp,
        Hash: auditLog.hash,
        Previous_Hash: auditLog.previous_hash || "",
        Result: auditLog.result || "unknown",
      }

      // This would integrate with your existing Zoho CRM functions
      // Implementation depends on your Zoho CRM setup
      console.log("Would send to Zoho CRM:", zohoData)
    } catch (error) {
      console.error("Failed to send audit log to Zoho CRM:", error)
    }
  }

  private async sendToCloudStorage(auditLog: AuditLog): Promise<void> {
    try {
      // Implementation for cloud backup (AWS S3, Google Cloud, etc.)
      console.log("Would send to cloud storage:", auditLog.id)
    } catch (error) {
      console.error("Failed to send audit log to cloud storage:", error)
    }
  }

  private async escalateAuditFailure(event: AuditEvent, error: any): Promise<void> {
    try {
      // Critical: Send immediate alert for audit failures
      console.error("CRITICAL: HIPAA Audit Failure", {
        event,
        error: error.message,
        timestamp: new Date().toISOString(),
      })

      // In production, this would send alerts to compliance team
      // Email, SMS, or other notification systems
    } catch (escalationError) {
      console.error("Failed to escalate audit failure:", escalationError)
    }
  }

  async getAuditTrail(filters?: {
    startDate?: string
    endDate?: string
    userId?: string
    action?: string
    resource?: string
  }): Promise<AuditLog[]> {
    try {
      let logs = [...this.dbLogs]

      if (filters) {
        if (filters.startDate) {
          logs = logs.filter((log) => log.timestamp >= filters.startDate!)
        }
        if (filters.endDate) {
          logs = logs.filter((log) => log.timestamp <= filters.endDate!)
        }
        if (filters.userId) {
          logs = logs.filter((log) => log.user_id === filters.userId)
        }
        if (filters.action) {
          logs = logs.filter((log) => log.action === filters.action)
        }
        if (filters.resource) {
          logs = logs.filter((log) => log.resource?.includes(filters.resource!))
        }
      }

      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error("Failed to get audit trail:", error)
      return []
    }
  }

  async verifyIntegrity(logs?: AuditLog[]): Promise<{ valid: boolean; errors: string[] }> {
    const logsToVerify = logs || this.dbLogs
    const errors: string[] = []

    for (let i = 0; i < logsToVerify.length; i++) {
      const log = logsToVerify[i]
      const previousLog = i > 0 ? logsToVerify[i - 1] : null

      // Verify hash integrity
      const expectedPreviousHash = previousLog?.hash
      if (log.previous_hash !== expectedPreviousHash) {
        errors.push(`Hash chain broken at log ${log.id}`)
      }

      // Verify current hash
      const eventData = JSON.stringify({
        ...log,
        hash: undefined,
        previous_hash: log.previous_hash,
      })
      const expectedHash = this.generateHash(eventData, log.previous_hash)

      if (log.hash !== expectedHash) {
        errors.push(`Invalid hash for log ${log.id}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async generateComplianceReport(
    startDate: string,
    endDate: string,
  ): Promise<{
    totalEvents: number
    eventsByAction: Record<string, number>
    eventsByUser: Record<string, number>
    failedEvents: number
    integrityStatus: { valid: boolean; errors: string[] }
  }> {
    const logs = await this.getAuditTrail({ startDate, endDate })
    const integrityStatus = await this.verifyIntegrity(logs)

    const eventsByAction: Record<string, number> = {}
    const eventsByUser: Record<string, number> = {}
    let failedEvents = 0

    for (const log of logs) {
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1

      const userId = log.user_id || "anonymous"
      eventsByUser[userId] = (eventsByUser[userId] || 0) + 1

      if (log.result === "failure" || log.result === "error") {
        failedEvents++
      }
    }

    return {
      totalEvents: logs.length,
      eventsByAction,
      eventsByUser,
      failedEvents,
      integrityStatus,
    }
  }
}

// Singleton instance
const auditLogger = new HIPAAAuditLogger()

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  await auditLogger.logEvent(event)
}

export async function getAuditTrail(filters?: Parameters<typeof auditLogger.getAuditTrail>[0]) {
  return auditLogger.getAuditTrail(filters)
}

export async function verifyAuditIntegrity(logs?: Parameters<typeof auditLogger.verifyIntegrity>[0]) {
  return auditLogger.verifyIntegrity(logs)
}

export async function generateComplianceReport(startDate: string, endDate: string) {
  return auditLogger.generateComplianceReport(startDate, endDate)
}
