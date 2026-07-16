import { DashboardData, Interaction } from "./types";
import { WeeklyMetric } from "./scoring";

/**
 * Reads from sessionStorage to overlay any synthetic data edits on top of the original seed data.
 */
export function mergeSyntheticData(seedData: DashboardData): DashboardData {
  if (typeof window === "undefined") return seedData; // Only run on client

  const newMetrics = [...seedData.weeklyMetrics];
  let newInteractions = [...seedData.interactions];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;

    if (key.startsWith("synthetic-data-edits:")) {
      const parts = key.split(":");
      if (parts.length === 4) {
        const memberId = parts[2];
        const weekIndex = parseInt(parts[3], 10);
        try {
          const edits = JSON.parse(sessionStorage.getItem(key) || "{}");
          
          const index = newMetrics.findIndex(
            (m) => m.memberId === memberId && m.weekIndex === weekIndex
          );
          if (index !== -1) {
            newMetrics[index] = {
              ...newMetrics[index],
              responseLagHours: edits.responseLagHours ?? newMetrics[index].responseLagHours,
              meetingCount: edits.meetingCount ?? newMetrics[index].meetingCount,
              moodScore: edits.moodScore !== undefined ? edits.moodScore : newMetrics[index].moodScore
            };
          }
        } catch (e) {
          console.error("Failed to parse synthetic edits", e);
        }
      }
    } else if (key.startsWith("synthetic-data-interactions-week:")) {
      const parts = key.split(":");
      if (parts.length === 3) {
        const weekIndex = parseInt(parts[2], 10);
        try {
          const editedInteractions: Interaction[] = JSON.parse(sessionStorage.getItem(key) || "[]");
          
          // Remove all original interactions for this week
          newInteractions = newInteractions.filter(
            (int) => int.weekIndex !== weekIndex
          );

          // Add the edited ones back
          newInteractions.push(...editedInteractions);
        } catch (e) {
          console.error("Failed to parse synthetic interactions", e);
        }
      }
    }
  }

  // Optional: deduplicate interactions (since A-B and B-A might exist if multiple keys overlap)
  // A simple strategy is to sort memberA and memberB, and keep the latest.
  const uniqueInteractions = new Map<string, Interaction>();
  for (const int of newInteractions) {
    const sortedMembers = [int.memberA, int.memberB].sort();
    const uniqueKey = `${int.weekIndex}:${sortedMembers[0]}:${sortedMembers[1]}`;
    uniqueInteractions.set(uniqueKey, int);
  }

  return {
    ...seedData,
    weeklyMetrics: newMetrics,
    interactions: Array.from(uniqueInteractions.values())
  };
}
