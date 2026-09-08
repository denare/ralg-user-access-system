export type Language = "en" | "sw";

export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    newRequest: "New Request",
    myRequests: "My Requests",
    allRequests: "All Requests",
    userAccounts: "User Accounts",
    configuration: "Configuration",
    auditLog: "Audit Log",
    profile: "Profile",
    signOut: "Sign Out",
    language: "Language",
    english: "English",
    swahili: "Kiswahili",
    
    // Status Badges
    draft: "Draft",
    pendingHod: "Pending HOD Review",
    pendingIct: "Pending ICT Processing",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    
    // Table Headers
    refNumber: "Ref Number",
    applicant: "Applicant",
    action: "Action",
    department: "Department",
    systems: "Systems",
    status: "Status",
    dateSubmitted: "Date Submitted",
    lastUpdated: "Last Updated",
    report: "Report",
    details: "Details",
    
    // Actions & Buttons
    viewDetails: "View Details",
    downloadPdf: "Download PDF",
    downloadAll: "Download All",
    applyAgain: "Apply Again",
    approve: "Approve Request",
    reject: "Reject Request",
    markCompleted: "Mark as Completed",
    cancel: "Cancel",
    submit: "Submit Request",
    saving: "Saving...",
    processing: "Processing...",
    filter: "Filter",
    clearFilters: "Clear Filters",
    searchPlaceholder: "Search by ref, applicant, check #...",
    
    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications yet",
    markAllRead: "Mark all as read",
    
    // Request Details Modal
    requestDetails: "Request Details",
    applicantInformation: "Applicant Information",
    requestedAccess: "Requested Access & Purpose",
    approvalHistory: "Approval History",
    hodDecision: "Head of Department Decision",
    ictProcessing: "ICT Processing & Completion",
    rejectionNotice: "Request Rejection Notice",
    rejectionReason: "Rejection Reason",
    officialComment: "Official Comment",
    designation: "Designation / Title",
    enterCommentPlaceholder: "Provide a detailed official comment or reason...",
    
    // Change Password
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    updatePasswordBtn: "Update Password",
    
    // Messages
    requestsFound: "requests found",
    accessDenied: "Access Denied",
    downloadNotAllowed: "You are not authorized to download this PDF report."
  },
  sw: {
    // Navigation
    dashboard: "Dashibodi",
    newRequest: "Ombi Jipya",
    myRequests: "Maombi Yangu",
    allRequests: "Maombi Yote",
    userAccounts: "Akaunti za Watumiaji",
    configuration: "Mipangilio",
    auditLog: "Kumbukumbu za Ukaguzi",
    profile: "Wasifu",
    signOut: "Ondoka",
    language: "Lugha",
    english: "English",
    swahili: "Kiswahili",
    
    // Status Badges
    draft: "Kipengele cha Kwanza",
    pendingHod: "Subiri Mapitio ya HOD",
    pendingIct: "Subiri Utekelezaji wa ICT",
    approved: "Imeidhinishwa",
    rejected: "Imekataliwa",
    completed: "Irekamilishwa",
    
    // Table Headers
    refNumber: "Namba ya Kumbukumbu",
    applicant: "Mwombaji",
    action: "Hatua",
    department: "Idara",
    systems: "Mifumo",
    status: "Hali",
    dateSubmitted: "Tarehe ya Kuwasilishwa",
    lastUpdated: "Mabadiliko ya Mwisho",
    report: "Ripoti",
    details: "Maelezo",
    
    // Actions & Buttons
    viewDetails: "Angalia Maelezo",
    downloadPdf: "Pakua Ripoti ya PDF",
    downloadAll: "Pakua Zote (ZIP)",
    applyAgain: "Omba Tena",
    approve: "Idhinisha Ombi",
    reject: "Kataa Ombi",
    markCompleted: "Weka Kama Imekamilika",
    cancel: "Ghairi",
    submit: "Wasilisha Ombi",
    saving: "Inahifadhi...",
    processing: "Inatekeleza...",
    filter: "Chuja",
    clearFilters: "Ondoa Vifujaji",
    searchPlaceholder: "Tafuta kwa namba, mwombaji, au check #...",
    
    // Notifications
    notifications: "Taarifa",
    noNotifications: "Hakuna taarifa kwa sasa",
    markAllRead: "Weka yote kama yamesomwa",
    
    // Request Details Modal
    requestDetails: "Maelezo ya Ombi",
    applicantInformation: "Taarifa za Mwombaji",
    requestedAccess: "Upatikanaji Unaombwa na Sababu",
    approvalHistory: "Historia ya Maidhinisho",
    hodDecision: "Uamuzi wa Mkuu wa Idara (HOD)",
    ictProcessing: "Utekelezaji wa Afisa wa ICT",
    rejectionNotice: "Taarifa ya Kukataliwa kwa Ombi",
    rejectionReason: "Sababu ya Kukataliwa",
    officialComment: "Maoni Rasmi",
    designation: "Wadhifa / Cheo",
    enterCommentPlaceholder: "Weka maoni au sababu rasmi kwa kina...",
    
    // Change Password
    changePassword: "Badilisha Nenosiri",
    currentPassword: "Nenosiri la Sasa",
    newPassword: "Nenosiri Jipya",
    confirmPassword: "Thibitisha Nenosiri Jipya",
    updatePasswordBtn: "Sasisha Nenosiri",
    
    // Messages
    requestsFound: "maombi yamepatikana",
    accessDenied: "Ufikiaji Umekataliwa",
    downloadNotAllowed: "Huna idhini ya kupakua ripoti hii ya PDF."
  }
};
