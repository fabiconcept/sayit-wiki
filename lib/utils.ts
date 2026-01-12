import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  format,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfWeek,
  startOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

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

export function updateSearchParam(key: string, value: string) {
  const url = new URL(window.location.toString());

  if (url.searchParams.get(key) === value) {
    return null;
  }
  url.searchParams.set(key, value);

  window.history.pushState({}, "", url.toString());
}

export function removeSearchParam(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);

  window.history.pushState({}, "", url.toString());
}

export function numberShortForm(num: number, decimals: number = 1, long: boolean = false): string {
  num = Number(num);
  if (num < 1000) {
    return num.toString();
  }

  // Because I can 😂😂😂😂😂
  const units = [
    { value: 1e99, symbol: 'Tg', long: 'Tresvigintillion' },
    { value: 1e96, symbol: 'Dv', long: 'Duovigintillion' },
    { value: 1e93, symbol: 'Uv', long: 'Unvigintillion' },
    { value: 1e90, symbol: 'Vg', long: 'Vigintillion' },
    { value: 1e87, symbol: 'Nd', long: 'Novemdecillion' },
    { value: 1e84, symbol: 'Od', long: 'Octodecillion' },
    { value: 1e81, symbol: 'Sd', long: 'Septendecillion' },
    { value: 1e78, symbol: 'Sxd', long: 'Sexdecillion' },
    { value: 1e75, symbol: 'Qid', long: 'Quindecillion' },
    { value: 1e72, symbol: 'Qad', long: 'Quattuordecillion' },
    { value: 1e69, symbol: 'Td', long: 'Tredecillion' },
    { value: 1e66, symbol: 'Dd', long: 'Duodecillion' },
    { value: 1e63, symbol: 'Ud', long: 'Undecillion' },
    { value: 1e60, symbol: 'D', long: 'Decillion' },
    { value: 1e57, symbol: 'N', long: 'Nonillion' },
    { value: 1e54, symbol: 'O', long: 'Octillion' },
    { value: 1e51, symbol: 'Sp', long: 'Septillion' },
    { value: 1e48, symbol: 'Sx', long: 'Sextillion' },
    { value: 1e45, symbol: 'Qi', long: 'Quintillion' },
    { value: 1e42, symbol: 'Qa', long: 'Quadrillion' },
    { value: 1e39, symbol: 'Tn', long: 'Trillion' },
    { value: 1e36, symbol: 'Un', long: 'Undecillion' },
    { value: 1e33, symbol: 'Dc', long: 'Decillion' },
    { value: 1e30, symbol: 'No', long: 'Nonillion' },
    { value: 1e27, symbol: 'Oc', long: 'Octillion' },
    { value: 1e24, symbol: 'Sp', long: 'Septillion' },
    { value: 1e21, symbol: 'Sx', long: 'Sextillion' },
    { value: 1e18, symbol: 'Qi', long: 'Quintillion' },
    { value: 1e15, symbol: 'Q', long: 'Quadrillion' },
    { value: 1e12, symbol: 'T', long: 'Trillion' },
    { value: 1e9, symbol: 'B', long: 'Billion' },
    { value: 1e6, symbol: 'M', long: 'Million' },
    { value: 1e3, symbol: 'K', long: 'Thousand' },
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = num / unit.value;

      // Remove unnecessary decimal places
      const rounded = Math.round(formatted * Math.pow(10, decimals)) / Math.pow(10, decimals);

      // Convert to string and remove trailing zeros
      const str = rounded.toFixed(decimals).replace(/\.?0+$/, '');

      return long ? str + ' ' + unit.long : str + unit.symbol;
    }
  }

  return num.toString();
}

export function formatSocialTime(
  date: Date | string,
  withTime = false
): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const time = withTime ? `, ${format(targetDate, "HH:mm aa")}` : "";

  // Now
  if (differenceInSeconds(now, targetDate) < 60) {
    return "just now";
  }

  // Minutes
  if (differenceInMinutes(now, targetDate) < 60) {
    return `${differenceInMinutes(now, targetDate)}m ago`;
  }

  // Hours
  if (differenceInHours(now, targetDate) < 24) {
    return `${differenceInHours(now, targetDate)}h ago`;
  }

  // Yesterday
  if (isYesterday(targetDate)) {
    return `Yesterday${time}`;
  }

  // This week (Mon, Tue, ...)
  if (isThisWeek(targetDate, { weekStartsOn: 1 })) {
    return `${format(targetDate, "EEE")}${time}`;
  }

  // Last week
  const lastWeekStart = startOfWeek(subWeeks(now, 1), {
    weekStartsOn: 1,
  });
  const thisWeekStart = startOfWeek(now, {
    weekStartsOn: 1,
  });

  if (
    targetDate >= lastWeekStart &&
    targetDate < thisWeekStart
  ) {
    return `Last week${time}`;
  }

  // This month (fallback → days)
  if (isThisMonth(targetDate)) {
    return `${differenceInDays(now, targetDate)}d`;
  }

  // Last month
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const thisMonthStart = startOfMonth(now);

  if (
    targetDate >= lastMonthStart &&
    targetDate < thisMonthStart
  ) {
    return `Last month${time}`;
  }

  // Older
  return format(
    targetDate,
    withTime ? "dd/MM/yyyy HH:mm:ss" : "dd/MM/yyyy"
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      textArea.remove()
      return successful
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

export function luckyPick(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function generateNoteId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `note_${timestamp}_${random}`;
}

interface ColorOptions {
  opacity?: number;      // 0-1, default: 1
  intensity?: number;    // 0-2, default: 1
  brightness?: number;   // -100 to 100, default: 0
}

/**
 * Generates the opposite color on the color wheel (complementary color)
 * @param hex - Hex color code (e.g., "#FF5733" or "FF5733")
 * @param options - Controller object for color adjustments
 * @returns Opposite color in hex or rgba format
 */
export function getOppositeColor(hex: string, options: ColorOptions = {}): string {
  const {
    opacity = 1,
    intensity = 1,
    brightness = 0
  } = options;

  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Convert RGB to HSL
  const rgb = [r / 255, g / 255, b / 255];
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  let h: number;
  let s: number;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rgb[0]:
        h = ((rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0)) / 6;
        break;
      case rgb[1]:
        h = ((rgb[2] - rgb[0]) / d + 2) / 6;
        break;
      case rgb[2]:
        h = ((rgb[0] - rgb[1]) / d + 4) / 6;
        break;
      default:
        h = 0;
        break;
    }
  }

  // Get opposite hue (180 degrees on color wheel)
  h = (h + 0.5) % 1;

  // Apply intensity adjustment to saturation
  s = Math.min(1, Math.max(0, s * intensity));

  // Apply brightness adjustment to lightness
  l = Math.min(1, Math.max(0, l + (brightness / 100)));

  // Convert HSL back to RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const [newR, newG, newB] = hslToRgb(h, s, l);

  // Return format based on opacity
  if (opacity < 1) {
    return `rgba(${newR}, ${newG}, ${newB}, ${opacity})`;
  } else {
    const toHex = (n: number): string => n.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
}
