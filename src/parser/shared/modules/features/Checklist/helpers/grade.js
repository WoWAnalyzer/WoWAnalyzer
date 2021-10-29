export default function grade(percentage) {
  if (percentage >= 0.97) {
    return 'A+';
  } else if (percentage >= 0.93) {
    return 'A';
  } else if (percentage >= 0.9) {
    return 'A-';
  } else if (percentage >= 0.87) {
    return 'B+';
  } else if (percentage >= 0.83) {
    return 'B';
  } else if (percentage >= 0.8) {
    return 'B-';
  } else if (percentage >= 0.77) {
    return 'C+';
  } else if (percentage >= 0.73) {
    return 'C';
  } else if (percentage >= 0.7) {
    return 'C-';
  } else if (percentage >= 0.67) {
    return 'D+';
  } else if (percentage >= 0.63) {
    return 'D';
  } else if (percentage >= 0.6) {
    return 'D-';
  } else {
    return 'F';
  }
}
