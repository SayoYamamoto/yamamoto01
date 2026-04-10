#!/usr/bin/env node
/**
 * Supabase Auth Admin API でテストユーザーを1件作成します。
 *
 * 前提:
 *   - .env.local に NEXT_PUBLIC_SUPABASE_URL と **正しい** SUPABASE_SERVICE_ROLE_KEY（role=service_role）
 *
 * 実行例:
 *   node --env-file=.env.local scripts/create-briefing-test-user.mjs
 *   BRIEFING_TEST_EMAIL=... BRIEFING_TEST_PASSWORD=... node --env-file=.env.local scripts/create-briefing-test-user.mjs
 */

import crypto from "node:crypto";
import https from "node:https";

function decodeJwtRole(jwt) {
  try {
    const payload = jwt.split(".")[1];
    const pad = 4 - (payload.length % 4);
    const b64 = payload + (pad === 4 ? "" : "=".repeat(pad));
    const json = Buffer.from(b64, "base64url").toString("utf8");
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}

function requestJson(url, options, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: options.method ?? "GET",
        headers: options.headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { raw: text };
          }
          resolve({ status: res.statusCode ?? 0, data });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email =
  process.env.BRIEFING_TEST_EMAIL ?? `briefing.mvp.test+${Date.now()}@example.invalid`;
const password =
  process.env.BRIEFING_TEST_PASSWORD ??
  `MvpTest_${crypto.randomBytes(12).toString("base64url")}_9z`;

if (!baseUrl || !serviceRole) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です（.env.local を --env-file で渡してください）。");
  process.exit(1);
}

const role = decodeJwtRole(serviceRole);
if (role !== "service_role") {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY の JWT role が service_role ではありません（anon と誤コピーしていませんか）。",
    "現在の role:",
    role,
  );
  console.error("\n作成用に用意したメール / パスワード（Dashboard から手動作成できます）:");
  console.error("  EMAIL:", email);
  console.error("  PASSWORD:", password);
  process.exit(1);
}

const payload = JSON.stringify({
  email,
  password,
  email_confirm: true,
});

const { status, data } = await requestJson(
  `${baseUrl}/auth/v1/admin/users`,
  {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
  },
  payload,
);

if (status >= 400) {
  console.error("作成に失敗しました:", status, JSON.stringify(data, null, 2));
  console.error("\n手動作成用:");
  console.error("  EMAIL:", email);
  console.error("  PASSWORD:", password);
  process.exit(1);
}

console.log("テストユーザーを作成しました。\n");
console.log("  EMAIL:", email);
console.log("  PASSWORD:", password);
console.log("\nログイン: http://localhost:3000/briefing-sign-in");
