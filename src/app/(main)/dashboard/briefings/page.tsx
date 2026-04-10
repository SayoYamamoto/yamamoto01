import Link from "next/link";

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  scheduled: "予定",
  completed: "実施済",
  cancelled: "中止",
};

export default async function BriefingsListPage() {
  let rows: {
    id: string;
    title: string;
    scheduled_at: string | null;
    status: string;
    owner_name: string | null;
    site_name: string | null;
  }[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("briefing_sessions")
      .select("id, title, scheduled_at, status, owner_name, site_name")
      .order("scheduled_at", { ascending: false, nullsFirst: false });

    if (error) {
      loadError = error.message;
    } else {
      rows = data ?? [];
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : "接続エラー";
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">住民説明（説明会）</h1>
          <p className="text-muted-foreground text-sm">仕様書 MVP：説明会単位・社内のみ</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/briefings/new">新規説明会</Link>
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">データを読み込めませんでした</p>
          <p className="text-muted-foreground mt-1">{loadError}</p>
          <p className="mt-2 text-muted-foreground text-xs">
            `.env.local` の Supabase 変数と、SQL マイグレーション適用を確認してください。MCP / SQL Editor で
            `briefing_sessions` の有無を確認できます（Docs/SUPABASE_MCP_確認手順.md）。
          </p>
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>日時</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>担当</TableHead>
              <TableHead>現場</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground" colSpan={5}>
                  説明会がありません。新規作成してください。
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link className="font-medium text-primary hover:underline" href={`/dashboard/briefings/${r.id}`}>
                      {r.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {r.scheduled_at ? format(new Date(r.scheduled_at), "yyyy/MM/dd HH:mm", { locale: ja }) : "—"}
                  </TableCell>
                  <TableCell>{statusLabel[r.status] ?? r.status}</TableCell>
                  <TableCell>{r.owner_name ?? "—"}</TableCell>
                  <TableCell>{r.site_name ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
