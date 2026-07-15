/**
 * lib/scoring.ts
 *
 * Pure, deterministic Team Health Score computation.
 *
 * This module takes the raw seed data and a weekIndex and produces a 0–100
 * composite score. No AI, no randomness, no side-effects — safe to unit-test
 * in isolation and safe to call from both server and client components.
 *
 * === PRD Section 5 Weighting Approach ===
 *
 * Each of the three signals is individually normalised to [0, 1] (1 = perfect
 * health) and then combined into a weighted average that is scaled to 0–100.
 *
 * Signal                | Weight  | Direction
 * ----------------------|---------|------------------------------------------
 * Response Lag (hrs)    | 40 %    | Lower is better  — inverted before mixing
 * Meeting Count (count) | 35 %    | Higher (up to cap) is better
 * Mood Score (1–5)      | 25 %    | Higher is better; null entries are skipped
 *
 * Weights are exported as named constants so they can be surfaced in the UI
 * and explained to judges in a live demo without touching source code.
 */

// ---------------------------------------------------------------------------
// Types — mirror the exact shape of /data/team-pulse-seed.json
// ---------------------------------------------------------------------------

export interface WeeklyMetric {
  memberId: string;
  weekIndex: number;
  /** Average hours between a message/task update and the next reply. */
  responseLagHours: number;
  /** Number of meetings/1:1s attended this week. */
  meetingCount: number;
  /**
   * Optional self-reported mood (1–5 scale).
   * null means the member skipped check-in this week.
   */
  moodScore: number | null;
}

export interface MemberScore {
  memberId: string;
  /** Normalised response-lag score: 0 (worst) → 1 (best). */
  lagScore: number;
  /** Normalised meeting-frequency score: 0 (worst) → 1 (best). */
  meetingScore: number;
  /**
   * Normalised mood score: 0 (worst) → 1 (best).
   * null when the member had no mood data for this week.
   */
  moodScore: number | null;
  /** Weighted composite for this member, 0–100. */
  compositeScore: number;
}

export interface TeamHealthResult {
  weekIndex: number;
  /** Per-member breakdown, useful for sparklines and detail cards. */
  memberScores: MemberScore[];
  /** Team-level aggregate, 0–100. This is the headline number. */
  teamScore: number;
}

// ---------------------------------------------------------------------------
// Configurable scoring constants
// ---------------------------------------------------------------------------

/**
 * Signal weights — must sum to 1.0.
 * Adjust these to reprioritise signals without touching scoring logic.
 */
export const WEIGHTS = {
  /** Response lag contributes 40 % of the composite score. */
  responseLag: 0.4,
  /** Meeting frequency contributes 35 %. */
  meetingCount: 0.35,
  /** Mood check-in contributes 25 % (when available). */
  moodScore: 0.25,
} as const;

/**
 * Normalisation bounds for response lag (hours).
 *
 * LAG_GOOD  — at or below this value the member scores 1.0.
 * LAG_BAD   — at or above this value the member scores 0.0.
 * Values in between are linearly interpolated.
 *
 * Derivation: schema says healthy baseline is 1–3 hrs; burnout arc goes to
 * ~8.5 hrs, so 9 hrs gives a clean upper bound with a tiny margin.
 */
export const LAG_BOUNDS = {
  good: 1.0,  // ≤1 hr → perfect
  bad:  9.0,  // ≥9 hrs → worst possible
} as const;

/**
 * Normalisation bounds for meeting count (per week).
 *
 * MEETING_GOOD — at or above this count the member scores 1.0.
 * MEETING_BAD  — at or below this count the member scores 0.0.
 * Schema says healthy baseline is 4–8; burnout arc bottoms at 1.
 */
export const MEETING_BOUNDS = {
  bad:  0,  // 0 meetings → worst
  good: 7,  // ≥7 meetings → best
} as const;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Linear interpolation — clamps the result to [0, 1].
 *
 * @param value - The raw signal value.
 * @param low   - Value that maps to 0.
 * @param high  - Value that maps to 1.
 */
function linearNorm(value: number, low: number, high: number): number {
  if (high === low) return 0;
  const norm = (value - low) / (high - low);
  return Math.min(1, Math.max(0, norm));
}

/**
 * Compute the normalised response-lag score for one member-week.
 * High lag → low score (inverted scale).
 *
 * @returns [0, 1] where 1 = fastest possible response.
 */
function normaliseLag(responseLagHours: number): number {
  // Invert: we want low lag → high score.
  // 1 hr → norm(1, 9, 1) = 1.0; 9 hrs → norm(9, 9, 1) = 0.0
  return linearNorm(responseLagHours, LAG_BOUNDS.bad, LAG_BOUNDS.good);
}

/**
 * Compute the normalised meeting-frequency score for one member-week.
 *
 * @returns [0, 1] where 1 = maximally engaged in meetings.
 */
function normaliseMeetings(meetingCount: number): number {
  return linearNorm(meetingCount, MEETING_BOUNDS.bad, MEETING_BOUNDS.good);
}

