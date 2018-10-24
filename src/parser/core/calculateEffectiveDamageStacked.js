export default function calculateEffectiveDamageStacked(event, increase, stacks) {
	const raw = (event.amount || 0) + (event.absorbed || 0);
	const relativeDamageIncreaseFactor = 1 + (increase * stacks);
	const totalIncrease = raw - raw / relativeDamageIncreaseFactor;
	const oneStackIncrease = totalIncrease / stacks;

	return Math.max(0, oneStackIncrease);
}