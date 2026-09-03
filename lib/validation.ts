import { z } from "zod";
import { lgasByRegion, regions, type Region } from "@/lib/constants";

export const requestSchema = z.object({
  region: z.string().min(2).max(80),
  lga: z.string().min(2).max(120),
  facility: z.string().min(2).max(160),
  action: z.enum(["Create User", "Modify User", "Block User", "Reset Password"]),
  environment: z.enum(["Production", "Testing"]),
  checkNumber: z.string().min(2).max(40),
  nin: z.string().min(10).max(30),
  fullName: z.string().min(3).max(160),
  designation: z.string().min(2).max(120),
  department: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email(),
  targetCheckNumber: z.string().max(40).optional(),
  targetFullName: z.string().max(160).optional(),
  targetDesignation: z.string().max(120).optional(),
  targetDepartment: z.string().max(120).optional(),
  targetPhone: z.string().max(30).optional(),
  targetEmail: z.union([z.string().email(), z.literal("")]).optional(),
  requestedRole: z.string().min(2).max(160),
  otherSystem: z.string().max(120).optional(),
  reason: z.string().min(10).max(2000),
  systems: z.array(z.string().min(1).max(80)).min(1).max(30),
  mode: z.enum(["draft", "submit"]).default("submit")
}).superRefine((data, context) => {
  if (!regions.includes(data.region as Region)) {
    context.addIssue({ code: "custom", path: ["region"], message: "Select a valid region." });
    return;
  }

  const validLgas = lgasByRegion[data.region as Region] as readonly string[];
  if (!validLgas.includes(data.lga)) {
    context.addIssue({ code: "custom", path: ["lga"], message: "Select an LGA that belongs to the selected region." });
  }

  // Validate otherSystem when 'Other' is included in systems list
  if (data.systems.includes("Other") && (!data.otherSystem || !data.otherSystem.trim())) {
    context.addIssue({ code: "custom", path: ["otherSystem"], message: "Specify the system name when 'Other' is selected." });
  }

  // Validate target user fields when action target is another employee
  const requiresTarget = ["Modify User", "Block User", "Reset Password"].includes(data.action);
  if (requiresTarget) {
    if (!data.targetCheckNumber || !data.targetCheckNumber.trim()) {
      context.addIssue({ code: "custom", path: ["targetCheckNumber"], message: "Enter the target employee's check number." });
    }
    if (!data.targetFullName || !data.targetFullName.trim()) {
      context.addIssue({ code: "custom", path: ["targetFullName"], message: "Enter the target employee's full name." });
    }
  }
});

export const applicantSignupSchema = z.object({
  fullName: z.string().trim().min(3, "Enter the applicant's full name (at least 3 characters).").max(160, "Full name must not exceed 160 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address, for example name@organization.go.tz."),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/, "Use 3-40 letters, numbers, dots, underscores, or hyphens only."),
  password: z.string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password must not exceed 72 characters.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
  phone: z.string().trim()
    .min(7, "Enter a valid phone number with at least 7 digits.")
    .max(30, "Phone number must not exceed 30 characters.")
    .regex(/^\+?[0-9][0-9\s-]*$/, "Phone number may contain digits, spaces, hyphens, and an optional leading +."),
  department: z.string().trim().min(2, "Select the applicant's department.").max(120, "Department name is too long."),
  designation: z.string().trim().min(2, "Enter the applicant's official designation.").max(120, "Designation must not exceed 120 characters."),
  region: z.string().trim().min(2, "Select the applicant's region.").max(80, "Region name is too long."),
  acceptedUse: z.string().refine((value) => value === "on", "Confirm the declaration before creating an account.")
});
