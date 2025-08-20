import type {
  BeginAuthRequest,
  BeginAuthResponse,
  GetSessionResponse,
  BeginMfaRequest,
  BeginMfaResponse,
  VerifyMfaRequest,
  VerifyMfaResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
  ListCarePlansResponse,
  CreateServiceRequest,
  CreateServiceResponse,
  ScheduleInterviewRequest,
  ScheduleInterviewResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadDocumentInitRequest,
  UploadDocumentInitResponse,
  BillingSummaryResponse,
  MatchingInput,
  MatchingResponse,
  AuditEventRequest,
  AuditEventResponse,
  HealthResponse,
} from "./contracts";

const BASE_URL = "/api"; // Placeholder; real endpoints will be Catalyst Functions

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  beginAuth: (body: BeginAuthRequest) => http<BeginAuthResponse>("/auth/begin", { method: "POST", body: JSON.stringify(body) }),
  getSession: () => http<GetSessionResponse>("/auth/session"),
  beginMfa: (body: BeginMfaRequest) => http<BeginMfaResponse>("/auth/mfa/begin", { method: "POST", body: JSON.stringify(body) }),
  verifyMfa: (body: VerifyMfaRequest) => http<VerifyMfaResponse>("/auth/mfa/verify", { method: "POST", body: JSON.stringify(body) }),
  updateRole: (body: UpdateUserRoleRequest) => http<UpdateUserRoleResponse>("/users/role", { method: "POST", body: JSON.stringify(body) }),
  listCarePlans: () => http<ListCarePlansResponse>("/care-plans"),
  createServiceRequest: (body: CreateServiceRequest) => http<CreateServiceResponse>("/service-requests", { method: "POST", body: JSON.stringify(body) }),
  scheduleInterview: (body: ScheduleInterviewRequest) => http<ScheduleInterviewResponse>("/schedule/interview", { method: "POST", body: JSON.stringify(body) }),
  updateProfile: (body: UpdateProfileRequest) => http<UpdateProfileResponse>("/profiles/update", { method: "POST", body: JSON.stringify(body) }),
  uploadDocumentInit: (body: UploadDocumentInitRequest) => http<UploadDocumentInitResponse>("/documents/upload/init", { method: "POST", body: JSON.stringify(body) }),
  billingSummary: () => http<BillingSummaryResponse>("/billing/summary"),
  matching: (body: MatchingInput) => http<MatchingResponse>("/matching/zia", { method: "POST", body: JSON.stringify(body) }),
  audit: (body: AuditEventRequest) => http<AuditEventResponse>("/audit", { method: "POST", body: JSON.stringify(body) }),
  health: () => http<HealthResponse>("/health"),
};


