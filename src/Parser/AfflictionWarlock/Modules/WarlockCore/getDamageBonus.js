export default function getDamageBonus(event, increase) {
  return event.amount - (event.amount / (1 + increase));
}
