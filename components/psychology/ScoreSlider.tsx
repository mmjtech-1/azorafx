"use client";

function color(value: number, inverted?: boolean) {
  const score = inverted ? 100 - value : value;
  if (score <= 40) return "#FF4757";
  if (score <= 70) return "#FFA502";
  return "#00D68F";
}

export function ScoreSlider({
  label,
  value,
  onChange,
  lowerBetter,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lowerBetter?: boolean;
}) {
  const active = color(value, lowerBetter);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary">{label}</p>
        <p className="text-xl font-semibold" style={{ color: active }}>
          {value}
        </p>
      </div>
      <input
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-background-tertiary"
        min={0}
        max={100}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(90deg, ${active} 0%, ${active} ${value}%, #141820 ${value}%, #141820 100%)`,
        }}
      />
    </div>
  );
}
