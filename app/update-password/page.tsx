import { UpdatePasswordForm } from "@/components/update-password-form";

export default function UpdatePasswordPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><section className="w-full max-w-lg border border-slate-200 border-t-4 border-t-brand-government bg-white p-8 shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-brand-government">Account Security</p><h1 className="mt-3 text-2xl font-bold text-brand-ink">Set a New Password</h1><p className="mt-2 text-sm leading-6 text-slate-600">Choose a strong password that is not used for another service.</p><UpdatePasswordForm /></section></main>;
}
