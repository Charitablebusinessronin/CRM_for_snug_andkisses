/**
 * HIPAA Compliance Type Definitions
 * Comprehensive type definitions for HIPAA compliance management
 */

// Enhanced Audit Event Types
export interface EnhancedAuditEvent {
  eventId: string
  eventType: HIPAAEventType
  timestamp: string
  userEmail: string
  userId?: string
  resourceType: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  details: AuditEventDetails
  sensitivityLevel: SensitivityLevel
  complianceLogged: boolean
  retentionDate: string
  encrypted: boolean
  hash: string // For integrity verification
}

export type HIPAAEventType = 
  | 'PHI_ACCESS'
  | 'PHI_CREATION'
  | 'PHI_MODIFICATION'
  | 'PHI_DELETION'
  | 'PHI_EXPORT'
  | 'PHI_PRINT'
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ACCESS_DENIED'
  | 'SECURITY_BREACH'
  | 'POLICY_VIOLATION'
  | 'EMERGENCY_ACCESS'
  | 'SYSTEM_ALERT'
  | 'BACKUP_CREATED'
  | 'BACKUP_RESTORED'
  | 'CONFIGURATION_CHANGE'
  | 'AI_MATCHING_REQUEST'
  | 'AI_MATCHING_COMPLETED'
  | 'EMERGENCY_REPORTED'
  | 'COMPLIANCE_REPORT_GENERATED'

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AuditEventDetails {
  action: string
  previousValue?: any
  newValue?: any
  justification?: string
  approvedBy?: string
  emergencyOverride?: boolean
  batchOperation?: boolean
  recordsAffected?: number
  [key: string]: any
}

// Risk Assessment Types
export interface RiskAssessment {
  assessmentId: string
  assessmentDate: string
  assessor: string
  scope: AssessmentScope
  methodology: string
  findings: RiskFinding[]
  overallRiskScore: number
  recommendations: RiskRecommendation[]
  status: 'draft' | 'in-review' | 'approved' | 'implemented'
  nextAssessmentDate: string
}

export interface AssessmentScope {
  systems: string[]
  dataTypes: string[]
  businessProcesses: string[]
  locations: string[]
  departments: string[]
}

export interface RiskFinding {
  findingId: string
  category: RiskCategory
  description: string
  likelihood: 'very-low' | 'low' | 'medium' | 'high' | 'very-high'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'catastrophic'
  riskScore: number
  currentControls: string[]
  residualRisk: number
  recommendedActions: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: string
  assignedTo: string
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted'
}

export type RiskCategory = 
  | 'technical-safeguards'
  | 'administrative-safeguards'
  | 'physical-safeguards'
  | 'workforce-training'
  | 'incident-response'
  | 'business-associate'
  | 'breach-notification'
  | 'access-management'
  | 'data-integrity'
  | 'transmission-security'

export interface RiskRecommendation {
  recommendationId: string
  title: string
  description: string
  category: RiskCategory
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedCost: number
  estimatedEffort: string // e.g., "2-4 weeks"
  riskReduction: number
  dependencies: string[]
  timeline: RecommendationTimeline[]
}

export interface RecommendationTimeline {
  phase: string
  startDate: string
  endDate: string
  deliverables: string[]
  resources: string[]
}

// Breach Management Types
export interface SecurityBreach {
  breachId: string
  discoveredDate: string
  discoveredBy: string
  type: BreachType
  severity: BreachSeverity
  status: BreachStatus
  description: string
  affectedSystems: string[]
  compromisedData: CompromisedData[]
  potentialImpact: string
  rootCause: string
  timeline: BreachEvent[]
  containmentActions: ContainmentAction[]
  investigation: BreachInvestigation
  notification: BreachNotification
  remediation: RemediationPlan
  lessonsLearned: string[]
  preventiveMeasures: string[]
}

export type BreachType = 
  | 'unauthorized-access'
  | 'data-theft'
  | 'malware'
  | 'phishing'
  | 'insider-threat'
  | 'lost-device'
  | 'system-vulnerability'
  | 'human-error'
  | 'vendor-breach'

export type BreachSeverity = 'low' | 'medium' | 'high' | 'critical'
export type BreachStatus = 'detected' | 'contained' | 'investigating' | 'resolved' | 'closed'

export interface CompromisedData {
  dataType: string
  recordCount: number
  dataElements: string[]
  encryptionStatus: 'encrypted' | 'unencrypted' | 'partially-encrypted'
  affectedIndividuals: number
  geographicScope: string[]
}

export interface BreachEvent {
  timestamp: string
  event: string
  performedBy: string
  details: string
  evidence: string[]
}

