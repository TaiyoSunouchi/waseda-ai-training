# 早稲田AI研究会 研修アプリ

機械学習・深層学習・LLMの理論を学べる研修Webアプリ。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **バックエンド**: Next.js Server Actions
- **DB / Auth / Storage**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **PDF表示**: react-pdf (pdfjs-dist)
- **バリデーション**: Zod + react-hook-form
- **テスト**: Vitest + React Testing Library + Playwright
- **ドラッグ&ドロップ**: @dnd-kit/sortable

## セットアップ

### 1. 依存関係のインストール

```bash
cd waseda-ai-training
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabaseの値を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Supabaseのセットアップ

Supabaseダッシュボードの SQL Editor で以下を順番に実行してください：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_triggers.sql`
4. `supabase/migrations/004_storage.sql`

### 4. 管理者アカウントの設定

Supabaseダッシュボード > Table Editor > profiles で、管理者にしたいユーザーのroleを `admin` に変更します。

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## テスト

```bash
# ユニット・インテグレーションテスト
npm run test

# テスト（watch mode）
npm run test:watch

# E2Eテスト（要: 開発サーバー起動中）
npm run test:e2e
```

## ディレクトリ構成

```
waseda-ai-training/
├── app/
│   ├── (auth)/          # 認証ページ（ログイン・登録）
│   ├── (trainee)/       # 研修者向けページ
│   └── (admin)/         # 管理者向けページ
├── components/
│   ├── ui/              # 基本UIコンポーネント
│   ├── slides/          # PDFビューア
│   ├── quiz/            # クイズ受験・結果
│   ├── admin/           # 管理者向けコンポーネント
│   ├── layout/          # ナビゲーション
│   └── common/          # 共通コンポーネント
├── lib/
│   ├── supabase/        # Supabaseクライアント・型定義
│   ├── actions/         # Server Actions
│   ├── queries/         # データ取得関数
│   ├── validations/     # Zodスキーマ
│   └── utils/           # ユーティリティ関数
├── supabase/
│   └── migrations/      # SQLマイグレーションファイル
├── __tests__/           # ユニット・統合テスト
└── e2e/                 # E2Eテスト
```
