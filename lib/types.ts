export type UserRole = "Employee" | "Head of Department" | "ICT Officer" | "Administrator";

export type RequestAction =
  | "Create User"
  | "Modify User"
  | "Block User"
  | "Reset Password";

export type OperatingEnvironment = "Production" | "Testing";

export type RequestStatus =
  | "Draft"
  | "Pending HOD Approval"
  | "Pending ICT Approval"
  | "Approved"
  | "Rejected"
  | "Completed";

export type Decision = "Approved" | "Rejected";

export type ApprovalStep = {
  id: string;
  role: UserRole;
  approver: string;
  decision: Decision;
  comment: string;
  date: string;
};

export type AccessRequest = {
  id: string;
  requestNumber: string;
  createdAt: string;
  updatedAt: string;
  applicantName: string;
  region: string;
  lga: string;
  facility: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  action: RequestAction;
  environment: OperatingEnvironment;
  checkNumber: string;
  nin: string;
  systems: string[];
  requestedRole: string;
  otherSystem?: string;
  reason: string;
  status: RequestStatus;
  currentOwner: UserRole;
  targetUser?: {
    checkNumber: string;
    fullName: string;
    department: string;
    designation: string;
    phone: string;
    email: string;
  };
  approvals: ApprovalStep[];
};

export type DashboardStat = {
  label: string;
  value: string;
  hint: string;
};

export type ReportCard = {
  title: string;
  value: string;
  change: string;
};
