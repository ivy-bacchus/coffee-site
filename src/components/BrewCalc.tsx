import { useState, useEffect } from 'react';

type Method = 'v60' | 'kalita' | 'french_press' | 'aeropress' | 'chemex';
type Roast = 'light' | 'medium' | 'dark';

const PRIMARY = '#bd490f';
const DARK = '#221610';
const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));

// ── Method data ──────────────────────────────────────────────────────────────
interface MethodData {
  label: { en: string; ja: string };
  defaultRatio: number;
  defaultTemp: number;
  defaultWater: number;
  grind: { en: string; ja: string };
}

const METHODS: Record<Method, MethodData> = {
  v60:          { label: { en: 'V60',          ja: 'V60'          }, defaultRatio: 15, defaultTemp: 93, defaultWater: 300, grind: { en: 'Medium-Fine',   ja: '中細挽き'     } },
  kalita:       { label: { en: 'Kalita Wave',  ja: 'カリタウェーブ' }, defaultRatio: 15, defaultTemp: 92, defaultWater: 300, grind: { en: 'Medium',        ja: '中挽き'       } },
  french_press: { label: { en: 'French Press', ja: 'フレンチプレス' }, defaultRatio: 14, defaultTemp: 95, defaultWater: 300, grind: { en: 'Coarse',        ja: '粗挽き'       } },
  aeropress:    { label: { en: 'AeroPress',    ja: 'エアロプレス'  }, defaultRatio: 13, defaultTemp: 88, defaultWater: 200, grind: { en: 'Fine-Medium',   ja: '細〜中細挽き'  } },
  chemex:       { label: { en: 'Chemex',       ja: 'ケメックス'    }, defaultRatio: 16, defaultTemp: 94, defaultWater: 400, grind: { en: 'Medium-Coarse', ja: '中粗挽き'     } },
};

// ── Method icons ─────────────────────────────────────────────────────────────
function MethodIcon({ method }: { method: Method }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (method) {
    case 'v60':          return <svg {...p}><path d="M5 4h14l-4 13H9L5 4z"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="10" y1="21" x2="14" y2="21"/></svg>;
    case 'kalita':       return <svg {...p}><rect x="4" y="4" width="16" height="11" rx="1"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="9" y1="15" x2="9" y2="19"/><line x1="15" y1="15" x2="15" y2="19"/></svg>;
    case 'french_press': return <svg {...p}><rect x="7" y="3" width="10" height="16" rx="1"/><line x1="5" y1="3" x2="19" y2="3"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="12" y1="3" x2="12" y2="9"/></svg>;
    case 'aeropress':    return <svg {...p}><rect x="8" y="5" width="8" height="14" rx="1"/><rect x="9" y="2" width="6" height="3" rx="0.5"/><line x1="8" y1="11" x2="16" y2="11"/></svg>;
    case 'chemex':       return <svg {...p}><path d="M8 3h8l-2 8H10L8 3z"/><path d="M10 11v2a4 4 0 0 0 4 0v-2"/><path d="M8 17h8"/><line x1="12" y1="13" x2="12" y2="17"/></svg>;
  }
}

// ── Steps ─────────────────────────────────────────────────────────────────────
interface Step { time: number; label: { en: string; ja: string }; water: string | null; }

