import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function reduceOpacity(hexColor: string, opacityReduction: number) {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate alpha (opacity reduction means we keep the inverse)
  // e.g., 10% reduction = 90% opacity = 0.9
  const alpha = (100 - opacityReduction) / 100;
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type HexColor = `#${string}`;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export function intensifyHex(hex: HexColor, percent: number): HexColor {
  // HEX → RGB (0–1)
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // 🔥 Increase saturation
  s = clamp01(s * (1 + percent / 100));

  // HSL → RGB
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r2: number, g2: number, b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number): string =>
    Math.round(v * 255).toString(16).padStart(2, "0");

  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}` as HexColor;
}

export function darkenHex(hexColor: string, darkenAmount: number = 30): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  // Darken by reducing lightness
  const darkenedL = Math.max(0, l - darkenAmount);
  
  return `hsla(${h}, ${s}%, ${darkenedL}%, 1)`;
}

export function countTextLines(element: HTMLElement | null): number {
  if (!element) return 0;

  const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
  const height = element.offsetHeight;

  // If lineHeight is 'normal', estimate it as 1.2 * fontSize
  if (isNaN(lineHeight)) {
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    return Math.round(height / (fontSize * 1.2));
  }

  return Math.round(height / lineHeight);
}