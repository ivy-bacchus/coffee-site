import { useState } from 'react';

type BrewerType = 'v60' | 'kalita' | 'melitta' | 'french_press' | 'clever' | 'aeropress' | 'siphon';
type Strength = 'light' | 'medium' | 'strong';

interface BrewerInfo {
  name: string; nameJa: string; category: string;
  ratio: Record<Strength, number>;
  temp: Record<Strength, string>;
  grind: string; grindJa: string; timeMin: number; timeMax: number;
}

const brewers: Record<BrewerType, BrewerInfo> = {
  v60:          { name: 'Hario V60',       nameJa: 'ハリオ V60',      category: 'ドリップ（円錐）',        ratio: { light: 16,   medium: 15,   strong: 13.5 }, temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' }, grind: 'Medium-Fine',   grindJa: '中細挽き',       timeMin: 150, timeMax: 210 },
  kalita:       { name: 'Kalita Wave',     nameJa: 'カリタウェーブ',   category: 'ドリップ（フラットボトム）', ratio: { light: 16.5, medium: 15.5, strong: 14   }, temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' }, grind: 'Medium',        grindJa: '中挽き',         timeMin: 180, timeMax: 240 },
  melitta:      { name: 'Melitta',         nameJa: 'メリタ',           category: 'ドリップ（台形1つ穴）',    ratio: { light: 16,   medium: 15,   strong: 13   }, temp: { light: '91〜94℃', medium: '89〜92℃', strong: '87〜90℃' }, grind: 'Medium',        grindJa: '中挽き',         timeMin: 180, timeMax: 270 },
  french_press: { name: 'French Press',   nameJa: 'フレンチプレス',    category: '浸漬式',                ratio: { light: 16,   medium: 14.5, strong: 12.5 }, temp: { light: '95〜98℃', medium: '93〜96℃', strong: '91〜94℃' }, grind: 'Coarse',        grindJa: '粗挽き',         timeMin: 240, timeMax: 240 },
  clever:       { name: 'Clever Dripper', nameJa: 'クレバー',          category: '浸漬式＋透過式',          ratio: { light: 16,   medium: 15,   strong: 13.5 }, temp: { light: '93〜96℃', medium: '91〜94℃', strong: '89〜92℃' }, grind: 'Medium-Coarse', grindJa: '中粗挽き',       timeMin: 180, timeMax: 240 },
  aeropress:    { name: 'AeroPress',      nameJa: 'エアロプレス',      category: '加圧浸漬式',              ratio: { light: 15,   medium: 13,   strong: 11   }, temp: { light: '90〜95℃', medium: '85〜90℃', strong: '80〜85℃' }, grind: 'Fine-Medium',   grindJa: '細挽き〜中細挽き', timeMin: 60,  timeMax: 120 },
  siphon:       { name: 'Siphon',         nameJa: 'サイフォン',        category: '真空式',                ratio: { light: 16,   medium: 14.5, strong: 13   }, temp: { light: '92〜96℃', medium: '90〜93℃', strong: '88〜91℃' }, grind: 'Medium',        grindJa: '中挽き',         timeMin: 60,  timeMax: 90  },
};

function BrewerIcon({ type, size = 26 }: { type: BrewerType; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'v60':          return <svg {...p}><path d="M5 4h14l-4 13H9L5 4z"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="10" y1="21" x2="14" y2="21"/></svg>;
    case 'kalita':       return <svg {...p}><rect x="4" y="4" width="16" height="12" rx="1"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="9" y1="16" x2="9" y2="20"/><line x1="15" y1="16" x2="15" y2="20"/></svg>;
    case 'melitta':      return <svg {...p}><path d="M6 4h12l-3 13H9L6 4z"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'french_press': return <svg {...p}><rect x="7" y="3" width="10" height="16" rx="1"/><line x1="5" y1="3" x2="19" y2="3"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="5" y1="19" x2="19" y2="19"/></svg>;
    case 'clever':       return <svg {...p}><path d="M6 4h12l-2 13H8L6 4z"/><path d="M10 17h4v2h-4z"/><line x1="12" y1="19" x2="12" y2="21"/></svg>;
    case 'aeropress':    return <svg {...p}><rect x="8" y="5" width="8" height="14" rx="1"/><rect x="9" y="2" width="6" height="3" rx="0.5"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="12" y1="2" x2="12" y2="5"/></svg>;
    case 'siphon':       return <svg {...p}><circle cx="12" cy="6" r="4"/><line x1="12" y1="10" x2="12" y2="13"/><ellipse cx="12" cy="17" rx="5" ry="4"/></svg>;
  }
}

function MetricIcon({ type }: { type: 'beans' | 'water' | 'temp' | 'grind' }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'beans': return <svg {...p}><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 2c2.8 2.8 4 6.4 3.5 9.5S12 17 12 22"/><path d="M12 2C9.2 4.8 8 8.4 8.5 11.5S12 17 12 22"/></svg>;
    case 'water': return <svg {...p}><path d="M12 2L6 12a6 6 0 1 0 12 0L12 2z"/></svg>;
    case 'temp':  return <svg {...p}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>;
    case 'grind': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>;
  }
}

const strengthLabels: Record<Strength, { ja: string; en: string }> = {
  light:  { ja: 'ライト',    en: 'Light'  },
  medium: { ja: 'ミディアム', en: 'Medium' },
  strong: { ja: 'ストロング', en: 'Strong' },
};

const cupMl = 150;

function formatTime(s: number) {
  const min = Math.floor(s / 60), sec = s % 60;
  return sec === 0 ? `${min}:00` : `${min}:${sec.toString().padStart(2, '0')}`;
}

interface StepInfo { time: string; action: string; water: string; }

function getSteps(brewer: BrewerType, coffeeG: number, waterMl: number): StepInfo[] {
  const bloom = Math.round(coffeeG * 2);
  switch (brewer) {
    case 'v60': case 'kalita': case 'melitta': {
      const rem = waterMl - bloom, p2 = Math.round(rem * 0.4), p3 = rem - p2;
      return [
        { time: '0:00', action: '蒸らし — ゆっくり全体に注ぐ', water: `${bloom}ml` },
        { time: '0:30', action: '1投目 — 中心から「の」の字に注ぐ', water: `${p2}ml` },
        { time: '1:15', action: '2投目 — 同様に注ぐ', water: `${p3}ml` },
        { time: '2:00〜', action: 'ドリップ完了を待つ（落ち切りまで）', water: '—' },
      ];
    }
    case 'french_press': return [
      { time: '0:00', action: '全量を一度に注ぐ', water: `${waterMl}ml` },
      { time: '0:10', action: 'スプーンで4〜5回撹拌', water: '—' },
      { time: '4:00', action: 'プランジャーをゆっくり押し下げる', water: '—' },
      { time: '4:15', action: 'すぐにカップに注ぐ（過抽出を防ぐ）', water: '—' },
    ];
    case 'clever': return [
      { time: '0:00', action: '全量を注ぐ（ドリッパーは閉じた状態）', water: `${waterMl}ml` },
      { time: '0:10', action: 'スプーンで軽く撹拌', water: '—' },
      { time: '2:30', action: 'サーバーにセットして排出開始', water: '—' },
      { time: '3:30〜', action: '排出完了', water: '—' },
    ];
    case 'aeropress': return [
      { time: '0:00', action: 'インバート法: 全量を注ぐ', water: `${waterMl}ml` },
      { time: '0:10', action: '3〜4回撹拌', water: '—' },
      { time: '1:00', action: 'フィルターキャップをセットし反転', water: '—' },
      { time: '1:10', action: '30秒かけてゆっくりプレス', water: '—' },
    ];
    case 'siphon': return [
      { time: '0:00', action: '下ボールの湯が上がったら粉を投入', water: `${waterMl}ml` },
      { time: '0:05', action: '竹べらで十字に撹拌', water: '—' },
      { time: '0:50', action: '火を消す → 撹拌1回', water: '—' },
      { time: '1:20〜', action: '下ボールに降りたら完成', water: '—' },
    ];
    default: return [];
  }
}

const C = { primary: '#bd490f', dark: '#221610', surface: '#ffffff', border: '#e4d8cc', text: '#1a1208', muted: '#6b5244' };

export default function RecipeCalculator() {
  const [selectedBrewer, setSelectedBrewer] = useState<BrewerType>('v60');
  const [cups, setCups] = useState(2);
  const [strength, setStrength] = useState<Strength>('medium');

  const brewer = brewers[selectedBrewer];
  const ratio = brewer.ratio[strength];
  const waterMl = cups * cupMl;
  const coffeeG = Math.round((waterMl / ratio) * 10) / 10;
  const steps = getSteps(selectedBrewer, coffeeG, waterMl);

  const active = { borderColor: C.primary, background: C.primary, color: 'white', boxShadow: '0 4px 14px rgba(189,73,15,0.3)' };
  const idle   = { borderColor: C.border,  background: C.surface, color: C.text,  boxShadow: 'none' };

  return (
    <div className="max-w-2xl mx-auto">

      {/* 1. Brewer */}
      <section className="mb-8">
        <h3 className="text-base font-bold mb-4" style={{ color: C.dark, fontFamily: 'var(--font-heading)' }}>
          1. 抽出器具を選ぶ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(Object.entries(brewers) as [BrewerType, BrewerInfo][]).map(([key, b]) => (
            <button key={key} onClick={() => setSelectedBrewer(key)}
              className="p-3 rounded-xl border text-center transition-all duration-200"
              style={selectedBrewer === key ? active : idle}
            >
              <span className="flex justify-center mb-2"><BrewerIcon type={key} size={26} /></span>
              <span className="text-xs font-semibold block leading-tight">{b.nameJa}</span>
            </button>
          ))}
        </div>
        <p className="text-xs mt-3 font-medium" style={{ color: C.muted }}>{brewer.category}</p>
      </section>

      {/* 2. Cups */}
      <section className="mb-8">
        <h3 className="text-base font-bold mb-4" style={{ color: C.dark, fontFamily: 'var(--font-heading)' }}>
          2. 杯数を選ぶ
          <span className="text-xs font-normal ml-2" style={{ color: C.muted }}>（1杯 = {cupMl}ml）</span>
        </h3>
        <div className="flex gap-3">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setCups(n)}
              className="w-14 h-14 rounded-xl border text-lg font-bold transition-all duration-200"
              style={cups === n ? active : idle}
            >{n}</button>
          ))}
        </div>
      </section>

      {/* 3. Strength */}
      <section className="mb-10">
        <h3 className="text-base font-bold mb-4" style={{ color: C.dark, fontFamily: 'var(--font-heading)' }}>
          3. 好みの濃さ
        </h3>
        <div className="flex gap-3">
          {(Object.entries(strengthLabels) as [Strength, { ja: string; en: string }][]).map(([key, label]) => (
            <button key={key} onClick={() => setStrength(key)}
              className="flex-1 p-3 rounded-xl border text-center transition-all duration-200"
              style={strength === key ? active : idle}
            >
              <span className="font-bold text-sm block">{label.ja}</span>
              <span className="text-xs block mt-0.5" style={{ opacity: 0.7 }}>{label.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.border}, transparent)` }} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.border}, transparent)` }} />
      </div>

      {/* Result */}
      <section>
        <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: C.dark }}>レシピ</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {([
            { label: '豆の量', value: `${coffeeG}g`, icon: 'beans' as const },
            { label: '湯量', value: `${waterMl}ml`, icon: 'water' as const },
            { label: '推奨湯温', value: brewer.temp[strength], icon: 'temp' as const },
            { label: '挽き目', value: brewer.grindJa, icon: 'grind' as const },
          ]).map((item) => (
            <div key={item.label} className="p-4 rounded-xl text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="flex justify-center mb-2" style={{ color: C.primary }}><MetricIcon type={item.icon} /></span>
              <span className="text-xl font-bold block" style={{ color: C.dark, fontFamily: 'var(--font-heading)' }}>{item.value}</span>
              <span className="text-xs block mt-1" style={{ color: C.muted }}>{item.label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm mb-6" style={{ color: C.muted }}>
          <span style={{ color: C.primary, fontWeight: 600 }}>Brew ratio: </span>
          1 : {ratio}　/　抽出目安時間: {formatTime(brewer.timeMin)}{brewer.timeMin !== brewer.timeMax ? `〜${formatTime(brewer.timeMax)}` : ''}
        </p>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white" style={{ background: C.dark }}>{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-sm font-mono font-bold" style={{ color: C.primary }}>{step.time}</span>
                  {step.water !== '—' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${C.primary}1a`, color: C.primary, border: `1px solid ${C.primary}33` }}>
                      {step.water}
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: C.text }}>{step.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