function getSteps(method: Method, beans: number, water: number): Step[] {
  const bloom = Math.round(beans * 2);
  switch (method) {
    case 'v60':
    case 'kalita': {
      const rem = water - bloom;
      const p1 = Math.round(rem * 0.45);
      const p2 = rem - p1;
      return [
        { time: 0,   label: { en: 'Bloom — pour slowly over all grounds',   ja: '蒸らし — 全体にゆっくり注ぐ'        }, water: `${bloom}ml` },
        { time: 30,  label: { en: '1st pour — spiral from center outward',  ja: '1投目 — 中心から「の」の字に注ぐ'    }, water: `+${p1}ml`  },
        { time: 75,  label: { en: '2nd pour — continue in spiral motion',   ja: '2投目 — 同様に螺旋状に注ぐ'          }, water: `+${p2}ml`  },
        { time: 130, label: { en: 'Wait for drawdown to complete',          ja: '落ち切るまで待つ'                     }, water: null       },
      ];
    }
    case 'chemex': {
      const rem = water - bloom;
      const p1 = Math.round(rem * 0.4);
      const p2 = Math.round(rem * 0.3);
      const p3 = rem - p1 - p2;
      return [
        { time: 0,   label: { en: 'Bloom — saturate grounds evenly',        ja: '蒸らし — 全体に均等に注ぐ'           }, water: `${bloom}ml` },
        { time: 45,  label: { en: '1st pour — slow spiral',                 ja: '1投目 — ゆっくり螺旋状に'            }, water: `+${p1}ml`  },
        { time: 120, label: { en: '2nd pour — continue',                    ja: '2投目 — 引き続き注ぐ'                }, water: `+${p2}ml`  },
        { time: 195, label: { en: '3rd pour — final',                       ja: '3投目 — 最終投入'                    }, water: `+${p3}ml`  },
        { time: 240, label: { en: 'Wait for complete drawdown (~4:30)',     ja: '完全に落ち切るまで待つ（約4:30）'     }, water: null       },
      ];
    }
    case 'french_press':
      return [
        { time: 0,   label: { en: 'Pour all water at once',                 ja: '全量を一度に注ぐ'                    }, water: `${water}ml` },
        { time: 10,  label: { en: 'Stir gently 4–5 times',                 ja: 'スプーンで4〜5回撹拌'                }, water: null       },
        { time: 60,  label: { en: 'Place lid on (plunger up)',              ja: 'フタをする（プランジャーは上げておく）'}, water: null       },
        { time: 240, label: { en: 'Press plunger down slowly',             ja: 'プランジャーをゆっくり押し下げる'     }, water: null       },
        { time: 255, label: { en: 'Pour immediately to avoid over-extraction', ja: 'すぐにカップへ（過抽出を防ぐ）'  }, water: null       },
      ];
    case 'aeropress':
      return [
        { time: 0,   label: { en: 'Invert AeroPress, add grounds',          ja: '逆向きにセットし粉を投入'            }, water: null       },
        { time: 5,   label: { en: 'Pour all water, stir 3–4 times',         ja: '全量を注いで3〜4回撹拌'              }, water: `${water}ml` },
        { time: 30,  label: { en: 'Attach cap with filter',                 ja: 'フィルターキャップを取り付ける'       }, water: null       },
        { time: 60,  label: { en: 'Flip over cup, press slowly (30 sec)',   ja: 'カップに反転し、30秒かけてプレス'    }, water: null       },
      ];
  }
}

// ── Flavor prediction ─────────────────────────────────────────────────────────
interface FlavorProfile { acidity: number; sweetness: number; body: number; bitterness: number; }

function getFlavorProfile(ratio: number, temp: number, roast: Roast): FlavorProfile {
  // ratio 10=very strong, 22=very weak → strengthFactor 0..1
  const strengthFactor = 1 - (ratio - 10) / 12;
  // temp 80..100 → heatFactor 0..1
  const heatFactor = (temp - 80) / 20;
  const rf = roast === 'light' ? 0 : roast === 'medium' ? 0.5 : 1;

  const acidity    = clamp(Math.round(85 - strengthFactor * 35 - heatFactor * 20 + (1 - rf) * 25), 5, 95);
  const bitterness = clamp(Math.round(strengthFactor * 45 + heatFactor * 30 + rf * 30 - 10),        5, 90);
  const midS = 1 - Math.abs(strengthFactor - 0.55) * 1.6;
  const midT = 1 - Math.abs(heatFactor - 0.6)     * 1.4;
  const sweetness  = clamp(Math.round((midS * 50 + midT * 30 + (rf === 0.5 ? 20 : 5))), 10, 88);
  const body       = clamp(Math.round(strengthFactor * 40 + heatFactor * 25 + rf * 25 + 10),         10, 95);

  return { acidity, sweetness, body, bitterness };
}

