import { QualitativePerformance } from './QualitativePerformance';

/**
 * A single breakpoint defining what score a raw value maps to.
 * Breakpoints must be provided sorted ascending by `value`.
 *
 * Supports both "lower is better" and "higher is better" by varying the
 * direction of `score` values across breakpoints.
 *
 * Example — "lower is better" (e.g. resource waste):
 *   [{ value: 0, score: 1.0 }, { value: 5, score: 0.75 }, { value: 25, score: 0.0 }]
 *
 * Example — "higher is better" (e.g. uptime):
 *   [{ value: 0.0, score: 0.0 }, { value: 0.75, score: 0.75 }, { value: 1.0, score: 1.0 }]
 */
export interface ScoreBreakpoint {
  value: number;
  score: number;
}

/**
 * A single scored check with a relative importance weighting and optional score floor.
 *
 * `score` should be in [0.0, 1.0].
 * `weight` is a relative importance factor — only the ratio between weights matters.
 * `minScore` (optional, 0.0–1.0) floors the effective score this check contributes.
 *   Without it, a score of 0.0 contributes 0.0 to the weighted average.
 *   With minScore=0.7, even a score of 0.0 contributes at least 0.7.
 *   This allows secondary checks to influence the result without dominating it.
 */
export interface ScoredCheck {
  score: number;
  weight: number;
  minScore?: number;
}

/**
 * Configurable thresholds for mapping a continuous score to a QualitativePerformance rating.
 * Each threshold is the minimum score required for that rating.
 * Defaults: perfect ≥ 0.95, good ≥ 0.75, ok ≥ 0.5, fail < 0.5.
 */
export interface PerformanceScoreThresholds {
  perfect?: number;
  good?: number;
  ok?: number;
}

const DEFAULT_THRESHOLDS: Required<PerformanceScoreThresholds> = {
  perfect: 0.95,
  good: 0.75,
  ok: 0.5,
};

/**
 * A function that maps a raw value to a score in [0.0, 1.0].
 * The function is responsible for its own clamping — the output will be
 * clamped to [0, 1] by `computeScore`.
 *
 * Example — exponential decay for resource waste:
 *   `(waste) => Math.exp(-waste / 10)`
 *
 * Example — logarithmic scaling for uptime percentage:
 *   `(uptime) => Math.min(1, Math.log(1 + uptime * 9) / Math.log(10))`
 */
export type ScoreFunction = (actual: number) => number;

/**
 * A scoring strategy: either an array of breakpoints for linear interpolation,
 * or a custom function for arbitrary mappings (exponential, logarithmic, etc.).
 */
export type ScoringStrategy = ScoreBreakpoint[] | ScoreFunction;

/**
 * Maps a raw value to a continuous score in [0.0, 1.0] using the provided strategy.
 *
 * - If `strategy` is a `ScoreBreakpoint[]`, uses linear interpolation (via `scoreFromBreakpoints`).
 * - If `strategy` is a function, calls it directly and clamps the result to [0, 1].
 */
export function computeScore(actual: number, strategy: ScoringStrategy): number {
  if (typeof strategy === 'function') {
    return Math.max(0, Math.min(1, strategy(actual)));
  }
  return scoreFromBreakpoints(actual, strategy);
}

/**
 * Maps a raw value to a continuous score in [0.0, 1.0] using linear interpolation
 * between the provided breakpoints.
 *
 * Breakpoints must be sorted ascending by `value`. Values outside the breakpoint
 * range are clamped to the nearest boundary's score.
 */
export function scoreFromBreakpoints(actual: number, breakpoints: ScoreBreakpoint[]): number {
  if (breakpoints.length === 0) {
    throw new Error('scoreFromBreakpoints: breakpoints array must not be empty');
  }
  if (breakpoints.length === 1) {
    throw new Error(
      'scoreFromBreakpoints: at least two breakpoints are required for interpolation',
    );
  }

  // Clamp below first breakpoint
  if (actual <= breakpoints[0].value) {
    return Math.max(0, Math.min(1, breakpoints[0].score));
  }

  // Clamp above last breakpoint
  const last = breakpoints[breakpoints.length - 1];
  if (actual >= last.value) {
    return Math.max(0, Math.min(1, last.score));
  }

  // Linear interpolation between the two surrounding breakpoints
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const lower = breakpoints[i];
    const upper = breakpoints[i + 1];
    if (actual >= lower.value && actual <= upper.value) {
      const range = upper.value - lower.value;
      if (range === 0) {
        throw new Error(
          `scoreFromBreakpoints: adjacent breakpoints at index ${i} and ${i + 1} have the same value (${lower.value})`,
        );
      }
      const t = (actual - lower.value) / range;
      const interpolated = lower.score + t * (upper.score - lower.score);
      return Math.max(0, Math.min(1, interpolated));
    }
  }

  return Math.max(0, Math.min(1, last.score));
}

/**
 * Computes a weighted average score from an array of checks, with optional per-check
 * score floor via `minScore`.
 *
 * Each check's effective score is `max(score, minScore ?? 0)`. The final score is:
 *
 *   `Σ(effectiveScore × weight) / Σ(weight)`
 *
 * When no check has `minScore`, this is a standard weighted average of the scores.
 *
 * Returns a value in [0.0, 1.0]. Returns 0 if the array is empty or total weight is zero.
 */
export function getAggregatedScore(checks: ScoredCheck[]): number {
  if (checks.length === 0) {
    return 0;
  }
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  let weightedScoreSum = 0;
  for (const check of checks) {
    const score = Math.max(0, Math.min(1, check.score));
    const effectiveScore =
      check.minScore !== undefined
        ? Math.max(score, Math.max(0, Math.min(1, check.minScore)))
        : score;
    weightedScoreSum += effectiveScore * check.weight;
  }

  return Math.max(0, Math.min(1, weightedScoreSum / totalWeight));
}

/**
 * Maps a 0.0–1.0 score to a QualitativePerformance rating using configurable thresholds.
 * Falls back to per-field defaults if not specified:
 */
export function scoreToQualitativePerformance(
  score: number,
  thresholds?: PerformanceScoreThresholds,
): QualitativePerformance {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  if (score >= t.perfect) {
    return QualitativePerformance.Perfect;
  }
  if (score >= t.good) {
    return QualitativePerformance.Good;
  }
  if (score >= t.ok) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}
