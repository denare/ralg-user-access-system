import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><section className="w-full max-w-lg border border-slate-200 border-t-4 border-t-brand-government bg-white p-8 shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-brand-government">Account Security</p><h1 className="mt-3 text-2xl font-bold text-brand-ink">Recover Account Access</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enter the email address registered with the Government User Access Management System.</p><ForgotPasswordForm /><p className="mt-6 border-t pt-5 text-center text-sm"><Link href="/login" className="font-bold text-brand-government">Return to sign in</Link></p></section></main>;
}
