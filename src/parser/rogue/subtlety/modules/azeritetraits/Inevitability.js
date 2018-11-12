import React from 'react';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';

import Analyzer from 'parser/core/Analyzer';

const SYMBOLS_BASE_DURATION = 10 * 1000;
const INEVITABILITY_DURATION_INCREASE = 0.5 * 1000;

/**
 * Backstab and Shadowstrike deal an additional X damage and extend the duration of your Symbols of Death by 0.5 sec.
 */
class Inevitability extends Analyzer {

	/**
	 * Timestamp of the most recent Symbols of Death cast.
	 */
	lastSymbolsCastTime = 0;

	/**
	 * The duration by which the most recent Symbols of Death was extended in milliseconds.
	 */
	lastSymbolsExtension = 0;

	/**
	 * The duration by which Symbols of Death was extended in milliseconds.
	 */
	symbolsExtendedDuration = 0;

	/**
	 * The damage dealt during Symbols of Death's extended duration.
	 */
	symbolsExtendedDamage = 0;

  constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.hasTrait(SPELLS.INEVITABILITY.id);
  }

  on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		
		if (spellId === SPELLS.SYMBOLS_OF_DEATH.id) {
			this.lastSymbolsCastTime = event.timestamp;
			this.lastSymbolsExtension = 0;
		} else if ((spellId === SPELLS.BACKSTAB.id || spellId === SPELLS.SHADOWSTRIKE.id) && this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id)) {
			this.symbolsExtendedDuration += INEVITABILITY_DURATION_INCREASE;
			this.lastSymbolsExtension += INEVITABILITY_DURATION_INCREASE;
		}
	}

	on_byPlayer_damage(event) {
		// Total damage during Symbols of Death, after the base duration has passed.
		if (!this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id) || event.timestamp <= this.lastSymbolsCastTime + SYMBOLS_BASE_DURATION) {
			return;
		}

		this.symbolsExtendedDamage += event.amount + event.absorbed;
	}

	on_finished(event) {
		// If Symbols of Death is active at the end of the fight, reduce the extended duration by the amount extended past the end of the fight.
		const lastSymbolsEndTimestamp = this.lastSymbolsCastTime + SYMBOLS_BASE_DURATION + this.lastSymbolsExtension;
		if(lastSymbolsEndTimestamp > event.timestamp) {
			// Limit the adjustment to the extended amount.
			const extensionAdjustment = Math.min(lastSymbolsEndTimestamp - event.timestamp, this.lastSymbolsExtension);
			this.symbolsExtendedDuration -= extensionAdjustment;
		}
	}

	/**
	 * Returns Symbols of Death uptime in milliseconds.
	 * @returns {number}
	 */
	get symbolsUptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) / this.owner.fightDuration;
	}

	/**
	 * Returns the extended duration of Symbols of Death as a percentage of the base duration.
	 * @returns {number}
	 */
	get symbolsExtendedPercent() {
		const symbolsBaseDuration = this.selectedCombatant.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) - this.symbolsExtendedDuration;

		return this.symbolsExtendedDuration / symbolsBaseDuration;
	}

	/**
	 * Returns the damage dealt during the extended Symbols of Death as a percentage of total damage dealt.
	 * @returns {number}
	 */
	get symbolsExtendedDamagePercent() {
		return this.owner.getPercentageOfTotalDamageDone(this.symbolsExtendedDamage);
	}
	
	/**
	 * Returns the damage dealt during the extended Symbols of Death divided by the fight duration.
	 * @returns {number}
	 */
	get symbolsExtendedDps() {
		return this.symbolsExtendedDamage / this.owner.fightDuration * 1000;
	}

	statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.INEVITABILITY.id}
        value={`${formatPercentage(this.symbolsExtendedDamagePercent)} % / ${formatNumber(this.symbolsExtendedDps)} DPS`}
        tooltip={`Symbols of Death was extended by <b>${(this.symbolsExtendedDuration / 1000).toFixed(1)} seconds</b>, increasing Symbols of Death's uptime by <b>${formatPercentage(this.symbolsExtendedPercent)}%</b>.`}
      />
    );
  }
}

export default Inevitability;
