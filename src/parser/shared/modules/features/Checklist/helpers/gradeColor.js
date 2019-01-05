export default function gradeColor(percentage) {
  if (percentage >= 0.90) {
    return '#4ec04e';
  } else if (percentage >= 0.80) {
    return '#a6c34c';
  } else if (percentage >= 0.70) {
    return '#ffc84a';
  } else if (percentage >= 0.60) {
    return '#df7102';
  } else {
    return '#ac1f39';
  }
}
