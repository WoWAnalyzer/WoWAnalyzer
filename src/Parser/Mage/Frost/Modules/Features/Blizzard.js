import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import bosses from 'common/bosses';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

const AOE_FIGHTS = [
	bosses.TombOfSargeras.HARJATAN,
	bosses.TombOfSargeras.THE_DESOLATE_HOST,
	bosses.TombOfSargeras.MISTRESS_SASSZINE,
	bosses.TombOfSargeras.KILJAEDEN,
	bosses.TheNighthold.SKORPYRON,
	bosses.TheNighthold.SPELLBLADE_ALURIEL,
	bosses.TheNighthold.TICHONDRIUS,
	bosses.TheNighthold.KROSUS,
	bosses.TheNighthold.HIGH_BOTANIST_TELARN,
	bosses.TheNighthold.STAR_AUGUR_ETRAEUS,
	bosses.TheNighthold.GULDAN,
	bosses.TrialOfValor.HELYA,
	bosses.EmeraldNightmare.ELERETHE_RENFERAL,
	bosses.EmeraldNightmare.ILGYNOTH_THE_HEART_OF_CORRUPTION,
	bosses.EmeraldNightmare.CENARIUS,
	bosses.EmeraldNightmare.XAVIUS,
];

class Blizzard extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	}

	on_initialized() {
		this.active = (AOE_FIGHTS.includes(this.owner.fight.boss) || (this.owner.fight.boss === bosses.TombOfSargeras.DEMONIC_INQUISITION && this.owner.fight.difficulty === 5));
	}

	suggestions(when) {
		const blizzardCasts = this.abilityTracker.getAbility(SPELLS.BLIZZARD.id).casts || 0;
		when(blizzardCasts).isLessThan(1)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You did not cast <SpellLink id={SPELLS.BLIZZARD.id} /> during this fight. Because this is an AoE Fight, you should be casting Blizzard whenever there are 2 or more targets standing near eachother. This is primarily because in addition to doing some AoE Damage, Blizzard also reduces the cooldown on <SpellLink id={SPELLS.FROZEN_ORB.id} /> by 0.5 seconds every time Blizzard deals damage.</span>)
					.icon(SPELLS.BLIZZARD.icon)
					.major(1);
			});
	}
}

export default Blizzard;
