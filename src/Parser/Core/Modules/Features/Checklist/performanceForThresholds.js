/**
 *   0 - 33% major This is different from the *minor* threshold which is at 100% instead of 66%. The reason for this is that the minor threshold being at 75% and then 75%-100% being minor - max is that this would suggest going for max is best while this is not always the case. Something like Crusader Strike (with the Crusader's Might talent) has a recommended cast efficiency of 35% *because* you should only cast it enough to benefit you, more than that would be good but not 100% cast efficiency as then you're losing healing.
 * 33% - 66% average
 * 66% - 99% minor
 * 100% good (no issue)
 * @param actual
 * @param minor
 * @param average
 * @param major
 * @returns {number}
 */
function performanceForLessThanThresholds(actual, { minor, average, major }) {
  if (actual < major) {
    // major issue
    return 0.333 * actual / major;
  } else if (actual < average) {
    // average issue (between major and average issue)
    return 0.333 + 0.333 * ((actual - major) / (average - major));
  } else if (actual < minor) {
    // minor issue (between average and minor issue)
    return 0.666 + 0.333 * ((actual - average) / (minor - average));
  } else {
    // no issue
    return 1;
  }
}
function performanceForGreaterThanThresholds(actual, { minor, average, major }) {
  if (actual > major) {
    // major issue
    return 0.333 * major / actual;
  } else if (actual > average) {
    // average issue (between major and average issue)
    return 0.333 + 0.333 * ((actual - average) / (major - average));
  } else if (actual > minor) {
    // minor issue (between average and minor issue)
    return 0.666 + 0.333 * ((actual - minor) / (average - minor));
  } else {
    // no issue
    return 1;
  }
}
export default function performanceForThresholds(thresholds) {
  if (thresholds.isGreaterThan) {
    if (typeof thresholds.isGreaterThan === 'object') {
      return performanceForGreaterThanThresholds(thresholds.actual, thresholds.isGreaterThan);
    } else {
      return thresholds.isGreaterThan / thresholds.actual;
    }
  } else if (thresholds.isLessThan) {
    if (typeof thresholds.isLessThan === 'object') {
      return performanceForLessThanThresholds(thresholds.actual, thresholds.isLessThan);
    } else {
      return thresholds.actual / thresholds.isLessThan;
    }
  } else if (thresholds.is !== undefined) {
    return thresholds.actual !== thresholds.is ? 1 : 0;
  } else {
    throw new Error('Failed to recognize threshold type');
  }
}
