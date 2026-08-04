import { z } from "zod";

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
});

export const applicantSignupSchema = z.object({
  fullName: z.string().trim().min(3).max(160),
  email: z.string().trim().toLowerCase().email(),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/),
  password: z.string().min(8).max(72).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  phone: z.string().trim().min(7).max(30),
  department: z.string().trim().min(2).max(120),
  designation: z.string().trim().min(2).max(120),
  region: z.string().trim().min(2).max(80)
});
