"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const {
        data,
        error:
          signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          },
        );

      if (
        signInError ||
        !data.session
      ) {
        throw new Error(
          signInError?.message ??
            "Login failed",
        );
      }

      router.replace(
        "/admin/whatsapp",
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Via Nova
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Back Office Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage Via Nova operations.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target.value,
                )
              }
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target.value,
                )
              }
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}