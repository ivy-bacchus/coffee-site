# Claude Code Instructions

## Git
- 作業完了後（ビルド成功確認済み）は自動でコミット・デプロイまで行うこと
- デプロイコマンド: `npx wrangler pages deploy dist --project-name coffee-site --branch main`
- コミットメッセージは英語で簡潔に

## Stack
- Astro 6 + React 19 (islands: `client:load`) + Tailwind CSS v4
- ホスティング: Cloudflare Pages
- `import.meta.env.BASE_URL` → `''`（base pathなし）

## Design System
- Primary: `#bd490f`, Dark: `#221610`, Font: Work Sans (headings, `font-black`)
- `rounded-full` buttons, `hover:-translate-y-2` card lift effect
