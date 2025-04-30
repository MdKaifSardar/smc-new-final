"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
        <p className="text-sm font-medium tracking-wide text-stone-700 font-serif">
          Completing authentication...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
