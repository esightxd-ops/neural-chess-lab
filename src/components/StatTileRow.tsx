import { StatTile } from "./StatTile";

const spark = (base: number, n = 20) =>
  Array.from({ length: n }, (_, i) =>
    base + Math.round(Math.sin(i / 3) * 12 + (i % 4) * 3 + i * 0.8),
  );

export function StatTileRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      <StatTile
        label="Rapid"
        value="1842"
        delta={24}
        spark={spark(1800)}
        accent="primary"
        sub="peak 1864"
      />
      <StatTile
        label="Blitz"
        value="1756"
        delta={-8}
        spark={spark(1760)}
        accent="blue"
        sub="peak 1812"
      />
      <StatTile
        label="Bullet"
        value="1612"
        delta={12}
        spark={spark(1580)}
        accent="blue"
        sub="peak 1634"
      />
      <StatTile
        label="Daily"
        value="1924"
        delta={3}
        spark={spark(1910)}
        accent="primary"
        sub="peak 1948"
      />
      <StatTile label="Win rate" value="58.4%" sub="1,284 games" accent="primary" />
      <StatTile label="Games played" value="1,284" sub="last 90 days" />
      <StatTile label="Avg opponent" value="1798" sub="±54 elo gap" />
      <StatTile
        label="Current streak"
        value="W12"
        sub="best W18"
        accent="gold"
      />
    </div>
  );
}