/**
 * Compute the normalised mood score for one member-week.
 *
 * @returns [0, 1] or null if no check-in was recorded.
 */
function normaliseMood(moodScore: number | null): number | null {
  if (moodScore === null) return null;
  // Scale from [1, 5] → [0, 1]
  return linearNorm(moodScore, 1, 5);
}

/**
 * Compute the weighted composite score for one member-week in [0, 1].
 *
 * When moodScore is null the mood weight is redistributed proportionally
 * across the other two signals so the total always stays at 1.0.
 */
function computeMemberComposite(
  lagNorm: number,
  meetingNorm: number,
  moodNorm: number | null
): number {
  if (moodNorm === null) {
    // Redistribute mood weight proportionally across the remaining signals.
    const totalOtherWeight = WEIGHTS.responseLag + WEIGHTS.meetingCount;
    const lagWeight     = WEIGHTS.responseLag  / totalOtherWeight;
    const meetingWeight = WEIGHTS.meetingCount / totalOtherWeight;
    return lagNorm * lagWeight + meetingNorm * meetingWeight;
  }

  return (
    lagNorm     * WEIGHTS.responseLag  +
    meetingNorm * WEIGHTS.meetingCount +
    moodNorm    * WEIGHTS.moodScore
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the Team Health Score for a given week.
 *
 * Accepts only the entries needed for the requested week — the caller is
 * responsible for passing the full dataset; this function filters internally.
 * This keeps the function pure and easy to unit-test with small fixtures.
 *
 * @param allMetrics - All weeklyMetrics entries from the seed file.
 * @param weekIndex  - The week to compute for (0–5).
 * @returns          A {@link TeamHealthResult} with per-member breakdown and
 *                   the team-level headline score.
 *
 * @example
 * ```ts
 * import seed from "@/data/team-pulse-seed.json";
 * import { computeTeamHealthScore } from "@/lib/scoring";
 *
 * const result = computeTeamHealthScore(seed.weeklyMetrics, 5);
 * console.log(result.teamScore);   // e.g. 72
 * console.log(result.memberScores.find(m => m.memberId === "dev-04"));
 * ```
 */
export function computeTeamHealthScore(
  allMetrics: WeeklyMetric[],
  weekIndex: number
): TeamHealthResult {
  // 1. Filter to the requested week.
  const weekMetrics = allMetrics.filter((m) => m.weekIndex === weekIndex);

  if (weekMetrics.length === 0) {
    return { weekIndex, memberScores: [], teamScore: 0 };
  }

  // 2. Score each member.
  const memberScores: MemberScore[] = weekMetrics.map((m) => {
    const lagScore     = normaliseLag(m.responseLagHours);
    const meetingScore = normaliseMeetings(m.meetingCount);
    const moodNorm     = normaliseMood(m.moodScore);

    const raw          = computeMemberComposite(lagScore, meetingScore, moodNorm);
    // Scale to 0–100 and round to one decimal place.
    const compositeScore = Math.round(raw * 1000) / 10;

    return {
      memberId:      m.memberId,
      lagScore,
      meetingScore,
      moodScore:     moodNorm,
      compositeScore,
    };
  });

  // 3. Team score = simple average of all member composites.
  //    (Each member is weighted equally at the team level; within a member the
  //    three signals are weighted per WEIGHTS above.)
  const sum      = memberScores.reduce((acc, s) => acc + s.compositeScore, 0);
  const teamScore = Math.round((sum / memberScores.length) * 10) / 10;

  return { weekIndex, memberScores, teamScore };
}

// ---------------------------------------------------------------------------
// Convenience helpers (useful for sparklines and trend arrows)
// ---------------------------------------------------------------------------

/**
 * Compute health scores for every week in the dataset and return them as an
 * array ordered by weekIndex. Useful for rendering sparklines.
 *
 * @param allMetrics - Full weeklyMetrics array from the seed file.
 * @param weekCount  - Total number of weeks in the dataset (default 6).
 */
export function computeAllWeekScores(
  allMetrics: WeeklyMetric[],
  weekCount = 6
): TeamHealthResult[] {
  return Array.from({ length: weekCount }, (_, i) =>
    computeTeamHealthScore(allMetrics, i)
  );
}

/**
 * Compute the score delta between two consecutive weeks.
 * Positive = improving, negative = declining.
 *
 * @param allMetrics   - Full weeklyMetrics array.
 * @param weekIndex    - The "current" week to compare against its predecessor.
 * @returns            The numeric delta, or null if there is no previous week.
 */
export function computeWeekDelta(
  allMetrics: WeeklyMetric[],
  weekIndex: number
): number | null {
  if (weekIndex === 0) return null;
  const current  = computeTeamHealthScore(allMetrics, weekIndex);
  const previous = computeTeamHealthScore(allMetrics, weekIndex - 1);
  return Math.round((current.teamScore - previous.teamScore) * 10) / 10;
}
