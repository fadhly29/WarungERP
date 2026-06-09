"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "email kamu";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="mt-4">Cek Email Kamu</CardTitle>
          <CardDescription>
            Link verifikasi sudah dikirim ke <strong>{email}</strong>.
            Klik link di email untuk mengaktifkan akun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400">
            Sudah verifikasi?{" "}
            <Link href="/auth/login" className="text-emerald-600 hover:underline">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
