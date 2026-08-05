import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getCurrentShellProfile } from "@/lib/auth";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Government User Access Management System",
  description: "Official digital workflow for government information system access requests."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const profile = await getCurrentShellProfile();

  return (
    <html lang="en">
      <body>
        <AppShell
          profile={profile ? { fullName: profile.fullName, role: profile.role } : null}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
