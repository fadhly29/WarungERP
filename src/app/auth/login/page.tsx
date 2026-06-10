"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ChefHat, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/dashboard";
  const justRegistered = searchParams.get("registered") === "true";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (loginError) {
      setError(loginError.message);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="relative w-full max-w-sm"
    >
      <div className="glass-card rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Selamat Datang</h2>
          <p className="mt-1 text-sm text-slate-500">
            Masuk ke dashboard WarungERP
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {justRegistered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"
            >
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Akun berhasil dibuat! Silakan masuk dengan email dan password yang sudah didaftarkan.
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="kamu@warung.com"
              className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("email")}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-500"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("password")}
            />
            {errors.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-500"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-red-50 border border-red-200 p-3"
            >
              <p className="text-xs text-red-600">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="py-0" />
            ) : (
              <>
                Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-8 flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">WarungERP</h1>
          <p className="text-xs font-medium text-slate-500">Lite</p>
        </div>
      </motion.div>

      <Suspense fallback={
        <div className="w-full max-w-sm">
          <div className="glass-card rounded-2xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg" />
              <div className="h-4 w-48 bg-slate-100 rounded-lg" />
              <div className="space-y-3 pt-4">
                <div className="h-4 w-16 bg-slate-200 rounded-lg" />
                <div className="h-11 bg-slate-100 rounded-xl" />
                <div className="h-4 w-16 bg-slate-200 rounded-lg" />
                <div className="h-11 bg-slate-100 rounded-xl" />
                <div className="h-11 bg-emerald-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative mt-8 text-xs text-slate-400"
      >
        WarungERP Lite — ERP untuk UMKM Food & Beverage
      </motion.p>
    </div>
  );
}
