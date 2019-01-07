export default function grade(percentage) {
  if (percentage >= 0.97) {
    return 'A+';
  } else if (percentage >= 0.93) {
    return 'A';
  } else if (percentage >= 0.90) {
    return 'A-';
  } else if (percentage >= 0.87) {
    return 'B+';
  } else if (percentage >= 0.83) {
    return 'B';
  } else if (percentage >= 0.80) {
    return 'B-';
  } else if (percentage >= 0.77) {
    return 'C+';
  } else if (percentage >= 0.73) {
    return 'C';
  } else if (percentage >= 0.70) {
    return 'C-';
  } else if (percentage >= 0.67) {
    return 'D+';
  } else if (percentage >= 0.63) {
    return 'D';
  } else if (percentage >= 0.60) {
    return 'D-';
  } else {
    return 'F';
  }
}
