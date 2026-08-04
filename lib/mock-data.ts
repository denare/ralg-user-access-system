import { AccessRequest, DashboardStat, ReportCard, UserRole } from "@/lib/types";

export const systemsCatalog = [
  "FFARS",
  "eOffice",
  "LGRCIS",
  "PLANREP",
  "MUSE",
  "IMES",
  "LAAMP",
  "GOVHOMIS",
  "GMS",
  "MADENI MIS",
  "NeST",
  "JETMIS",
  "eBOARD",
  "TAUSI",
  "PREMS",
  "VPN",
  "Domain"
] as const;

export const regions = [
  "Pwani",
  "Morogoro",
  "Dodoma",
  "Arusha",
  "Mwanza",
  "Mbeya",
  "Tanga",
  "Kigoma"
];

export const requests: AccessRequest[] = [
  {
    id: "req-001",
    requestNumber: "UAR-2026-001",
    createdAt: "2026-07-28",
    updatedAt: "2026-08-02",
    applicantName: "Yasinta Kibwana",
    region: "Pwani",
    lga: "Kibaha TC",
    facility: "HQ",
    department: "Administration",
    designation: "DO",
    email: "yasinta@tamisemi.go.tz",
    phone: "0623449786",
    action: "Reset Password",
    environment: "Testing",
    checkNumber: "11378155",
    nin: "1970103613636125000126",
    systems: ["LGRCIS", "Domain"],
    requestedRole: "Regional Officer",
    reason: "Password reset required after account lockout during field reporting.",
    status: "Pending ICT Approval",
    currentOwner: "ICT Officer",
    approvals: [
      {
        id: "apr-001",
        role: "Head of Department",
        approver: "Hadija Mshutari",
        decision: "Approved",
        comment: "Verified user identity and business need.",
        date: "2026-08-01"
      }
    ]
  },
  {
    id: "req-002",
    requestNumber: "UAR-2026-002",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-03",
    applicantName: "Joseph Kweka",
    region: "Dodoma",
    lga: "Chamwino",
    facility: "District Office",
    department: "Planning",
    designation: "Planning Officer",
    email: "jkweka@tamisemi.go.tz",
    phone: "0711223344",
    action: "Create User",
    environment: "Production",
    checkNumber: "11500911",
    nin: "19900202345671234567",
    systems: ["PLANREP", "FFARS", "eOffice"],
    requestedRole: "District Planner",
    reason: "New officer onboarded and needs access before budget cycle review.",
    status: "Pending HOD Approval",
    currentOwner: "Head of Department",
    approvals: []
  },
  {
    id: "req-003",
    requestNumber: "UAR-2026-003",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-24",
    applicantName: "Maria Nchimbi",
    region: "Morogoro",
    lga: "Mvomero",
    facility: "District Hospital",
    department: "Health",
    designation: "ICT Liaison",
    email: "mnchimbi@tamisemi.go.tz",
    phone: "0755667788",
    action: "Modify User",
    environment: "Production",
    checkNumber: "11934112",
    nin: "19890516456781234567",
    systems: ["IMES", "VPN", "eOffice"],
    requestedRole: "Facility Supervisor",
    reason: "Staff transferred to a new role and requires broader reporting privileges.",
    status: "Completed",
    currentOwner: "Administrator",
    targetUser: {
      checkNumber: "11788220",
      fullName: "Janeth Mbise",
      department: "Health",
      designation: "Clinical Officer",
      phone: "0711998822",
      email: "jmbise@tamisemi.go.tz"
    },
    approvals: [
      {
        id: "apr-002",
        role: "Head of Department",
        approver: "Benard Pius",
        decision: "Approved",
        comment: "Role change confirmed by HR memo.",
        date: "2026-07-22"
      },
      {
        id: "apr-003",
        role: "ICT Officer",
        approver: "Agnes Moshi",
        decision: "Approved",
        comment: "Updated role in production and notified applicant.",
        date: "2026-07-24"
      }
    ]
  }
];

export const dashboardStats: Record<UserRole, DashboardStat[]> = {
  Employee: [
    { label: "Requests Submitted", value: "18", hint: "4 still awaiting action" },
    { label: "Average Approval Time", value: "2.1 days", hint: "Down from 3.4 days" },
    { label: "Rejected Requests", value: "2", hint: "Both had missing details" }
  ],
  "Head of Department": [
    { label: "Awaiting Your Review", value: "7", hint: "3 marked high priority" },
    { label: "Approved This Month", value: "42", hint: "91% approval rate" },
    { label: "SLA Risk", value: "2", hint: "Older than 48 hours" }
  ],
  "ICT Officer": [
    { label: "Pending ICT Queue", value: "5", hint: "2 password resets" },
    { label: "Completed This Month", value: "31", hint: "Most in PLANREP and FFARS" },
    { label: "Accounts Provisioned", value: "12", hint: "6 new, 6 modified" }
  ],
  Administrator: [
    { label: "Total Requests", value: "143", hint: "Across 8 regions" },
    { label: "Completion Rate", value: "87%", hint: "Target is 90%" },
    { label: "Audit Exceptions", value: "1", hint: "Missing ICT comment" }
  ]
};

export const reportCards: ReportCard[] = [
  { title: "Requests This Month", value: "54", change: "+12% from July" },
  { title: "Password Resets", value: "16", change: "Fastest turnaround: 3 hours" },
  { title: "New Accounts", value: "21", change: "Most requested in Dodoma" },
  { title: "Pending Approvals", value: "12", change: "2 outside target SLA" }
];
