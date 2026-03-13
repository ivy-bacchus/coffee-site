import { useState, useEffect, useRef } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';

interface Country {
  id: string;
  name: string;
  nameJa: string;
  slug: string;
  coords: [number, number]; // [lng, lat] centroid for label
  color: string;
  ready: boolean;
  region: string;
}

const coffeeCountries: Country[] = [
  { id: 'ETH', name: 'Ethiopia', nameJa: 'エチオピア', slug: 'ethiopia', coords: [40, 9], color: '#C1553B', ready: true, region: 'Africa' },
  { id: 'KEN', name: 'Kenya', nameJa: 'ケニア', slug: 'kenya', coords: [37.9, -0.5], color: '#C1553B', ready: true, region: 'Africa' },
  { id: 'COL', name: 'Colombia', nameJa: 'コロンビア', slug: 'colombia', coords: [-74, 4], color: '#C1553B', ready: true, region: 'Americas' },
  { id: 'BRA', name: 'Brazil', nameJa: 'ブラジル', slug: 'brazil', coords: [-51, -10], color: '#C1553B', ready: true, region: 'Americas' },
  { id: 'GTM', name: 'Guatemala', nameJa: 'グアテマラ', slug: 'guatemala', coords: [-90.5, 15.5], color: '#C1553B', ready: true, region: 'Americas' },
  { id: 'CRI', name: 'Costa Rica', nameJa: 'コスタリカ', slug: 'costa-rica', coords: [-84, 10], color: '#D4A574', ready: false, region: 'Americas' },
  { id: 'PAN', name: 'Panama', nameJa: 'パナマ', slug: 'panama', coords: [-80, 9], color: '#D4A574', ready: false, region: 'Americas' },
  { id: 'IDN', name: 'Indonesia', nameJa: 'インドネシア', slug: 'indonesia', coords: [113, -2], color: '#D4A574', ready: false, region: 'Asia' },
  { id: 'YEM', name: 'Yemen', nameJa: 'イエメン', slug: 'yemen', coords: [48, 15.5], color: '#D4A574', ready: false, region: 'Asia' },
  { id: 'RWA', name: 'Rwanda', nameJa: 'ルワンダ', slug: 'rwanda', coords: [30, -2], color: '#D4A574', ready: false, region: 'Africa' },
  { id: 'TZA', name: 'Tanzania', nameJa: 'タンザニア', slug: 'tanzania', coords: [35, -6], color: '#D4A574', ready: false, region: 'Africa' },
];

type WorldFeature = {
  type: string;
  id?: string;
  properties: Record<string, unknown>;
  geometry: GeoPermissibleObjects;
};

