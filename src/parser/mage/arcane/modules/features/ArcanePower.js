import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import Analyzer from 'parser/core/Analyzer';
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
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
  };

  badUses = 0;
  totalCastsDuringAP = 0;
  badCastsDuringAP = 0;
  runeTimestamp = 0;
  outOfMana = 0;
  buffEndTimestamp = 0;
  arcanePowerOnKill = false;
  arcanePowerCasted = false;
  lowManaCast = 0;
  lowChargesCast = 0;
  noRuneCast = 0;
  delayedRuneCast = 0;

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
      this.arcanePowerCasted = true;

      if (this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
        this.buffEndTimestamp = event.timestamp + 10000;
        debug && this.log('Arcane Power Cast During Arcane Power Proc');
        debug && this.log('Arcane Power End Time adjusted to');
      }

      if (this.arcaneChargeTracker.charges < 4) {
        debug && this.log('Arcane Power Cast with Low Charges');
        debug && this.log('Arcane Charges: ' + this.arcaneChargeTracker.charges);
        this.lowChargesCast += 1;
      }

      if (this.hasRuneOfPower && event.timestamp - this.runeTimestamp > 10000) {
        debug && this.log('Arcane Power Cast without Rune of Power');
        this.noRuneCast += 1;
      } else if (this.hasRuneOfPower && event.timestamp - this.runeTimestamp > 200) {
        debug && this.log('Arcane Power Cast delayed after Rune of Power');
        debug && this.log('Arcane Power Delay: ' + (event.timestamp - this.runeTimestamp));
        this.delayedRuneCast += 1;
      }

      if (!this.hasOverpowered && currentManaPercent < MANA_THRESHOLD) {
        debug && this.log('Arcane Power Cast with low mana');
        debug && !this.hasOverpowered && this.log('Mana Percent: ' + currentManaPercent);
        this.lowManaCast += 1;
      }
    } else {
      this.totalCastsDuringAP += 1;
      if (UNACCEPTABLE_ARCANE_POWER_SPELLS.includes(spellId)) {
        debug && this.log('Cast ' + event.ability.name + ' during Arcane Power');
        this.badCastsDuringAP += 1;
      } else if (spellId === SPELLS.ARCANE_BLAST.id || spellId === SPELLS.ARCANE_EXPLOSION.id) {
        const manaInfo = event.classResources.find(resource => resource.type === RESOURCE_TYPES.MANA.id);
        if (!manaInfo) {
          return;
        }
        const currentMana = manaInfo.amount;
        const manaCost = (event.resourceCost[RESOURCE_TYPES.MANA.id] + (event.resourceCost[RESOURCE_TYPES.MANA.id] * this.arcaneChargeTracker.charges));
        const manaRemaining = currentMana - manaCost;
        const buffTimeRemaining = this.buffEndTimestamp - event.timestamp;
        if (manaRemaining < this.estimatedManaCost(spellId) && buffTimeRemaining > 1000) {
          debug && this.log('Ran Out of Mana during Arcane Power');
          debug && this.log('Mana Remaining: ' + manaRemaining);
          debug && this.log('Estimated Mana Cost: ' + this.estimatedManaCost(spellId));
          debug && this.log('Time left on Arcane Power: ' + buffTimeRemaining);
          this.outOfMana += 1;
        }
      }
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ARCANE_POWER.id) {
      return;
    }

    if (this.arcanePowerCasted) {
      debug && this.log('Arcane Power Cast');
      this.buffEndTimestamp = event.timestamp + 10000;
      debug && this.log('Arcane Power Ends');
    } else {
      debug && this.log('Arcane Power Proc');
      this.buffEndTimestamp = event.timestamp + 8000;
      debug && this.log('Arcane Power Ends');
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ARCANE_POWER.id) {
      return;
    }
    this.arcanePowerCasted = false;
  }

  on_finished() {
    if (this.spellUsable.isAvailable(SPELLS.ARCANE_POWER.id) && this.deathTracker.isAlive) {
      this.arcanePowerOnKill = true;
    }
  }

  estimatedManaCost(spellId) {
    if (spellId === SPELLS.ARCANE_EXPLOSION.id) {
      if (this.hasOverpowered) {
        return 2000 * 0.4;
      } else {
        return 2000;
      }
    } else if (spellId === SPELLS.ARCANE_BLAST.id) {
      if (this.hasOverpowered) {
        return (550 + (550 * this.arcaneChargeTracker.charges)) * 0.4;
      } else if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id)) {
        return 0;
      } else {
        return 550 + (550 * this.arcaneChargeTracker.charges);
      }
    }
    return 0;
  }

  get requiredChecks() {
    let checks = 1;
    if (!this.hasOverpowered) {
      //Also checks mana level if you dont have Overpowered talented
      checks += 1;
    }
    if (this.hasRuneOfPower) {
      //Also checks to see if RoP was delayed or missing if RoP is talented
      checks += 1;
    }
    return checks;

  }

  get failedChecks() {
    return this.lowChargesCast + this.lowManaCast + this.noRuneCast + this.delayedRuneCast;
  }

  get cooldownUtilization() {
    return 1 - (this.failedChecks / (this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts * this.requiredChecks));
  }

  get castUtilization() {
    return 1 - (this.badCastsDuringAP / this.totalCastsDuringAP);
  }

  get manaUtilization() {
    return 1 - (this.outOfMana / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts);
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

  get manaUtilizationThresholds() {
    return {
      actual: this.manaUtilization,
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
        return suggest(<>You cast <SpellLink id={SPELLS.ARCANE_POWER.id} /> with less than 4 Arcane Charges {this.lowChargesCast} times and with low mana {this.lowManaCast} times. {this.hasRuneOfPower ? 'Additionally, you cast Arcane Power without Rune of Power ' + this.noRuneCast + ' times and delayed Arcane Power after Rune of Power ' + this.delayedRuneCast + ' times.' : ''} It is very important that you do not cast Arcane Power unless you have 4 Arcane Charges, have over 40% Mana (Unless talented into <SpellLink id={SPELLS.OVERPOWERED_TALENT.id} />), and <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> was cast immediately before Arcane Power (if talented into Rune of Power).</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${formatPercentage(this.cooldownUtilization)}% Utilization`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
    when(this.castSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast spells other than <SpellLink id={SPELLS.ARCANE_BLAST.id} />,<SpellLink id={SPELLS.ARCANE_MISSILES.id} />, <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />, and <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> during <SpellLink id={SPELLS.ARCANE_POWER.id} />. Arcane Power is a short duration, so you should ensure that you are getting the most use out of it. Buff spells like Rune of Power should be cast immediately before casting Arcane Power. Other spells such as Charged Up, Blink/Shimmer, etc are acceptable during Arcane Power, but should be avoided if possible.</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${formatPercentage(this.castUtilization)}% Utilization`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
    when(this.manaUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You ran dangerously low or ran out of mana during <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.outOfMana} times. Running out of mana during Arcane Power is a massive DPS loss and should be avoided at all costs. {!this.hasOverpowered ? 'To avoid this, ensure you have at least 40% mana before casting Arcane Power to ensure you have enough mana to finish Arcane Power.' : ''}</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${formatPercentage(this.manaUtilization)}% Utilization`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
    when(this.arcanePowerOnKillSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<><SpellLink id={SPELLS.ARCANE_POWER.id} /> was available to be cast when the boss died. You should ensure that you are casting Arcane Power on cooldown, especially at the end of the fight to get a little bit of last minute damage into the boss.</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .staticImportance(ISSUE_IMPORTANCE.REGULAR);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
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
			<li>You have 4 Arcane Charges - Missed ${this.lowChargesCast} times</li>
			${this.hasRuneOfPower ? `<li>You cast Rune of Power immediately before AP - Missed ${this.noRuneCast + this.delayedRuneCast} times</li>` : ''}
			${!this.hasOverpowered ? `<li>You have more than 40% mana - Missed ${this.lowManaCast} times</li>` : ''}
		</ul>

		Additionally, you should only be casting Arcane Blast and Arcane Missiles (If you have a Clearcasting Proc) during Arcane Power to maximize the short cooldown duration.`}
      />
    );
  }
}

export default ArcanePower;
