import type { WeeklyMetric } from "./scoring";

export const CIRCUMFERENCE = 2 * Math.PI * 46;

export function scoreToOffset(score: number): number {
  const fraction = Math.min(100, Math.max(0, score)) / 100;
  return Math.round(CIRCUMFERENCE * (1 - fraction) * 10) / 10;
}

export function avgLag(metrics: WeeklyMetric[], week: number): number {
  const week_m = metrics.filter((m) => m.weekIndex === week);
  if (!week_m.length) return 0;
  return week_m.reduce((s, m) => s + m.responseLagHours, 0) / week_m.length;
}

export function avgMeetings(metrics: WeeklyMetric[], week: number): number {
  const week_m = metrics.filter((m) => m.weekIndex === week);
  if (!week_m.length) return 0;
  return week_m.reduce((s, m) => s + m.meetingCount, 0) / week_m.length;
}

export function avgMood(metrics: WeeklyMetric[], week: number): number | null {
  const week_m = metrics
    .filter((m) => m.weekIndex === week)
    .map((m) => m.moodScore)
    .filter((s): s is number => s !== null);
  if (!week_m.length) return null;
  return week_m.reduce((a, b) => a + b, 0) / week_m.length;
}

export function moodLabel(mood: number | null): string {
  if (mood === null) return "No data";
  if (mood >= 4.2) return "Positive";
  if (mood >= 3.0) return "Neutral";
  return "Low";
}

export function meetingLabel(avg: number): string {
  if (avg >= 6) return "Optimal";
  if (avg >= 4) return "Moderate";
  return "Low";
}

export function toSparkPoints(values: number[], invert = false): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const norm = (v - min) / range;
      const y = invert ? norm * 26 + 2 : (1 - norm) * 26 + 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function toBarHeights(values: number[]): number[] {
  const max = Math.max(...values) || 1;
  return values.map((v) => v / max);
}

export function eventColor(type: string): string {
  switch (type) {
    case "launch":       return "var(--color-secondary)";
    case "restructure":  return "var(--color-tertiary)";
    case "process_change": return "var(--color-primary)";
    default:             return "var(--color-outline)";
  }
}
