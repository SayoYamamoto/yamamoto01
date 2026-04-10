import { Suspense } from "react";

import Link from "next/link";

import { BriefingSignInForm } from "./briefing-sign-in-form";

export default function BriefingSignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">住民説明 MVP</h1>
          <p className="text-muted-foreground text-sm">社内ログイン（Supabase Auth）</p>
        </div>
        <Suspense fallback={<p className="text-muted-foreground text-sm">読み込み中…</p>}>
          <BriefingSignInForm />
        </Suspense>
        <p className="text-center text-muted-foreground text-xs">
          <Link className="text-primary underline-offset-4 hover:underline" href="/dashboard/default">
            ダッシュボードへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
