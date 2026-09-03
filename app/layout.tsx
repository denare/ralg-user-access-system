import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getCurrentShellProfile } from "@/lib/auth";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "e-Vibali Chalinze | Mfumo wa Vibali vya TEHAMA",
  description: "Mfumo rasmi wa kidijitali wa maombi ya ufikiaji wa mifumo ya taarifa ya Halmashauri ya Wilaya ya Chalinze.",
  icons: {
    icon: [
      { url: "/branding/HalmashauriYaChalinze.png", type: "image/png" },
    ],
    apple: "/branding/HalmashauriYaChalinze.png",
    shortcut: "/branding/HalmashauriYaChalinze.png",
  },
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
