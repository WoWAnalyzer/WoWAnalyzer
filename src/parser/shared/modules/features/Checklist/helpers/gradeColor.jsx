export default function gradeColor(percentage) {
  if (percentage >= 0.9) {
    return '#4ec04e';
  } else if (percentage >= 0.8) {
    return '#a6c34c';
  } else if (percentage >= 0.7) {
    return '#ffc84a';
  } else if (percentage >= 0.6) {
    return '#df7102';
  } else {
    return '#ac1f39';
  }
}