function getExtractionLabel(flavor: FlavorProfile, lang: 'en' | 'ja') {
  const diff = flavor.acidity - flavor.bitterness;
  if (diff > 22) return lang === 'ja' ? '酸味寄り — 温度を上げるか比率を下げてみて' : 'Bright & Acidic — try higher temp or lower ratio';
  if (diff < -22) return lang === 'ja' ? '苦味寄り — 比率を上げるか温度を下げてみて' : 'Rich & Bold — try higher ratio or lower temp';
  return lang === 'ja' ? 'バランスが取れています' : 'Well Balanced';
}

// ── Slider card ───────────────────────────────────────────────────────────────
function SliderCard({
  label, valueDisplay, unit, min, max, step, value, onChange, hintLeft, hintRight,
}: {
  label: string; valueDisplay: string | number; unit: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; hintLeft: string; hintRight: string;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PRIMARY }}>{label}</span>
        <span style={{ fontSize: '24px', fontWeight: 900, color: 'white', fontFamily: 'Work Sans, sans-serif' }}>
          {valueDisplay}<span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginLeft: '3px' }}>{unit}</span>
        </span>
      </div>
      <input
        className="brew-slider"
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: '8px' }}>
        <span>{hintLeft}</span><span>{hintRight}</span>
      </div>
    </div>
  );
}

// ── Flavor bar ────────────────────────────────────────────────────────────────
function FlavorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ width: '72px', fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ width: '32px', textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, flexShrink: 0 }}>{value}</span>
    </div>
  );
}

// ── Format time ───────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ── Main component ────────────────────────────────────────────────────────────
// ── Warning thresholds ────────────────────────────────────────────────────────
function getRatioWarning(ratio: number, lang: 'en' | 'ja'): { level: 'strong' | 'weak' | 'ok'; msg: string } {
  if (ratio < 11) return {
    level: 'strong',
    msg: lang === 'ja'
      ? `現在の比率 1:${ratio.toFixed(1)} は非常に濃いです。苦味・渋みが強くなりすぎる可能性があります。比率を上げるか、豆を減らしてみてください。`
      : `Ratio 1:${ratio.toFixed(1)} is very strong. Expect heavy bitterness and astringency. Try increasing the ratio or reducing coffee.`,
  };
  if (ratio < 12.5) return {
    level: 'strong',
    msg: lang === 'ja'
      ? `比率 1:${ratio.toFixed(1)} はやや濃いめです。エスプレッソ系以外では苦味が強くなりがちです。`
      : `Ratio 1:${ratio.toFixed(1)} is on the strong side. May taste bitter outside espresso-style brewing.`,
  };
  if (ratio > 19) return {
    level: 'weak',
    msg: lang === 'ja'
      ? `現在の比率 1:${ratio.toFixed(1)} は非常に薄いです。風味が薄く水っぽくなる可能性があります。比率を下げるか、豆を増やしてみてください。`
      : `Ratio 1:${ratio.toFixed(1)} is very diluted. Expect watery, flat flavor. Try lowering the ratio or adding more coffee.`,
  };
  if (ratio > 17) return {
    level: 'weak',
    msg: lang === 'ja'
      ? `比率 1:${ratio.toFixed(1)} はやや薄めです。フレーバーが軽くなりがちです。`
      : `Ratio 1:${ratio.toFixed(1)} is on the weak side. Flavors may taste thin or underdeveloped.`,
  };
  return { level: 'ok', msg: '' };
}

