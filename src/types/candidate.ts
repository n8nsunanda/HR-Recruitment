/**
 * Candidate types for registration form and admin dashboard.
 */

export type CandidateStatus =
  | "New"
  | "CV Shared"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected";

/** One row in Google Sheet. Columns: CandidateId, Name, Email, Mobile, City, ResumeLink, Status, HRNotes, CreatedAt */
export interface CandidateRow {
  candidateId?: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  resumeLink: string;
  status: CandidateStatus;
  hrNotes: string;
  createdAt: string;
}

/** For API responses – row index used for updates. */
export interface CandidateWithId extends CandidateRow {
  rowIndex: number;
}

/** Payload for POST /api/submit-candidate (form fields). */
export interface SubmitCandidatePayload {
  fullName: string;
  email: string;
  mobile: string;
  city?: string;
}

/** Payload for POST /api/update-candidate. */
export interface UpdateCandidatePayload {
  rowIndex: number;
  status?: CandidateStatus;
  hrNotes?: string;
}
