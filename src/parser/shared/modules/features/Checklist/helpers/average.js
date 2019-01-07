export default function average(values) {
  return values.reduce((c, p) => c + p, 0) / values.length;
}