export default function BrewCalc({ lang = 'en' }: { lang?: 'en' | 'ja' }) {
  const [method, setMethod] = useState<Method>('v60');
  const [beans, setBeans]   = useState(Math.round(300 / 15 * 10) / 10); // independent
  const [water, setWater]   = useState(300);                             // independent
  const [temp, setTemp]     = useState(93);
  const [roast, setRoast]   = useState<Roast>('medium');

  // Timer
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsed, setElapsed]       = useState(0);

  useEffect(() => {
    if (timerState !== 'running') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [timerState]);

  // Computed ratio from independent beans + water
  const ratio = Math.round((water / beans) * 10) / 10;

  // When method changes, reset to defaults
  const handleMethodChange = (m: Method) => {
    setMethod(m);
    const defaultBeans = Math.round((METHODS[m].defaultWater / METHODS[m].defaultRatio) * 10) / 10;
    setBeans(defaultBeans);
    setWater(METHODS[m].defaultWater);
    setTemp(METHODS[m].defaultTemp);
    setTimerState('idle');
    setElapsed(0);
  };

  // Ratio slider adjusts beans (water stays fixed)
  const handleRatioSlider = (v: number) => {
    setBeans(Math.round((water / v) * 10) / 10);
  };

  const bloom      = Math.round(beans * 2);
  const steps      = getSteps(method, beans, water);
  const flavor     = getFlavorProfile(ratio, temp, roast);
  const methodData = METHODS[method];
  const warning    = getRatioWarning(ratio, lang);

  // Current step index based on elapsed time
  const currentStep = timerState !== 'idle'
    ? steps.reduce((acc, s, i) => (elapsed >= s.time ? i : acc), -1)
    : -1;

  const totalBrewTime = steps[steps.length - 1]?.time ?? 0;
  const isDone = timerState !== 'idle' && elapsed >= totalBrewTime + 30;

  const ja = lang === 'ja';
  const T = {
    title:         ja ? 'コーヒー比率' : 'Coffee Ratio',
    titleAccent:   ja ? '計算機'       : 'Calculator',
    subtitle:      ja ? '変数を調整して、理想の抽出を設計する。' : 'Adjust variables for the perfect scientific brew.',
    method:        ja ? '抽出方法'     : 'Brew Method',
    brewRatio:     ja ? '抽出比率'     : 'Brew Ratio',
    coffee:        ja ? 'コーヒー豆'   : 'Coffee Beans',
    water:         ja ? '湯量'         : 'Total Water',
    temp:          ja ? '湯温'         : 'Water Temp',
    roastLabel:    ja ? '焙煎度'       : 'Roast Level',
    light:         ja ? 'ライト'       : 'Light',
    medium:        ja ? 'ミディアム'   : 'Medium',
    dark:          ja ? 'ダーク'       : 'Dark',
    flavorTitle:   ja ? 'フレーバー予測' : 'Flavor Prediction',
    acidity:       ja ? '酸味'         : 'Acidity',
    sweetness:     ja ? '甘味'         : 'Sweetness',
    body:          ja ? 'ボディ'       : 'Body',
    bitterness:    ja ? '苦味'         : 'Bitterness',
    finalRecipe:   ja ? '最終レシピ'   : 'Final Recipe',
    bloom:         ja ? `蒸らし：${bloom}mlで30秒` : `Bloom with ${bloom}ml for 30 sec`,
    startTimer:    ja ? 'タイマー開始' : 'Start Timer',
    pause:         ja ? '一時停止'     : 'Pause',
    resume:        ja ? '再開'         : 'Resume',
    reset:         ja ? 'リセット'     : 'Reset',
    brewGuide:     ja ? '抽出ガイド'   : 'Brewing Guide',
    grindSize:     ja ? '挽き目'       : 'Grind Size',
    done:          ja ? '完成！'       : 'Done!',
    strongHint:    ja ? '濃い (1:10)'  : 'Strong (1:10)',
    lightHint:     ja ? '薄い (1:22)'  : 'Mellow (1:22)',
    lowTemp:       ja ? '低め (80°)'   : 'Low (80°)',
    highTemp:      ja ? '高め (100°)'  : 'High (100°)',
    smallCup:      ja ? '1杯 (150ml)'  : 'Cup (150ml)',
    largePot:      ja ? '大容量 (800ml)' : 'Pot (800ml)',
  };

  return (
    <div style={{ background: DARK, minHeight: '100vh', paddingTop: '64px' }}>
      {/* Custom slider CSS */}
      <style>{`
        .brew-slider { -webkit-appearance: none; width: 100%; height: 4px; background: rgba(255,255,255,0.12); outline: none; border-radius: 2px; cursor: pointer; }
        .brew-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: ${PRIMARY}; cursor: pointer; border-radius: 50%; border: 2px solid ${DARK}; transition: transform 0.1s; }
        .brew-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .brew-slider::-moz-range-thumb { width: 18px; height: 18px; background: ${PRIMARY}; border-radius: 50%; border: 2px solid ${DARK}; cursor: pointer; }
      `}</style>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '28px 40px' }}>
        <h1 style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
          {T.title} <span style={{ color: PRIMARY }}>{T.titleAccent}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '15px' }}>{T.subtitle}</p>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── LEFT: Calculator ──────────────────────────────── */}
        <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Method selector */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>{T.method}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(Object.entries(METHODS) as [Method, MethodData][]).map(([key, m]) => {
                const active = key === method;
                return (
                  <button
                    key={key}
                    onClick={() => handleMethodChange(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '9px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${active ? PRIMARY : 'rgba(255,255,255,0.12)'}`,
                      background: active ? PRIMARY : 'transparent',
                      color: active ? 'white' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <MethodIcon method={key} />
                    {m.label[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Ratio slider: adjusts beans, displays computed ratio */}
            <SliderCard
              label={T.brewRatio}
              valueDisplay={`1:${ratio}`}
              unit=""
              min={10} max={22} step={0.5}
              value={clamp(ratio, 10, 22)}
              onChange={handleRatioSlider}
              hintLeft={T.strongHint} hintRight={T.lightHint}
            />
            {/* Beans: fully independent */}
            <SliderCard
              label={T.coffee}
              valueDisplay={beans}
              unit="g"
              min={5} max={80} step={0.5}
              value={beans}
              onChange={(v) => setBeans(v)}
              hintLeft="5g" hintRight="80g"
            />
            {/* Water: fully independent */}
            <SliderCard
              label={T.water}
              valueDisplay={water}
              unit="ml"
              min={100} max={800} step={10}
              value={water}
              onChange={(v) => setWater(v)}
              hintLeft={T.smallCup} hintRight={T.largePot}
            />
            <SliderCard
              label={T.temp}
              valueDisplay={temp}
              unit="°C"
              min={80} max={100} step={1}
              value={temp}
              onChange={(v) => setTemp(v)}
              hintLeft={T.lowTemp} hintRight={T.highTemp}
            />
          </div>

          {/* Ratio warning */}
          {warning.level !== 'ok' && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '14px 18px', borderRadius: '10px',
              background: warning.level === 'strong' ? 'rgba(239,68,68,0.1)' : 'rgba(96,165,250,0.1)',
              border: `1px solid ${warning.level === 'strong' ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.3)'}`,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={warning.level === 'strong' ? '#ef4444' : '#60a5fa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: warning.level === 'strong' ? '#fca5a5' : '#93c5fd', margin: 0 }}>
                {warning.msg}
              </p>
            </div>
          )}

          {/* Roast selector */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>{T.roastLabel}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['light', 'medium', 'dark'] as Roast[]).map((r) => {
                const active = roast === r;
                const label = r === 'light' ? T.light : r === 'medium' ? T.medium : T.dark;
                const color = r === 'light' ? '#f59e0b' : r === 'medium' ? PRIMARY : '#7c3a1e';
                return (
                  <button
                    key={r}
                    onClick={() => setRoast(r)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
                      background: active ? color + '22' : 'transparent',
                      color: active ? color : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flavor prediction */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{T.flavorTitle}</p>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
              }}>
                {getExtractionLabel(flavor, lang)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FlavorBar label={T.acidity}    value={flavor.acidity}    color="#60a5fa" />
              <FlavorBar label={T.sweetness}  value={flavor.sweetness}  color="#34d399" />
              <FlavorBar label={T.body}       value={flavor.body}       color={PRIMARY}  />
              <FlavorBar label={T.bitterness} value={flavor.bitterness} color="#a78bfa" />
            </div>
          </div>

          {/* Result / Timer card */}
          <div style={{ background: PRIMARY, borderRadius: '14px', padding: '28px 32px', color: 'white', boxShadow: '0 8px 32px rgba(189,73,15,0.3)' }}>
            {timerState === 'idle' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '6px' }}>{T.finalRecipe}</p>
                  <h3 style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, marginBottom: '4px' }}>
                    {beans}g / {water}ml
                  </h3>
                  <p style={{ fontSize: '13px', opacity: 0.8 }}>{T.bloom}</p>
                </div>
                <button
                  onClick={() => { setTimerState('running'); setElapsed(0); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'white', color: PRIMARY,
                    padding: '14px 24px', borderRadius: '10px',
                    fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                    border: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {T.startTimer}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '4px' }}>{T.finalRecipe}</p>
                    <p style={{ fontSize: '14px', opacity: 0.85 }}>{beans}g / {water}ml</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>
                      {isDone ? T.done : fmtTime(elapsed)}
                    </div>
                    {!isDone && (
                      <p style={{ fontSize: '12px', opacity: 0.65, marginTop: '2px' }}>/ {fmtTime(totalBrewTime + 30)}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setTimerState(timerState === 'running' ? 'paused' : 'running')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    {timerState === 'running' ? T.pause : T.resume}
                  </button>
                  <button
                    onClick={() => { setTimerState('idle'); setElapsed(0); }}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    {T.reset}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────── */}
        <aside style={{ width: 'min(380px, 100%)', flexShrink: 0 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '24px', position: 'sticky', top: '84px',
              display: 'flex', flexDirection: 'column', gap: '24px',
            }}
          >
            {/* Brewing guide */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <h3 style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '16px', fontWeight: 700, color: 'white' }}>{T.brewGuide}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {steps.map((step, i) => {
                  const isActive   = timerState !== 'idle' && i === currentStep;
                  const isPast     = timerState !== 'idle' && i < currentStep;
                  const isLast     = i === steps.length - 1;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: isLast ? 0 : '4px' }}>
                      {/* Timeline dot + line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                          background: isActive ? PRIMARY : isPast ? PRIMARY + '80' : 'rgba(255,255,255,0.15)',
                          border: isActive ? `2px solid white` : 'none',
                          boxShadow: isActive ? `0 0 8px ${PRIMARY}` : 'none',
                          transition: 'all 0.3s',
                        }} />
                        {!isLast && (
                          <div style={{ width: '2px', flex: 1, minHeight: '28px', background: isPast ? PRIMARY + '60' : 'rgba(255,255,255,0.08)', marginTop: '4px', marginBottom: '4px' }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: isLast ? 0 : '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? PRIMARY : 'rgba(255,255,255,0.35)' }}>
                            {fmtTime(step.time)}
                          </span>
                          {step.water && (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '9999px', background: PRIMARY + '22', color: PRIMARY }}>
                              {step.water}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: isActive ? 'white' : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)', lineHeight: 1.4, transition: 'color 0.3s' }}>
                          {step.label[lang]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />

            {/* Grind size */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{T.grindSize}</h4>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', background: PRIMARY + '22', color: PRIMARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {methodData.grind[lang]}
                </span>
              </div>
              {/* Grind visual scale */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '32px' }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const grindIndex = { v60: 5, kalita: 6, french_press: 10, aeropress: 3, chemex: 8 }[method] ?? 5;
                  const active = i === grindIndex;
                  const nearby = Math.abs(i - grindIndex) <= 1;
                  const h = Math.min(100, 30 + i * 5.5);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1, borderRadius: '2px',
                        height: `${h}%`,
                        background: active ? PRIMARY : nearby ? PRIMARY + '55' : 'rgba(255,255,255,0.1)',
                        transition: 'all 0.4s',
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                <span>{ja ? '極細' : 'Extra Fine'}</span>
                <span>{ja ? '粗' : 'Coarse'}</span>
              </div>
            </div>

            {/* Brew time estimate */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {ja ? '目安抽出時間' : 'Est. brew time'}
              </span>
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '18px', fontWeight: 900, color: 'white' }}>
                {fmtTime(totalBrewTime + 30)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