export default function OriginsMap({ lang = 'ja', base = '' }: { lang?: string; base?: string }) {
  const [worldData, setWorldData] = useState<WorldFeature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; country: Country } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Load world topojson from CDN
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(async (topo) => {
        const { feature } = await import('topojson-client');
        const countries = feature(topo, topo.objects.countries) as { features: WorldFeature[] };
        setWorldData(countries.features);
      })
      .catch(() => {
        // Silently fail - map won't show world outlines but pins still work
      });
  }, []);

  const width = 800;
  const height = 400;

  // Zoom into the coffee belt region — center on Africa/Middle East longitude, slight southern offset
  const projection = geoNaturalEarth1()
    .scale(175)
    .rotate([-20, 0])
    .translate([width / 2, height / 2 + 20]);

  const pathGenerator = geoPath(projection);

  const getCoffeeCountry = (id: string) =>
    coffeeCountries.find(c => {
      // Map ISO numeric codes to our ISO alpha-3
      const numericToAlpha3: Record<string, string> = {
        '231': 'ETH', '404': 'KEN', '170': 'COL', '076': 'BRA',
        '320': 'GTM', '188': 'CRI', '591': 'PAN', '360': 'IDN',
        '887': 'YEM', '646': 'RWA', '834': 'TZA',
      };
      return numericToAlpha3[id] === c.id;
    });

  const handleCountryClick = (country: Country) => {
    if (country.ready) {
      window.location.href = `${base}/${lang}/origins/${country.slug}`;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, country: Country) => {
    setHovered(country.id);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top - 10,
        country,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect && tooltip) {
      setTooltip(prev => prev ? { ...prev, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top - 10 } : null);
    }
  };

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C1553B] inline-block" />
          <span style={{ color: 'var(--color-text-light)' }}>{lang === 'ja' ? '記事あり' : 'Available'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D4A574] inline-block" />
          <span style={{ color: 'var(--color-text-light)' }}>{lang === 'ja' ? '準備中' : 'Coming Soon'}</span>
        </div>
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(135deg, #1a0f08 0%, #2d1810 100%)' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHovered(null); setTooltip(null); }}
        >
          {/* Coffee belt band + tropic lines */}
          {(() => {
            const tropicCancer = projection([0, 23.5]);
            const tropicCapricorn = projection([0, -23.5]);
            if (!tropicCancer || !tropicCapricorn) return null;
            const bandY = tropicCancer[1];
            const bandH = tropicCapricorn[1] - tropicCancer[1];
            return (
              <>
                {/* Coffee belt fill */}
                <rect x={0} y={bandY} width={width} height={bandH}
                  fill="#D4A574" fillOpacity={0.07} />
                {/* Tropic lines */}
                <line x1={0} y1={tropicCancer[1]} x2={width} y2={tropicCancer[1]}
                  stroke="#D4A574" strokeOpacity={0.3} strokeDasharray="4,6" strokeWidth={1} />
                <line x1={0} y1={tropicCapricorn[1]} x2={width} y2={tropicCapricorn[1]}
                  stroke="#D4A574" strokeOpacity={0.3} strokeDasharray="4,6" strokeWidth={1} />
                <text x={width - 8} y={tropicCancer[1] - 4}
                  fill="#D4A574" fillOpacity={0.55} fontSize={9} textAnchor="end">
                  Tropic of Cancer
                </text>
                <text x={width - 8} y={tropicCapricorn[1] - 4}
                  fill="#D4A574" fillOpacity={0.55} fontSize={9} textAnchor="end">
                  Tropic of Capricorn
                </text>
              </>
            );
          })()}

          {/* World countries */}
          {worldData.map((feature, i) => {
            const coffeeCountry = getCoffeeCountry(String(feature.id));
            const isHovered = coffeeCountry && hovered === coffeeCountry.id;
            const pathData = pathGenerator(feature.geometry);
            if (!pathData) return null;

            return (
              <path
                key={i}
                d={pathData}
                fill={
                  coffeeCountry
                    ? isHovered
                      ? coffeeCountry.ready ? '#C1553B' : '#D4A574'
                      : coffeeCountry.ready ? '#C1553B99' : '#D4A57466'
                    : '#3a2218'
                }
                stroke="#1a0f08"
                strokeWidth={0.5}
                style={{ cursor: coffeeCountry ? coffeeCountry.ready ? 'pointer' : 'default' : 'default' }}
                onMouseEnter={coffeeCountry ? (e) => handleMouseEnter(e, coffeeCountry) : undefined}
                onClick={coffeeCountry ? () => handleCountryClick(coffeeCountry) : undefined}
              />
            );
          })}

          {/* Country pins for labeled markers */}
          {coffeeCountries.map((country) => {
            const pos = projection(country.coords);
            if (!pos) return null;
            const isHov = hovered === country.id;

            return (
              <g
                key={country.id}
                transform={`translate(${pos[0]}, ${pos[1]})`}
                style={{ cursor: country.ready ? 'pointer' : 'default' }}
                onMouseEnter={(e) => handleMouseEnter(e, country)}
                onClick={() => handleCountryClick(country)}
              >
                <circle
                  r={isHov ? 7 : 5}
                  fill={country.ready ? '#C1553B' : '#D4A574'}
                  stroke="#FDF6EE"
                  strokeWidth={1.5}
                  style={{ transition: 'r 0.15s ease' }}
                />
                {isHov && (
                  <circle r={12} fill={country.ready ? '#C1553B' : '#D4A574'} fillOpacity={0.25} />
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl text-sm"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 40,
              background: 'rgba(28, 15, 8, 0.95)',
              border: '1px solid rgba(212, 165, 116, 0.3)',
              backdropFilter: 'blur(8px)',
              color: '#FDF6EE',
            }}
          >
            <p className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              {tooltip.country.nameJa}
            </p>
            <p style={{ color: 'var(--color-secondary)', fontSize: '0.75rem' }}>
              {tooltip.country.name}
            </p>
            {tooltip.country.ready ? (
              <p style={{ color: '#C1553B', fontSize: '0.7rem', marginTop: '2px' }}>
                {lang === 'ja' ? 'クリックして詳細へ →' : 'Click to explore →'}
              </p>
            ) : (
              <p style={{ color: 'rgba(212,165,116,0.6)', fontSize: '0.7rem', marginTop: '2px' }}>
                {lang === 'ja' ? '準備中' : 'Coming Soon'}
              </p>
            )}
          </div>
        )}

        {/* Coffee belt label */}
        <div
          className="absolute bottom-3 left-4 text-xs"
          style={{ color: 'rgba(212, 165, 116, 0.5)', fontFamily: 'var(--font-accent)' }}
        >
          Coffee Belt — 23.5°N to 23.5°S
        </div>
      </div>

    </div>
  );
}
