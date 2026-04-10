"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

export async function createBriefingSession(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "タイトルは必須です" };
  }

  const scheduledAtRaw = String(formData.get("scheduled_at") ?? "").trim();
  const scheduled_at = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;

  const { data, error } = await supabase
    .from("briefing_sessions")
    .insert({
      title,
      scheduled_at,
      location: String(formData.get("location") ?? "").trim() || null,
      owner_name: String(formData.get("owner_name") ?? "").trim() || null,
      status: String(formData.get("status") ?? "scheduled"),
      site_name: String(formData.get("site_name") ?? "").trim() || null,
      site_identifier: String(formData.get("site_identifier") ?? "").trim() || null,
      household_count: parseOptionalInt(formData.get("household_count")),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/briefings");
  redirect(`/dashboard/briefings/${data.id}`);
}

export async function updateBriefingSession(sessionId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "タイトルは必須です" };
  }

  const scheduledAtRaw = String(formData.get("scheduled_at") ?? "").trim();
  const scheduled_at = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;

  const { error } = await supabase
    .from("briefing_sessions")
    .update({
      title,
      scheduled_at,
      location: String(formData.get("location") ?? "").trim() || null,
      owner_name: String(formData.get("owner_name") ?? "").trim() || null,
      status: String(formData.get("status") ?? "scheduled"),
      site_name: String(formData.get("site_name") ?? "").trim() || null,
      site_identifier: String(formData.get("site_identifier") ?? "").trim() || null,
      household_count: parseOptionalInt(formData.get("household_count")),
    })
    .eq("id", sessionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/briefings");
  revalidatePath(`/dashboard/briefings/${sessionId}`);
  return { error: null };
}

export async function addBriefingMaterial(sessionId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "資料名は必須です" };
  }

  const { error } = await supabase.from("briefing_materials").insert({
    session_id: sessionId,
    title,
    url: String(formData.get("url") ?? "").trim() || null,
    updated_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/briefings/${sessionId}`);
  return { error: null };
}

export async function addBriefingQa(sessionId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const question = String(formData.get("question") ?? "").trim();
  if (!question) {
    return { error: "質問は必須です" };
  }

  const { error } = await supabase.from("briefing_qa").insert({
    session_id: sessionId,
    question,
    draft_answer: String(formData.get("draft_answer") ?? "").trim() || null,
    confirmed_answer: String(formData.get("confirmed_answer") ?? "").trim() || null,
    status: String(formData.get("status") ?? "open"),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/briefings/${sessionId}`);
  return { error: null };
}

export async function updateBriefingQa(qaId: string, sessionId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const { error } = await supabase
    .from("briefing_qa")
    .update({
      question: String(formData.get("question") ?? "").trim(),
      draft_answer: String(formData.get("draft_answer") ?? "").trim() || null,
      confirmed_answer: String(formData.get("confirmed_answer") ?? "").trim() || null,
      status: String(formData.get("status") ?? "open"),
    })
    .eq("id", qaId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/briefings/${sessionId}`);
  return { error: null };
}

export async function addBriefingDecision(sessionId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です" };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "決定事項は必須です" };
  }

  const decidedRaw = String(formData.get("decided_on") ?? "").trim();
  const decided_on = decidedRaw || new Date().toISOString().slice(0, 10);

  const materialId = String(formData.get("related_material_id") ?? "").trim();
  const qaId = String(formData.get("related_qa_id") ?? "").trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const { error } = await supabase.from("briefing_decisions").insert({
    session_id: sessionId,
    body,
    decided_on,
    related_material_id: uuidRe.test(materialId) ? materialId : null,
    related_qa_id: uuidRe.test(qaId) ? qaId : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/briefings/${sessionId}`);
  return { error: null };
}

export async function signOutBriefing() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/briefing-sign-in");
}
