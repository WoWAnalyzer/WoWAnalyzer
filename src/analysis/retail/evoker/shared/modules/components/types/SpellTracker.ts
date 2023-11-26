/**
 * Represents a data point for tracking spells, including timestamp, count,
 * and an optional tooltip.
 */
type SpellTracker = {
  /** Timestamp the event occured */
  timestamp: number;
  /** y-axis value */
  count: number;
  /** Optional tooltip, used for points */
  tooltip?: string;
};

export default SpellTracker;
