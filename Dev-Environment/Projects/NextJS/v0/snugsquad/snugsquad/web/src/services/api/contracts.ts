// Typed API contracts for core backend functions (placeholders for Zoho Catalyst endpoints)

export type UUID = string;

// 1) Auth / Session
export interface BeginAuthRequest {
  redirectUri: string;
}
export interface BeginAuthResponse {
  url: string;
}
export interface GetSessionResponse {
  userId: UUID;
  email: string;
  role: "admin" | "client" | "employee" | "contractor";
  mfaComplete: boolean;
}

// 2) MFA
export interface BeginMfaRequest { userId: UUID }
export interface BeginMfaResponse { challengeId: UUID }
export interface VerifyMfaRequest { challengeId: UUID; code: string }
export interface VerifyMfaResponse { success: boolean }

// 3) Users / Roles
export interface UpdateUserRoleRequest { userId: UUID; role: GetSessionResponse["role"] }
export interface UpdateUserRoleResponse { success: boolean }

// 4) Care Plans
export interface CarePlanSummary { id: UUID; title: string; status: "active" | "paused" | "completed" }
export interface ListCarePlansResponse { items: CarePlanSummary[] }

// 5) Service Requests
export interface CreateServiceRequest {
  clientId: UUID;
  description: string;
  requestedDate: string; // ISO
}
export interface CreateServiceResponse { requestId: UUID }

// 6) Scheduling
export interface ScheduleInterviewRequest { clientId: UUID; caregiverId: UUID; datetime: string }
export interface ScheduleInterviewResponse { eventId: UUID }

// 7) Profiles
export interface UpdateProfileRequest { userId: UUID; fields: Record<string, unknown> }
export interface UpdateProfileResponse { success: boolean }

// 8) Documents
export interface UploadDocumentInitRequest { ownerId: UUID; filename: string; mimeType: string }
export interface UploadDocumentInitResponse { uploadUrl: string; documentId: UUID }

// 9) Billing Summary
export interface BillingSummaryResponse { period: string; total: number; currency: string }

// 10) Matching (Zia)
export interface MatchingInput { clientId: UUID; constraints?: Record<string, unknown> }
export interface CandidateMatch { caregiverId: UUID; score: number; rationale?: string }
export interface MatchingResponse { candidates: CandidateMatch[] }

// 11) Audit
export interface AuditEventRequest { action: string; subjectId?: UUID; metadata?: Record<string, unknown> }
export interface AuditEventResponse { success: boolean }

// 12) Health
export interface HealthResponse { status: "ok"; ts: string }


