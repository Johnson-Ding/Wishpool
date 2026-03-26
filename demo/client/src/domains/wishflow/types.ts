export type WishExecutionStatus =
  | "draft"
  | "clarifying"
  | "planning"
  | "validating"
  | "locking"
  | "ready"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export interface WishTask {
  id: string;
  title: string;
  intent: string;
  status: WishExecutionStatus;
  city?: string;
  budget?: string;
  timeWindow?: string;
}

export interface CandidatePlan {
  id: string;
  title: string;
  summary: string;
  status: Extract<WishExecutionStatus, "planning" | "validating" | "locking" | "ready">;
}

export interface ValidationCheck {
  id: string;
  type: "expert_review" | "experience_verification" | "resource_check";
  status: "pending" | "passed" | "failed";
  summary: string;
}

export interface LockDecision {
  id: string;
  scheduleConfirmed: boolean;
  budgetConfirmed: boolean;
  resourceConfirmed: boolean;
}

export interface ExperienceRecord {
  id: string;
  outcome: "completed" | "cancelled" | "failed";
  summary: string;
}
