export default function harmonic(values) {
  return values.length / values.reduce((cum, val) => cum + 1/val, 0);
}
