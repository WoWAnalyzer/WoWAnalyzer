import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

class AstralPowerBreakdown extends ResourceBreakdown {

  prepareSpent(spendersObj) {
		return Object.keys(spendersObj)
			.map(abilityId => ({
				abilityId: Number(abilityId),
				spent: spendersObj[abilityId].spent / 10,
				casts: spendersObj[abilityId].casts,
			}))
			.sort((a,b) => b.spent - a.spent)
			.filter(ability => ability.spent > 0);
  }
}

export default AstralPowerBreakdown;
