# Supabase テストユーザー作成（MCP / スクリプト / ダッシュボード）

## このエージェント環境について

- Cursor の **Supabase MCP** は、接続されているチャット／エージェントからしか操作できません。MCP を使う場合は、**Cursor で Supabase MCP が有効な状態**のチャットで「ユーザーを作成して」と依頼するか、MCP が提供するツール（例: ユーザー管理系）から実行してください。
- ローカルに **正しい `SUPABASE_SERVICE_ROLE_KEY`**（JWT の `role` が `service_role`）が無いと、Admin API ではユーザーを作れません。`anon` キーを誤って `SUPABASE_SERVICE_ROLE_KEY` に入れていないか確認してください（Dashboard → **Settings** → **API** の **service_role**）。

---

## 方法 A: 付属スクリプト（推奨・手元の PC で実行）

プロジェクトルートで:

```bash
node --env-file=.env.local scripts/create-briefing-test-user.mjs
```

メール・パスワードを固定したい場合:

```bash
BRIEFING_TEST_EMAIL="briefing.mvp.test@example.com" \
BRIEFING_TEST_PASSWORD="（強力なパスワード）" \
node --env-file=.env.local scripts/create-briefing-test-user.mjs
```

成功するとターミナルに **EMAIL** と **PASSWORD** が表示されます。  
ログイン URL: `http://localhost:3000/briefing-sign-in`

---

## 方法 B: Supabase ダッシュボード

1. [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト  
2. **Authentication** → **Users** → **Add user** → **Create new user**  
3. メール・パスワードを入力し、**Auto Confirm User** を有効にする（メール確認をスキップするため）  
4. 作成後、同じメール・パスワードで `/briefing-sign-in` からログイン

---

## 方法 C: MCP（Cursor 側）

1. `.cursor/mcp.json` で `@supabase/mcp-server-supabase` が動いていることを確認  
2. Cursor のチャットで Supabase 用 MCP ツールが選べる状態にする  
3. 「Auth にテストユーザーを追加して」と指示し、メール・パスワードを指定  

（利用可能なツール名は MCP のバージョンにより異なります。）

---

## セキュリティ

- テスト用パスワードは **リポジトリにコミットしない**でください。
- `service_role` キーは **クライアントに含めない**でください。
