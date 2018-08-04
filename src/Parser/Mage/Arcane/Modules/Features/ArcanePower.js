import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatMilliseconds } from 'common/format';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import DeathTracker from 'Parser/Core/Modules/DeathTracker';
import Analyzer from 'Parser/Core/Analyzer';
import ArcaneChargeTracker from './ArcaneChargeTracker';

const debug = false;
const MANA_THRESHOLD = 0.40;

const UNACCEPTABLE_ARCANE_POWER_SPELLS = [
	SPELLS.ARCANE_BARRAGE.id,
	SPELLS.ARCANE_FAMILIAR_TALENT.id,
	SPELLS.ARCANE_INTELLECT.id,
	SPELLS.EVOCATION.id,
	SPELLS.SUPERNOVA_TALENT.id,
	SPELLS.MIRROR_IMAGE_TALENT.id,
	SPELLS.NETHER_TEMPEST_TALENT.id,
	SPELLS.ARCANE_ORB_TALENT.id,
	SPELLS.RUNE_OF_POWER_TALENT.id,
];

class ArcanePower extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
		arcaneChargeTracker: ArcaneChargeTracker,
		spellUsable: SpellUsable,
		deathTracker: DeathTracker,
	};

	badUses = 0;
	totalCastsDuringAP = 0;
	badCastsDuringAP = 0;
	runeTimestamp = 0;
	arcanePowerOnKill = false;

	constructor(...args) {
    super(...args);
		 this.hasRuneOfPower = this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
		 this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
  	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_POWER.id && spellId !== SPELLS.RUNE_OF_POWER_TALENT.id && !this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
			return;
		}
		if (spellId === SPELLS.RUNE_OF_POWER_TALENT.id) {
			this.runeTimestamp = event.timestamp;
		} else if (spellId === SPELLS.ARCANE_POWER.id) {
			const currentManaPercent = event.classResources[0].amount / event.classResources[0].max;
			if (this.arcaneChargeTracker.charges < 4 || (this.hasRuneOfPower && event.timestamp - this.runeTimestamp > 200) || (!this.hasOverpowered && currentManaPercent < MANA_THRESHOLD)) {
				debug && console.log("Bad Cast of Arcane Power @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				debug && console.log("Arcane Charges: " + this.arcaneChargeTracker.charges + " @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				debug && this.hasRuneOfPower && console.log("Rune of Power Delay: " + (event.timestamp - this.runeTimestamp) + " @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				debug && !this.hasOverpowered && console.log("Mana Percent: " + currentManaPercent + " @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				this.badUses += 1;
			}
		} else {
			this.totalCastsDuringAP += 1;
			if (UNACCEPTABLE_ARCANE_POWER_SPELLS.includes(spellId)) {
				debug && console.log("Cast " + event.ability.name + " during Arcane Power @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				this.badCastsDuringAP += 1;
			}
		}
	}

	on_finished() {
		if (this.spellUsable.isAvailable(SPELLS.ARCANE_POWER.id) && this.deathTracker.isAlive) {
			this.arcanePowerOnKill = true;
		}
	}

	get cooldownUtilization() {
		return 1 - (this.badUses / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts);
	}

	get castUtilization() {
		return 1 - (this.badCastsDuringAP / this.totalCastsDuringAP);
	}

	get cooldownSuggestionThresholds() {
    return {
      actual: this.cooldownUtilization,
      isLessThan: {
        minor: 1,
        average: 0.80,
        major: 0.60,
      },
      style: 'percentage',
    };
	}
	
	get castSuggestionThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
	}
	
	get arcanePowerOnKillSuggestionThresholds() {
    return {
      actual: this.arcanePowerOnKill,
      isEqual: true,
      style: 'boolean',
    };
  }

	suggestions(when) {
		when(this.cooldownSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.badUses} times without meeting the pre-requisites. Before casting Arcane Power you should ensure that you have 4 Arcane Charges{this.hasOverpowered ? '' : ' and at least 40% mana to avoid going OOM during Arcane Power'}. {this.hasRuneOfPower ? 'Additionally, you should ensure that you have at least 1 charge of Rune of Power, and you should cast it immediately before casting Arcane Power.' : ''}</React.Fragment>)
					.icon(SPELLS.ARCANE_POWER.icon)
					.actual(`${formatPercentage(this.cooldownUtilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
		when(this.castSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast spells other than <SpellLink id={SPELLS.ARCANE_BLAST.id} />,<SpellLink id={SPELLS.ARCANE_MISSILES.id} />, <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />, and <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> during <SpellLink id={SPELLS.ARCANE_POWER.id} />. Arcane Power is a short duration, so you should ensure that you are getting the most use out of it. Buff spells like Rune of Power should be cast immediately before casting Arcane Power. Other spells such as Charged Up, Blink/Shimmer, etc are acceptable during Arcane Power, but should be avoided if possible.</React.Fragment>)
					.icon(SPELLS.ARCANE_POWER.icon)
					.actual(`${formatPercentage(this.castUtilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
		when(this.arcanePowerOnKillSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment><SpellLink id={SPELLS.ARCANE_POWER.id} /> was available to be cast when the boss died. You should ensure that you are casting Arcane Power on cooldown, especially at the end of the fight to get a little bit of last minute damage into the boss.</React.Fragment>)
					.icon(SPELLS.ARCANE_POWER.icon)
					.staticImportance(ISSUE_IMPORTANCE.REGULAR);
			});
	}

	statistic() {
    return (
			<StatisticBox
  icon={<SpellIcon id={SPELLS.ARCANE_POWER.id} />}
  value={(
    <span>
      <SpellIcon
        id={SPELLS.ARCANE_POWER.id}
        style={{
          height: '1.2em',
          marginBottom: '.15em',
        }}
      />
      {' '}{formatPercentage(this.cooldownUtilization, 0)}{' %'}
      <br />
      <SpellIcon
        id={SPELLS.ARCANE_BLAST.id}
        style={{
          height: '1.2em',
          marginBottom: '.15em',
        }}
      />
    	{' '}{formatPercentage(this.castUtilization, 0)}{' %'}
    </span>
  )}
  label="Arcane Power Utilization"
  tooltip={`Before casting Arcane Power, you should ensure that you meet all of the following requirements. If Arcane Power frequently comes off cooldown and these requirements are not already met, then consider modifying your rotation to ensure that they are met before Arcane Power comes off cooldown
		<ul>
			<li>You have 4 Arcane Charges</li>
			${this.hasRuneOfPower ? `<li>You have a charge of Rune of Power (cast this immediately before Arcane Power)</li>` : ''}
			${!this.hasOverpowered ?`<li>You have more than 40% mana (to avoid going OOM during Arcane Power)</li>` : ''}
		</ul>
		
		Additionally, you should only be casting Arcane Blast and Arcane Missiles (If you have a Clearcasting Proc) during Arcane Power to maximize the short cooldown duration.`}
  		/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default ArcanePower;
