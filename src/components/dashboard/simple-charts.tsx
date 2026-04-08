"use client";

import { useMemo } from "react";

type Point = { label: string; value: number };

const palette = ["#34d399", "#14b8a6", "#60a5fa", "#f59e0b", "#f43f5e", "#a78bfa"];

export function BarMiniChart({ data, height = 180 }: { data: Point[]; height?: number }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
      <h3 className="mb-3 text-sm font-semibold text-emerald-100">Bar Chart</h3>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => {
          const h = Math.max(8, Math.round((item.value / max) * (height - 30)));
          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-[10px] text-emerald-100/60">{item.value}</div>
              <div
                className="w-full rounded-t-md"
                style={{ height: h, background: palette[index % palette.length] }}
                title={`${item.label}: ${item.value}`}
              />
              <div className="line-clamp-1 text-[10px] text-emerald-100/60">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LineMiniChart({ data }: { data: Point[] }) {
  const { points, width, height } = useMemo(() => {
    const width = 420;
    const height = 180;
    const max = Math.max(...data.map((item) => item.value), 1);
    const gap = data.length > 1 ? width / (data.length - 1) : width;

    const points = data
      .map((item, index) => {
        const x = index * gap;
        const y = height - (item.value / max) * (height - 16) - 8;
        return `${x},${y}`;
      })
      .join(" ");

    return { points, width, height };
  }, [data]);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
      <h3 className="mb-3 text-sm font-semibold text-emerald-100">Line Chart</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
        <polyline
          points={points}
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-1 grid grid-cols-6 gap-2 text-[10px] text-emerald-100/60">
        {data.map((item) => (
          <span key={item.label} className="truncate" title={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PieMiniChart({ data }: { data: Point[] }) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  const slices = data.reduce<
    Array<{ d: string; color: string; label: string; value: number }>
  >((acc, item, index) => {
    const previousTotal = acc.reduce((sum, slice) => sum + slice.value, 0);
    const from = previousTotal / total;
    const to = (previousTotal + item.value) / total;

    const largeArc = to - from > 0.5 ? 1 : 0;
    const sx = 50 + 42 * Math.cos(2 * Math.PI * from - Math.PI / 2);
    const sy = 50 + 42 * Math.sin(2 * Math.PI * from - Math.PI / 2);
    const ex = 50 + 42 * Math.cos(2 * Math.PI * to - Math.PI / 2);
    const ey = 50 + 42 * Math.sin(2 * Math.PI * to - Math.PI / 2);

    acc.push({
      d: `M 50 50 L ${sx} ${sy} A 42 42 0 ${largeArc} 1 ${ex} ${ey} Z`,
      color: palette[index % palette.length],
      label: item.label,
      value: item.value,
    });

    return acc;
  }, []);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
      <h3 className="mb-3 text-sm font-semibold text-emerald-100">Pie Chart</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr] md:items-center">
        <svg viewBox="0 0 100 100" className="mx-auto h-36 w-36">
          {slices.map((slice) => (
            <path key={slice.label} d={slice.d} fill={slice.color} />
          ))}
        </svg>
        <div className="space-y-2 text-xs">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between text-emerald-100/75">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.label}
              </span>
              <span className="font-mono">{slice.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
