import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createBriefingSession } from "@/server/briefing-actions";

export const dynamic = "force-dynamic";

export default function NewBriefingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/dashboard/briefings">一覧へ</Link>
        </Button>
        <h1 className="font-semibold text-2xl tracking-tight">新規説明会</h1>
      </div>

      <form action={createBriefingSession} className="space-y-4 rounded-md border p-6">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル（必須）</Label>
          <Input id="title" name="title" placeholder="第1回 住民説明会" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">日時</Label>
          <Input id="scheduled_at" name="scheduled_at" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">場所</Label>
          <Input id="location" name="location" placeholder="〇〇公民館" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">担当（表示名）</Label>
          <Input id="owner_name" name="owner_name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <NativeSelect defaultValue="scheduled" id="status" name="status">
            <NativeSelectOption value="scheduled">予定</NativeSelectOption>
            <NativeSelectOption value="completed">実施済</NativeSelectOption>
            <NativeSelectOption value="cancelled">中止</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="site_name">工事／現場名</Label>
          <Input id="site_name" name="site_name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="site_identifier">現場識別子（任意）</Label>
          <Input id="site_identifier" name="site_identifier" placeholder="社内コード等" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="household_count">出席世帯数（数値のみ）</Label>
          <Input id="household_count" min={0} name="household_count" type="number" />
        </div>
        <Button type="submit">作成して詳細へ</Button>
      </form>
    </div>
  );
}
