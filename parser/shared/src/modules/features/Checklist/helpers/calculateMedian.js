export default function calculateMedian(values) {
  const arr = [...values];
  arr.sort((a, b) => a - b);

  const half = Math.floor(arr.length / 2);

  if (arr.length % 2) {
    return arr[half];
  } else {
    return (arr[half - 1] + arr[half]) / 2.0;
  }
}