export interface ContainmentAction {
  actionId: string
  action: string
  performedBy: string
  performedAt: string
  effectiveness: 'effective' | 'partially-effective' | 'ineffective'
  notes: string
}

export interface BreachInvestigation {
  leadInvestigator: string
  team: string[]
  startDate: string
  endDate?: string
  methodology: string
  findings: InvestigationFinding[]
  evidence: Evidence[]
  interviews: Interview[]
  forensicAnalysis: ForensicAnalysis[]
}

export interface InvestigationFinding {
  findingId: string
  category: string
  description: string
  evidence: string[]
  confidence: 'low' | 'medium' | 'high'
  impact: string
}

export interface Evidence {
  evidenceId: string
  type: 'log-files' | 'screenshots' | 'documents' | 'witness-statements' | 'digital-forensics'
  description: string
  collectedBy: string
  collectedAt: string
  chainOfCustody: CustodyRecord[]
  location: string
  integrity: IntegrityCheck
}

export interface CustodyRecord {
  transferredFrom: string
  transferredTo: string
  timestamp: string
  purpose: string
  signature: string
}

export interface IntegrityCheck {
  method: 'hash' | 'checksum' | 'digital-signature'
  value: string
  verifiedAt: string
  verifiedBy: string
}

export interface Interview {
  interviewId: string
  interviewee: string
  interviewer: string
  date: string
  summary: string
  keyFindings: string[]
  followUpRequired: boolean
}

export interface ForensicAnalysis {
  analysisId: string
  system: string
  analyst: string
  startDate: string
  endDate: string
  tools: string[]
  findings: string[]
  artifacts: string[]
}

// Breach Notification Types
export interface BreachNotification {
  notificationId: string
  breachId: string
  status: NotificationStatus
  recipients: NotificationRecipient[]
  timeline: NotificationTimeline
  templates: NotificationTemplate[]
  deliveryMethods: DeliveryMethod[]
  confirmations: DeliveryConfirmation[]
}

export type NotificationStatus = 'pending' | 'in-progress' | 'completed' | 'delayed'

export interface NotificationRecipient {
  recipientType: 'individual' | 'hhs' | 'media' | 'attorney-general' | 'business-associate'
  recipientId: string
  name: string
  contact: ContactInfo
  notificationRequired: boolean
  deadline: string
  status: 'pending' | 'sent' | 'delivered' | 'acknowledged'
}

export interface ContactInfo {
  email?: string
  phone?: string
  address?: PostalAddress
  preferredMethod: 'email' | 'mail' | 'phone' | 'secure-portal'
}

export interface PostalAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface NotificationTimeline {
  individuals: {
    deadline: string
    sentDate?: string
    method: 'mail' | 'email' | 'phone' | 'substitute-notice'
  }
  hhs: {
    deadline: string
    sentDate?: string
    method: 'online-portal'
  }
  media?: {
    deadline: string
    sentDate?: string
    outlets: string[]
  }
}

export interface NotificationTemplate {
  templateType: 'individual' | 'hhs' | 'media' | 'attorney-general'
  subject: string
  content: string
  variables: TemplateVariable[]
  approvedBy: string
  approvedAt: string
}

