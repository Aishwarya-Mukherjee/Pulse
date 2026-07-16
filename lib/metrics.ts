import type { WeeklyMetric } from "./scoring";
import type { Interaction, Member } from "./types";
import type { InsightTone } from "@/app/contexts/ConfigContext";

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

/**
 * Compares individual metrics against team baseline rather than surfacing raw individual trend data, to avoid framing this as individual surveillance.
 */
export function generateMemberInsight(
  memberId: string,
  currentWeek: number,
  metrics: WeeklyMetric[],
  interactions: Interaction[],
  members: Member[],
  tone: InsightTone = "Supportive"
): { text: string; highlight: string } {
  if (currentWeek === 0) {
    return { text: "Not enough history yet to show a trend for this week.", highlight: "Not enough history" };
  }

  const teamMetrics = metrics.filter(m => m.weekIndex === currentWeek);
  if (teamMetrics.length === 0) {
    return { text: "Not enough history yet to show a trend for this week.", highlight: "Not enough history" };
  }

  const teamAvgLag = teamMetrics.reduce((s, m) => s + m.responseLagHours, 0) / teamMetrics.length;
  const memberMetric = teamMetrics.find(m => m.memberId === memberId);
  if (!memberMetric) {
    return { text: "Not enough history yet to show a trend for this week.", highlight: "Not enough history" };
  }
  const memberLag = memberMetric.responseLagHours;

  const weekInteractions = interactions.filter(i => i.weekIndex === currentWeek);
  const podMap = new Map(members.map(m => [m.memberId, m.pod]));
  
  let totalTeamCrossPod = 0;
  for (const interaction of weekInteractions) {
    if (podMap.get(interaction.memberA) !== podMap.get(interaction.memberB)) {
      totalTeamCrossPod += interaction.interactionStrength;
    }
  }
  // Average cross-pod interaction strength per team member. 
  // Since each cross-pod interaction edge touches two people, it contributes its weight to BOTH members' 
  // personal cross-pod totals. Therefore, the total sum of personal cross-pod weights across the team 
  // is totalTeamCrossPod * 2, which we then divide by the number of team members.
  const teamAvgCrossPod = (totalTeamCrossPod * 2) / members.length;

  let memberCrossPod = 0;
  for (const interaction of weekInteractions) {
    if (interaction.memberA === memberId || interaction.memberB === memberId) {
      if (podMap.get(interaction.memberA) !== podMap.get(interaction.memberB)) {
        memberCrossPod += interaction.interactionStrength;
      }
    }
  }

  const isCapacityBelowBaseline = memberLag > teamAvgLag * 1.05;
  const isCrossPodBelowBaseline = memberCrossPod < teamAvgCrossPod * 0.95;

  let text = "";
  let highlight = "";

  if (tone === "Supportive") {
    let capacityStr = "Aggregated signals suggest steady capacity.";
    if (isCapacityBelowBaseline) {
      const severity = memberLag > teamAvgLag * 1.3 ? "well above" : memberLag > teamAvgLag * 1.15 ? "noticeably higher than" : "slightly higher than";
      capacityStr = `Response times are trending ${severity} the team average, indicating potential capacity constraints.`;
    }

    let crossPodStr = "Cross-functional interactions remain strong.";
    let crossPodSeverity = "";
    if (isCrossPodBelowBaseline) {
      crossPodSeverity = memberCrossPod < teamAvgCrossPod * 0.7 ? "well below" : memberCrossPod < teamAvgCrossPod * 0.85 ? "noticeably below" : "slightly below";
      crossPodStr = `Interaction with cross-functional pods is ${crossPodSeverity} baseline.`;
    }

    text = `${capacityStr} ${crossPodStr}`;

    if (!isCapacityBelowBaseline && !isCrossPodBelowBaseline) {
      highlight = "steady capacity";
    } else if (isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = "potential capacity constraints";
    } else if (!isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = `${crossPodSeverity} baseline`;
    } else {
      highlight = "potential capacity constraints";
    }
  } else if (tone === "Direct") {
    let capacityStr = "Capacity is steady.";
    if (isCapacityBelowBaseline) {
      capacityStr = "Response lag is above average. Consider checking in this week.";
    }

    let crossPodStr = "Cross-pod engagement is solid.";
    if (isCrossPodBelowBaseline) {
      crossPodStr = "Cross-pod engagement is low. Encourage broader collaboration.";
    }

    text = `${capacityStr} ${crossPodStr}`;

    if (!isCapacityBelowBaseline && !isCrossPodBelowBaseline) {
      highlight = "Capacity is steady.";
    } else if (isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = "Response lag is above average.";
    } else if (!isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = "Cross-pod engagement is low.";
    } else {
      highlight = "Response lag is above average.";
    }
  } else if (tone === "Analytical") {
    const lagDiff = ((memberLag - teamAvgLag) / teamAvgLag * 100).toFixed(0);
    const lagStr = isCapacityBelowBaseline
      ? `${memberLag.toFixed(1)} hrs vs ${teamAvgLag.toFixed(1)} hr team avg (+${lagDiff}%).`
      : `Response times within normal team variance.`;

    let cpStr = "";
    let cpHighlight = "";

    if (memberCrossPod === 0) {
      let maxPrior = 0;
      for (const i of interactions) {
        if (i.weekIndex < currentWeek && (i.memberA === memberId || i.memberB === memberId)) {
          if (i.interactionStrength > maxPrior) {
            maxPrior = i.interactionStrength;
          }
        }
      }

      if (maxPrior > 0) {
        cpStr = `Cross-pod engagement has declined from ${maxPrior.toFixed(2)} to 0 over the observed period — full disengagement from prior external ties.`;
        cpHighlight = "full disengagement";
      } else {
        cpStr = `Cross-functional interactions 100% below baseline.`;
        cpHighlight = "100% below baseline";
      }
    } else {
      const cpDiff = ((teamAvgCrossPod - memberCrossPod) / teamAvgCrossPod * 100).toFixed(0);
      cpStr = isCrossPodBelowBaseline
        ? `Cross-functional interactions ${cpDiff}% below baseline.`
        : `Cross-functional interaction baseline maintained.`;
      cpHighlight = `${cpDiff}% below baseline`;
    }

    text = `${lagStr} ${cpStr}`;

    if (!isCapacityBelowBaseline && !isCrossPodBelowBaseline) {
      highlight = "normal team variance";
    } else if (isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = `+${lagDiff}%`;
    } else if (!isCapacityBelowBaseline && isCrossPodBelowBaseline) {
      highlight = cpHighlight;
    } else {
      highlight = `+${lagDiff}%`;
    }
  }

  return { text, highlight };
}
