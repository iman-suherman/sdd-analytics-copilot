/** Palet & gaya grafik mengikuti logo (biru → sian → mint), latar terang. */
export const LOGO = {
  blue: "#2463EB",
  sky: "#0EA5E9",
  cyan: "#2DD4BF",
  mint: "#5EEAD4",
  muted: "#5c6570",
  axis: "#8b95a5",
  split: "rgba(28, 36, 33, 0.08)",
  glow: "rgba(36, 99, 235, 0.28)",
} as const;

/** Gradien vertikal untuk batang ECharts (atas mint → bawah biru). */
export function barGradient() {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: LOGO.mint },
      { offset: 0.45, color: LOGO.sky },
      { offset: 1, color: LOGO.blue },
    ],
  };
}

export function areaGradient() {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(45, 212, 191, 0.28)" },
      { offset: 1, color: "rgba(36, 99, 235, 0.02)" },
    ],
  };
}

export function lineGradient() {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: LOGO.blue },
      { offset: 0.5, color: LOGO.sky },
      { offset: 1, color: LOGO.cyan },
    ],
  };
}

export function baseChartOption() {
  return {
    backgroundColor: "transparent",
    textStyle: { color: LOGO.muted, fontFamily: "inherit" },
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: "rgba(36, 99, 235, 0.25)",
      borderWidth: 1,
      textStyle: { color: "#1c2421", fontSize: 12 },
      extraCssText: "border-radius:12px; box-shadow:0 8px 24px rgba(36,99,235,0.12);",
    },
    grid: { left: 52, right: 16, top: 28, bottom: 36 },
  };
}
