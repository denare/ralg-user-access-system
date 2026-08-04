-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'HOD', 'ICT_OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestAction" AS ENUM ('CREATE_USER', 'MODIFY_USER', 'BLOCK_USER', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "OperatingEnvironment" AS ENUM ('PRODUCTION', 'TESTING');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING_HOD', 'PENDING_ICT', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "region" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "action" "RequestAction" NOT NULL,
    "environment" "OperatingEnvironment" NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "targetCheckNumber" TEXT,
    "targetFullName" TEXT,
    "targetDepartment" TEXT,
    "targetEmail" TEXT,
    "targetPhone" TEXT,
    "targetDesignation" TEXT,
    "requestedRole" TEXT NOT NULL,
    "otherSystem" TEXT,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "hodComment" TEXT,
    "ictComment" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestSystem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "system" TEXT NOT NULL,

    CONSTRAINT "RequestSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverRole" "UserRole" NOT NULL,
    "decision" "Decision" NOT NULL,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "User"("department");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRequest_requestNumber_key" ON "AccessRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "AccessRequest_applicantId_idx" ON "AccessRequest"("applicantId");

-- CreateIndex
CREATE INDEX "AccessRequest_status_idx" ON "AccessRequest"("status");

-- CreateIndex
CREATE INDEX "AccessRequest_department_idx" ON "AccessRequest"("department");

-- CreateIndex
CREATE INDEX "AccessRequest_createdAt_idx" ON "AccessRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RequestSystem_requestId_system_key" ON "RequestSystem"("requestId", "system");

-- CreateIndex
CREATE INDEX "Approval_requestId_idx" ON "Approval"("requestId");

-- CreateIndex
CREATE INDEX "Approval_approverId_idx" ON "Approval"("approverId");

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSystem" ADD CONSTRAINT "RequestSystem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
