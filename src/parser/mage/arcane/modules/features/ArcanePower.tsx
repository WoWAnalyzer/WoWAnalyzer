import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { TooltipElement } from 'common/Tooltip';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import ArcaneChargeTracker from './ArcaneChargeTracker';
import { ARCANE_POWER_MANA_THRESHOLD, ARCANE_POWER_SPELL_BLACKLIST } from '../../constants';

const debug = false;

class ArcanePower extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
    deathTracker: DeathTracker,
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;
  protected deathTracker!: DeathTracker;
  protected spellManaCost!: SpellManaCost;

  protected hasRuneOfPower: boolean;
  protected hasOverpowered: boolean;

  badUses = 0;
  totalCastsDuringAP = 0;
  badCastsDuringAP = 0;
  runeTimestamp = 0;
  outOfMana = 0;
  buffEndTimestamp = 0;
  arcanePowerCasted = false;
  lowManaCast = 0;
  lowChargesCast = 0;
  noRuneCast = 0;
  delayedRuneCast = 0;

  constructor(options: any) {
    super(options);
    this.hasRuneOfPower = this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
    this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER), this.onRemoveBuff);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RUNE_OF_POWER_TALENT.id) {
      this.runeTimestamp = event.timestamp;
      return;
    }
    if (spellId === SPELLS.ARCANE_POWER.id) {
      const manaResource: any = event.classResources && event.classResources.find(classResource => classResource.type === RESOURCE_TYPES.MANA.id);
      const currentManaPercent = manaResource.amount / manaResource.max;
      this.arcanePowerCasted = true;

      if (this.arcaneChargeTracker.charges < 4 || (this.hasRuneOfPower && event.timestamp - this.runeTimestamp > 200) || (!this.hasOverpowered && currentManaPercent < ARCANE_POWER_MANA_THRESHOLD)) {
        this.badUses += 1;
      }

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

      if (!this.hasOverpowered && currentManaPercent < ARCANE_POWER_MANA_THRESHOLD) {
        debug && this.log('Arcane Power Cast with low mana');
        debug && !this.hasOverpowered && this.log('Mana Percent: ' + currentManaPercent);
        this.lowManaCast += 1;
      }
      return;
    }
    if(!this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
      return;
    }
    // Any spell except arcane power or rune of power that was cast during Arcane Power
    this.totalCastsDuringAP += 1;
    if (ARCANE_POWER_SPELL_BLACKLIST.includes(event.ability)) {
      debug && this.log('Cast ' + event.ability.name + ' during Arcane Power');
      this.badCastsDuringAP += 1;
    } else if (spellId === SPELLS.ARCANE_BLAST.id || spellId === SPELLS.ARCANE_EXPLOSION.id) {
      event.classResources && event.classResources.forEach(resource => {
        if (resource.type !== RESOURCE_TYPES.MANA.id) {
          return;
        }
        const currentMana = resource.amount;
        const manaCost: any = event.resourceCost && (event.resourceCost[RESOURCE_TYPES.MANA.id] + (event.resourceCost[RESOURCE_TYPES.MANA.id] * this.arcaneChargeTracker.charges));
        const manaRemaining = currentMana - manaCost;
        const buffTimeRemaining = this.buffEndTimestamp - event.timestamp;
        if (manaRemaining < this.estimatedManaCost(spellId) && buffTimeRemaining > 1000) {
          debug && this.log('Ran Out of Mana during Arcane Power');
          debug && this.log('Mana Remaining: ' + manaRemaining);
          debug && this.log('Estimated Mana Cost: ' + this.estimatedManaCost(spellId));
          debug && this.log('Time left on Arcane Power: ' + buffTimeRemaining);
          this.outOfMana += 1;
        }
      });

    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
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

  onRemoveBuff(event: RemoveBuffEvent) {
    this.arcanePowerCasted = false;
  }

  estimatedManaCost(spellId: number) {
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

  get arcanePowerCooldownThresholds() {
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

  get arcanePowerCastThresholds() {
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

  get arcanePowerManaUtilization() {
    return {
      actual: 1 - (this.outOfMana / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts),
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.arcanePowerCooldownThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cast <SpellLink id={SPELLS.ARCANE_POWER.id} /> without proper setup {this.badUses} times. Arcane Power has a short duration so you should get the most out of it by meeting all requirements before casting it.
        <ul>
          <li>You have 4 <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> - You had this {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts - this.lowChargesCast} out of {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts} casts.</li>
          {this.hasRuneOfPower ? <li>You cast <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> <TooltipElement content="Arcane Power should be cast right on the end of the Rune of Power cast. There should not be any casts or any delay in between Rune of Power and Arcane Power to ensure that Rune of Power is up for the entire duration of Arcane Power.">immediately</TooltipElement> before Arcane Power - You did this {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts - (this.delayedRuneCast + this.noRuneCast)} out of {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts} casts.</li> : ''}
          {!this.hasOverpowered ? <li>You have more than 40% mana - You had this {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts - this.lowManaCast} out of {this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts} casts.</li> : ''}
        </ul>
        </>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${this.badUses} Bad Casts`)
          .recommended(`0 is recommended`);
      });
    when(this.arcanePowerCastThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cast spells other than <SpellLink id={SPELLS.ARCANE_BLAST.id} />,<SpellLink id={SPELLS.ARCANE_MISSILES.id} />, <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />, and <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> during <SpellLink id={SPELLS.ARCANE_POWER.id} />. Arcane Power is a short duration, so you should ensure that you are getting the most use out of it. Buff spells like Rune of Power should be cast immediately before casting Arcane Power. Other spells such as Charged Up, Blink/Shimmer, etc are acceptable during Arcane Power, but should be avoided if possible.</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${formatPercentage(actual)}% Utilization`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
    when(this.arcanePowerManaUtilization)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You ran dangerously low or ran out of mana during <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.outOfMana} times. Running out of mana during Arcane Power is a massive DPS loss and should be avoided at all costs. {!this.hasOverpowered ? 'To avoid this, ensure you have at least 40% mana before casting Arcane Power to ensure you have enough mana to finish Arcane Power.' : ''}</>)
          .icon(SPELLS.ARCANE_POWER.icon)
          .actual(`${formatPercentage(actual)}% Utilization`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Before casting Arcane Power, you should ensure that you meet all of the following requirements. If Arcane Power frequently comes off cooldown and these requirements are not already met, then consider modifying your rotation to ensure that they are met before Arcane Power comes off cooldown
            <ul>
              <li>You have 4 Arcane Charges - Missed {this.lowChargesCast} times</li>
              {this.hasRuneOfPower && <li>You cast Rune of Power immediately before AP - Missed {this.noRuneCast + this.delayedRuneCast} times</li>}
              {!this.hasOverpowered && <li>You have more than 40% mana - Missed {this.lowManaCast} times</li>}
            </ul>
            Additionally, you should only be casting Arcane Blast and Arcane Missiles (If you have a Clearcasting Proc) during Arcane Power to maximize the short cooldown duration.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_FAMILIAR_TALENT}>
          <>
            <SpellIcon
              id={SPELLS.ARCANE_POWER.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.cooldownUtilization, 0)}% <small> Arcane Power utilization</small><br />
            <SpellIcon
              id={SPELLS.ARCANE_BLAST.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.castUtilization, 0)}% <small>Arcane Blast Cast utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcanePower;
