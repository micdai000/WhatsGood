"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Brand */}
      <h1 className="text-[32px] font-bold tracking-tight text-[#111] text-center">
        Meritt
      </h1>
      <p className="mt-2 text-[14px] text-neutral-400 text-center">
        What people believe is worth choosing.
      </p>

      {/* Form */}
      <form
        className="mt-12 w-full max-w-sm space-y-3.5"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-[#111] py-3.5 text-[15px] font-semibold text-white transition hover:bg-neutral-800"
        >
          Create Account
        </button>
      </form>

      {/* Divider */}
      <div className="mt-8 flex w-full max-w-sm items-center gap-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[13px] text-neutral-400">or</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Log in link */}
      <p className="mt-8 text-[14px] text-neutral-400">
        Already on Meritt?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-[#111] hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