export interface TemplateVariable {
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

export interface DeliveryMethod {
  method: 'email' | 'mail' | 'phone' | 'secure-portal' | 'website' | 'media'
  priority: number
  requirements: string[]
  fallback?: string
}

export interface DeliveryConfirmation {
  recipientId: string
  method: string
  sentAt: string
  deliveredAt?: string
  readAt?: string
  acknowledgedAt?: string
  bounced: boolean
  bounceReason?: string
}

// Remediation Types
export interface RemediationPlan {
  planId: string
  breachId: string
  created: string
  createdBy: string
  status: 'draft' | 'approved' | 'in-progress' | 'completed'
  objective: string
  scope: string
  timeline: string
  budget: number
  resources: RemediationResource[]
  phases: RemediationPhase[]
  metrics: RemediationMetric[]
  risks: RemediationRisk[]
  approvals: PlanApproval[]
}

export interface RemediationResource {
  resourceType: 'personnel' | 'technology' | 'consultant' | 'budget'
  name: string
  allocation: string
  cost: number
  availability: string
}

export interface RemediationPhase {
  phaseId: string
  name: string
  description: string
  startDate: string
  endDate: string
  dependencies: string[]
  tasks: RemediationTask[]
  deliverables: string[]
  successCriteria: string[]
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed'
}

export interface RemediationTask {
  taskId: string
  name: string
  description: string
  assignedTo: string
  startDate: string
  dueDate: string
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedHours: number
  actualHours?: number
  dependencies: string[]
  deliverables: string[]
  notes: string
}

export interface RemediationMetric {
  metricName: string
  description: string
  targetValue: string
  currentValue?: string
  measurementMethod: string
  frequency: string
  responsible: string
}

export interface RemediationRisk {
  riskId: string
  description: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
  contingency: string
  owner: string
}

export interface PlanApproval {
  approver: string
  approvedAt: string
  comments: string
  conditions: string[]
}

// Training and Awareness Types
export interface TrainingProgram {
  programId: string
  name: string
  description: string
  type: TrainingType
  mandatory: boolean
  frequency: TrainingFrequency
  duration: number // minutes
  audience: TrainingAudience[]
  content: TrainingContent[]
  assessments: TrainingAssessment[]
  certificates: boolean
  validityPeriod: number // months
  compliance: ComplianceMapping[]
}

export type TrainingType = 'orientation' | 'annual' | 'refresher' | 'role-specific' | 'incident-response'
export type TrainingFrequency = 'once' | 'annual' | 'biannual' | 'quarterly' | 'monthly'

export interface TrainingAudience {
  role: string
  department?: string
  securityClearance?: string
  required: boolean
}

export interface TrainingContent {
  contentId: string
  title: string
  type: 'video' | 'document' | 'interactive' | 'simulation'
  duration: number
  description: string
  objectives: string[]
  url?: string
  order: number
}

export interface TrainingAssessment {
  assessmentId: string
  name: string
  type: 'quiz' | 'scenario' | 'practical' | 'certification-exam'
  passingScore: number
  questions: AssessmentQuestion[]
  timeLimit?: number // minutes
  attempts: number
}

export interface AssessmentQuestion {
  questionId: string
  type: 'multiple-choice' | 'true-false' | 'scenario' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  points: number
}

export interface ComplianceMapping {
  standard: 'HIPAA' | 'HITECH' | 'SOC2' | 'ISO27001'
  requirement: string
  section: string
}

// Training Records
export interface TrainingRecord {
  recordId: string
  userId: string
  userEmail: string
  programId: string
  programName: string
  startedAt: string
  completedAt?: string
  status: 'not-started' | 'in-progress' | 'completed' | 'expired' | 'failed'
  score?: number
  attempts: TrainingAttempt[]
  certificateIssued?: boolean
  certificateUrl?: string
  expiresAt?: string
  supervisorApproval?: boolean
}

export interface TrainingAttempt {
  attemptId: string
  startedAt: string
  completedAt?: string
  score: number
  passed: boolean
  timeSpent: number // minutes
  responses: AssessmentResponse[]
}

export interface AssessmentResponse {
  questionId: string
  response: string | string[]
  correct: boolean
  timeSpent: number // seconds
}

// Policy Management Types
export interface CompliancePolicy {
  policyId: string
  name: string
  version: string
  category: PolicyCategory
  description: string
  purpose: string
  scope: PolicyScope
  content: PolicyContent
  approvals: PolicyApproval[]
  effectiveDate: string
  reviewDate: string
  nextReviewDate: string
  status: 'draft' | 'under-review' | 'approved' | 'effective' | 'retired'
  relatedPolicies: string[]
  relatedProcedures: string[]
  exceptions: PolicyException[]
}

export type PolicyCategory = 
  | 'privacy'
  | 'security'
  | 'access-control'
  | 'incident-response'
  | 'business-continuity'
  | 'vendor-management'
  | 'data-governance'
  | 'employee-conduct'

export interface PolicyScope {
  applicableTo: string[]
  geographicScope: string[]
  systems: string[]
  dataTypes: string[]
  exclusions: string[]
}

export interface PolicyContent {
  sections: PolicySection[]
  procedures: string[]
  responsibilities: ResponsibilityMatrix[]
  controls: PolicyControl[]
  metrics: PolicyMetric[]
}

export interface PolicySection {
  sectionId: string
  title: string
  content: string
  subsections?: PolicySection[]
  requirements: string[]
  guidance: string[]
}

export interface ResponsibilityMatrix {
  role: string
  responsibilities: string[]
  accountabilities: string[]
  authorities: string[]
}

export interface PolicyControl {
  controlId: string
  description: string
  type: 'preventive' | 'detective' | 'corrective'
  implementation: string
  testing: string
  frequency: string
  owner: string
}

export interface PolicyMetric {
  metricName: string
  description: string
  target: string
  frequency: string
  owner: string
  reportingMethod: string
}

export interface PolicyApproval {
  approver: string
  role: string
  approvedAt: string
  signature: string
  comments: string
}

export interface PolicyException {
  exceptionId: string
  requestedBy: string
  requestedAt: string
  justification: string
  scope: string
  duration: string
  compensatingControls: string[]
  approvedBy: string
  approvedAt?: string
  status: 'pending' | 'approved' | 'denied' | 'expired'
  reviewDate: string
}

// Vendor Management Types
export interface BusinessAssociate {
  baId: string
  name: string
  type: VendorType
  status: 'active' | 'inactive' | 'terminated' | 'under-review'
  contactInfo: VendorContact
  services: string[]
  dataTypes: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  agreement: BusinessAssociateAgreement
  assessments: VendorAssessment[]
  incidents: VendorIncident[]
  monitoring: VendorMonitoring
  certifications: VendorCertification[]
}

export type VendorType = 
  | 'cloud-provider'
  | 'software-vendor'
  | 'consulting'
  | 'medical-devices'
  | 'data-analytics'
  | 'communication'
  | 'facility-management'
  | 'legal-services'

export interface VendorContact {
  primary: ContactPerson
  security: ContactPerson
  privacy: ContactPerson
  technical: ContactPerson
}

export interface ContactPerson {
  name: string
  title: string
  email: string
  phone: string
  available24x7: boolean
}

export interface BusinessAssociateAgreement {
  agreementId: string
  signedDate: string
  effectiveDate: string
  expirationDate: string
  version: string
  status: 'active' | 'expired' | 'terminated'
  keyTerms: AgreementTerm[]
  dataUseRestrictions: string[]
  securityRequirements: string[]
  incidentReporting: IncidentReportingRequirement
  auditRights: AuditRights
  terminationProcedure: TerminationProcedure
}

export interface AgreementTerm {
  term: string
  description: string
  compliance: boolean
  evidence: string
}

export interface IncidentReportingRequirement {
  timeframe: string // e.g., "within 24 hours"
  method: string[]
  escalation: string
  information: string[]
}

export interface AuditRights {
  frequency: string
  scope: string[]
  notification: string
  findings: string
}

export interface TerminationProcedure {
  notice: string
  dataReturn: string
  dataDestruction: string
  certification: boolean
}

export interface VendorAssessment {
  assessmentId: string
  type: 'initial' | 'annual' | 'continuous' | 'incident-triggered'
  conductedDate: string
  conductedBy: string
  methodology: string
  scope: string[]
  findings: VendorFinding[]
  overallScore: number
  riskRating: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  remediation: VendorRemediation[]
  nextAssessment: string
}

export interface VendorFinding {
  findingId: string
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence: string
  recommendation: string
  dueDate: string
  status: 'open' | 'in-progress' | 'closed' | 'accepted'
}

export interface VendorRemediation {
  remediationId: string
  findingId: string
  action: string
  owner: string
  dueDate: string
  status: 'planned' | 'in-progress' | 'completed' | 'overdue'
  evidence: string
  verifiedBy: string
  verifiedDate?: string
}

export interface VendorIncident {
  incidentId: string
  reportedDate: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  dataInvolved: boolean
  recordsAffected?: number
  notification: VendorIncidentNotification
  resolution: VendorIncidentResolution
  lessonsLearned: string[]
}

export interface VendorIncidentNotification {
  notifiedDate: string
  method: string
  timeliness: 'on-time' | 'late' | 'very-late'
  completeness: 'complete' | 'incomplete'
  clarity: 'clear' | 'unclear'
}

export interface VendorIncidentResolution {
  resolvedDate?: string
  rootCause: string
  correctiveActions: string[]
  preventiveMeasures: string[]
  effectiveness: 'effective' | 'partially-effective' | 'ineffective'
}

export interface VendorMonitoring {
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
  metrics: VendorMetric[]
  alerts: VendorAlert[]
  reports: VendorReport[]
}

export interface VendorMetric {
  metricName: string
  description: string
  target: string
  current: string
  trend: 'improving' | 'stable' | 'declining'
  lastUpdated: string
}

export interface VendorAlert {
  alertId: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  triggeredAt: string
  description: string
  status: 'active' | 'acknowledged' | 'resolved'
  resolvedAt?: string
}

export interface VendorReport {
  reportId: string
  type: string
  generatedAt: string
  period: string
  summary: string
  findings: string[]
  recommendations: string[]
}

export interface VendorCertification {
  certificationName: string
  issuer: string
  issueDate: string
  expirationDate: string
  scope: string
  status: 'valid' | 'expired' | 'suspended' | 'revoked'
  verificationDate: string
  evidence: string
}