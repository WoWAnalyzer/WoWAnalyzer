export default function getDamageBonus(event, increase) {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return raw - (raw / (1 + increase));
}