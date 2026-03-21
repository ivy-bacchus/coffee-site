# Claude Code Instructions

## Git
- 作業完了後（ビルド成功確認済み）は自動でコミット・pushまで行うこと
- デプロイはGitHub Actionsが自動実行（git pushで完結）
- wrangler を使ったローカルからの直接デプロイは行わないこと
- コミットメッセージは英語で簡潔に

## Stack
- Astro 6 + React 19 (islands: `client:load`) + Tailwind CSS v4
- ホスティング: Cloudflare Pages
- `import.meta.env.BASE_URL` → `''`（base pathなし）

## Design System
- Primary: `#bd490f`, Dark: `#221610`, Font: Work Sans (headings, `font-black`)
- `rounded-full` buttons, `hover:-translate-y-2` card lift effect
