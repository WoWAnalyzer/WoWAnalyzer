//expects a percentile between 0 - 100 and returns the class to color the text accordingly
export default function rankingColor(percentage) {
  if (percentage < 0.25) {
    return 'parse-grey';
  } else if (percentage < 0.50) {
    return 'parse-green';
  } else if (percentage < 0.75) {
    return 'parse-blue';
  } else if (percentage < 0.95) {
    return 'parse-purple';
  } else if (percentage < 1.00) {
    return 'parse-orange';
  } else if (percentage === 1.00) {
    return 'parse-artifact';
  } else {
    return 'parse-none';
  }
}
