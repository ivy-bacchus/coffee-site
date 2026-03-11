import { useState } from 'react';

type BrewerType = 'v60' | 'kalita' | 'melitta' | 'french_press' | 'clever' | 'aeropress' | 'siphon';
type Strength = 'light' | 'medium' | 'strong';

interface BrewerInfo {
  name: string;
  nameJa: string;
  icon: string;
  category: string;
  ratio: Record<Strength, number>;
  temp: Record<Strength, string>;
  grind: string;
  grindJa: string;
  timeMin: number;
  timeMax: number;
}

const brewers: Record<BrewerType, BrewerInfo> = {
  v60: {
    name: 'Hario V60',
    nameJa: 'ハリオ V60',
    icon: '⏳',
    category: 'ドリップ（円錐）',
    ratio: { light: 16, medium: 15, strong: 13.5 },
    temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' },
    grind: 'Medium-Fine',
    grindJa: '中細挽き',
    timeMin: 150,
    timeMax: 210,
  },
  kalita: {
    name: 'Kalita Wave',
    nameJa: 'カリタウェーブ',
    icon: '🌊',
    category: 'ドリップ（フラットボトム）',
    ratio: { light: 16.5, medium: 15.5, strong: 14 },
    temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' },
    grind: 'Medium',
    grindJa: '中挽き',
    timeMin: 180,
    timeMax: 240,
  },
  melitta: {
    name: 'Melitta',
    nameJa: 'メリタ',
    icon: '📐',
    category: 'ドリップ（台形1つ穴）',
    ratio: { light: 16, medium: 15, strong: 13 },
    temp: { light: '91〜94℃', medium: '89〜92℃', strong: '87〜90℃' },
    grind: 'Medium',
    grindJa: '中挽き',
    timeMin: 180,
    timeMax: 270,
  },
  french_press: {
    name: 'French Press',
    nameJa: 'フレンチプレス',
    icon: '🫖',
    category: '浸漬式',
    ratio: { light: 16, medium: 14.5, strong: 12.5 },
    temp: { light: '95〜98℃', medium: '93〜96℃', strong: '91〜94℃' },
    grind: 'Coarse',
    grindJa: '粗挽き',
    timeMin: 240,
    timeMax: 240,
  },
  clever: {
    name: 'Clever Dripper',
    nameJa: 'クレバードリッパー',
    icon: '🧊',
    category: '浸漬式＋透過式',
    ratio: { light: 16, medium: 15, strong: 13.5 },
    temp: { light: '93〜96℃', medium: '91〜94℃', strong: '89〜92℃' },
    grind: 'Medium-Coarse',
    grindJa: '中粗挽き',
    timeMin: 180,
    timeMax: 240,
  },
  aeropress: {
    name: 'AeroPress',
    nameJa: 'エアロプレス',
    icon: '💉',
    category: '加圧浸漬式',
    ratio: { light: 15, medium: 13, strong: 11 },
    temp: { light: '90〜95℃', medium: '85〜90℃', strong: '80〜85℃' },
    grind: 'Fine-Medium',
    grindJa: '細挽き〜中細挽き',
    timeMin: 60,
    timeMax: 120,
  },
  siphon: {
    name: 'Siphon',
    nameJa: 'サイフォン',
    icon: '🔮',
    category: '真空式',
    ratio: { light: 16, medium: 14.5, strong: 13 },
    temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' },
    grind: 'Medium',
    grindJa: '中挽き',
    timeMin: 60,
    timeMax: 90,
  },
};

const strengthLabels: Record<Strength, { ja: string; en: string; desc: string }> = {
  light: { ja: 'ライト', en: 'Light', desc: '軽やかで明るい味わい' },
  medium: { ja: 'ミディアム', en: 'Medium', desc: 'バランスの取れた標準' },
  strong: { ja: 'ストロング', en: 'Strong', desc: '濃厚でしっかりした味わい' },
};

const cupMl = 150;

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (sec === 0) return `${min}:00`;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface StepInfo {
  time: string;
  action: string;
  water: string;
}

function getSteps(brewer: BrewerType, coffeeG: number, waterMl: number): StepInfo[] {
  const bloomWater = Math.round(coffeeG * 2);

  switch (brewer) {
    case 'v60':
    case 'kalita':
    case 'melitta': {
      const remaining = waterMl - bloomWater;
      const pour2 = Math.round(remaining * 0.4);
      const pour3 = remaining - pour2;
      return [
        { time: '0:00', action: '蒸らし — ゆっくり全体に注ぐ', water: `${bloomWater}ml` },
        { time: '0:30', action: '1投目 — 中心から「の」の字に注ぐ', water: `${pour2}ml` },
        { time: '1:15', action: '2投目 — 同様に注ぐ', water: `${pour3}ml` },
        { time: '2:00〜', action: 'ドリップ完了を待つ（落ち切りまで）', water: '—' },
      ];
    }
    case 'french_press':
      return [
        { time: '0:00', action: '全量を一度に注ぐ', water: `${waterMl}ml` },
        { time: '0:10', action: 'スプーンで4〜5回撹拌', water: '—' },
        { time: '4:00', action: 'プランジャーをゆっくり押し下げる', water: '—' },
        { time: '4:15', action: 'すぐにカップに注ぐ（過抽出を防ぐ）', water: '—' },
      ];
    case 'clever':
      return [
        { time: '0:00', action: '全量を注ぐ（ドリッパーは閉じた状態）', water: `${waterMl}ml` },
        { time: '0:10', action: 'スプーンで軽く撹拌', water: '—' },
        { time: '2:30', action: 'サーバーにセットして排出開始', water: '—' },
        { time: '3:30〜', action: '排出完了', water: '—' },
      ];
    case 'aeropress':
      return [
        { time: '0:00', action: 'インバート法: 全量を注ぐ', water: `${waterMl}ml` },
        { time: '0:10', action: '3〜4回撹拌', water: '—' },
        { time: '1:00', action: 'フィルターキャップをセットし反転', water: '—' },
        { time: '1:10', action: '30秒かけてゆっくりプレス', water: '—' },
      ];
    case 'siphon':
      return [
        { time: '0:00', action: '下ボールの湯が上がったら粉を投入', water: `${waterMl}ml` },
        { time: '0:05', action: '竹べらで十字に撹拌', water: '—' },
        { time: '0:50', action: '火を消す → 撹拌1回', water: '—' },
        { time: '1:20〜', action: '下ボールに降りたら完成', water: '—' },
      ];
    default:
      return [];
  }
}

