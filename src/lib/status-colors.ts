// Single accent used consistently for "delayed" intensity across the map,
// calendar heatmap, and table badges — keep in sync with --delayed in globals.css.
const DELAYED_RGB = { r: 255, g: 77, b: 61 };
const BASE_RGB = { r: 51, g: 65, b: 85 }; // slate-700-ish neutral floor

export function delayIntensityColor(value: number, min: number, max: number) {
  const t = max === min ? 0.4 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const r = Math.round(BASE_RGB.r + t * (DELAYED_RGB.r - BASE_RGB.r));
  const g = Math.round(BASE_RGB.g + t * (DELAYED_RGB.g - BASE_RGB.g));
  const b = Math.round(BASE_RGB.b + t * (DELAYED_RGB.b - BASE_RGB.b));
  return `rgb(${r},${g},${b})`;
}

export const DELAYED_HEX = "#ff4d3d";
export const BASE_HEX = "#334155";
