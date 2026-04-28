# Coffee Site Progress

## 最終更新
- 担当：Claude Code
- 日時：2026-04-28 11:50

## 現在の状態
AI生成画像2枚をサイトに統合。ホームヒーローをカラフルなコラージュ画像に刷新、科学ページにインフォグラフィックを追加。デプロイ済み。

## 作業ログ

### 2026-04-28 11:50 - Claude Code
- 実施内容：AI生成画像2枚をサイトに配置
  - ホームページ（ja/en）ヒーロー右パネル：v60.jpg → 12枚コラージュ写真（collage.png）に差し替え。グレースケール除去、左フェードグラデーション追加で視認性確保
  - 科学ページ（ja/en）：インフォグラフィック（reference-guide.png）をイントロ下に全幅セクションとして追加
- 変更ファイル：src/pages/ja/index.astro, src/pages/en/index.astro, src/pages/ja/science/index.astro, src/pages/en/science/index.astro, public/images/home/collage.png（新）, public/images/science/reference-guide.png（新）

### 2026-03-26 17:52 - Claude Code
- 実施内容：サイト全体のUXリデザイン
  - CSS-onlyアニメーション追加（ambient orbs + scroll reveal）
  - 日本語ホームページのi18n修正（英語ラベル→日本語）
  - CTAボタンの統一デザイン化（矢印アイコン付き、明確なhover状態）
  - 産地ページの国旗表示をリデザイン（全面背景→小さな丸型アイコン）
  - BrewCalc拡張：メリタ/クレバー/サイフォン追加、水質セレクター、抽出収率/TDS推定、フィルタータイプ情報
  - tailwind-design-system / animation-designer スキルのパターンを活用
- 変更ファイル：global.css, AmbientOrbs.astro(新), ja/index.astro, en/index.astro, ja/origins/index.astro, en/origins/index.astro, BrewCalc.tsx

## 次のステップ
- [ ] 他のサブページ（brewing, science, processing）の日本語テキスト監査
- [ ] モバイルでのアニメーション表示確認・調整（prefers-reduced-motion対応など）
- [ ] RecipeCalculator.tsx（未使用）の削除または統合検討

## 引き継ぎ・懸念点
- RecipeCalculator.tsx は現在どのページからもimportされていない（BrewCalc.tsxがja/enの両方で使用中）
- ambient orbsはfixed positionで全ページに影響するため、BaseLayoutに入れずホームページのみに限定している
- 産地カードの旧デザイン（国旗フル背景）から新デザイン（丸型アイコン+グラデーション）に変更済み
