export default getDamageBonus(event, increase){
  return event.amount - (event.amount - 1 / (1 + increase));
}