export default function RecipeCalculator() {
  const [selectedBrewer, setSelectedBrewer] = useState<BrewerType>('v60');
  const [cups, setCups] = useState(2);
  const [strength, setStrength] = useState<Strength>('medium');

  const brewer = brewers[selectedBrewer];
  const ratio = brewer.ratio[strength];
  const waterMl = cups * cupMl;
  const coffeeG = Math.round((waterMl / ratio) * 10) / 10;
  const steps = getSteps(selectedBrewer, coffeeG, waterMl);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Brewer Selection */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          1. 抽出器具を選ぶ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(Object.entries(brewers) as [BrewerType, BrewerInfo][]).map(([key, b]) => (
            <button
              key={key}
              onClick={() => setSelectedBrewer(key)}
              className="p-3 rounded-xl border text-center transition-all duration-200"
              style={{
                borderColor: selectedBrewer === key ? 'var(--color-accent)' : 'var(--color-border)',
                background: selectedBrewer === key ? 'var(--color-accent)' : 'var(--color-card)',
                color: selectedBrewer === key ? 'white' : 'var(--color-text)',
                boxShadow: selectedBrewer === key ? '0 4px 12px rgba(193, 85, 59, 0.25)' : 'none',
              }}
            >
              <span className="text-2xl block mb-1">{b.icon}</span>
              <span className="text-xs font-medium block">{b.nameJa}</span>
            </button>
          ))}
        </div>
        <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-text-light)' }}>
          {brewer.category}
        </p>
      </section>

      {/* Cups */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          2. 杯数を選ぶ
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-light)' }}>（1杯 = {cupMl}ml）</span>
        </h3>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setCups(n)}
              className="w-14 h-14 rounded-xl border text-lg font-bold transition-all duration-200"
              style={{
                borderColor: cups === n ? 'var(--color-accent)' : 'var(--color-border)',
                background: cups === n ? 'var(--color-accent)' : 'var(--color-card)',
                color: cups === n ? 'white' : 'var(--color-text)',
                boxShadow: cups === n ? '0 4px 12px rgba(193, 85, 59, 0.25)' : 'none',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Strength */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          3. 好みの濃さ
        </h3>
        <div className="flex gap-3">
          {(Object.entries(strengthLabels) as [Strength, typeof strengthLabels.light][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStrength(key)}
              className="flex-1 p-3 rounded-xl border text-center transition-all duration-200"
              style={{
                borderColor: strength === key ? 'var(--color-accent)' : 'var(--color-border)',
                background: strength === key ? 'var(--color-accent)' : 'var(--color-card)',
                color: strength === key ? 'white' : 'var(--color-text)',
                boxShadow: strength === key ? '0 4px 12px rgba(193, 85, 59, 0.25)' : 'none',
              }}
            >
              <span className="font-bold text-sm block">{label.ja}</span>
              <span className="text-xs block mt-0.5" style={{ opacity: 0.7 }}>{label.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-secondary), transparent)' }} />
        <span className="text-2xl">☕</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-secondary), transparent)' }} />
      </div>

      {/* Result */}
      <section>
        <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          レシピ
        </h3>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '豆の量', value: `${coffeeG}g`, icon: '🫘' },
            { label: '湯量', value: `${waterMl}ml`, icon: '💧' },
            { label: '推奨湯温', value: brewer.temp[strength], icon: '🌡️' },
            { label: '挽き目', value: brewer.grindJa, icon: '⚙️' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl text-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-card), var(--color-card-hover))',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-xl block mb-1">{item.icon}</span>
              <span className="text-2xl font-bold block" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                {item.value}
              </span>
              <span className="text-xs block mt-1" style={{ color: 'var(--color-text-light)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Ratio display */}
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-light)' }}>
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-secondary)' }}>Brew ratio: </span>
          1 : {ratio}　/　抽出目安時間: {formatTime(brewer.timeMin)}{brewer.timeMin !== brewer.timeMax ? `〜${formatTime(brewer.timeMax)}` : ''}
        </p>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                    {step.time}
                  </span>
                  {step.water !== '—' && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                      {step.water}
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{step.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
