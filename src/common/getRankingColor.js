//expects a percentile between 0 - 100 and returns the class to color the text accordingly
export default function rankingColor(rank) {
  if (rank < 25) {
    return 'parse-grey';
  }
  if (rank < 50) {
    return 'parse-green';
  }
  if (rank < 75) {
    return 'parse-blue';
  }
  if (rank < 95) {
    return 'parse-purple';
  }
  if (rank < 100) {
    return 'parse-orange';
  }
  if (rank === 100) {
    return 'parse-artifact';
  }
  return 'parse-none';
}