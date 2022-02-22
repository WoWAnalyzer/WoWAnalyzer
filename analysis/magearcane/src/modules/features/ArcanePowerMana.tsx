import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';

import {
  ARCANE_BLAST_BASE_MANA_COST,
  ARCANE_EXPLOSION_BASE_MANA_COST,
  OVERPOWERED_COST_REDUCTION_PERCENT,
  MS_BUFFER_1000,
} from '@wowanalyzer/mage';

import ArcaneChargeTracker from './ArcaneChargeTracker';

const debug = false;

class ArcanePowerMana extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellManaCost!: SpellManaCost;
  protected eventHistory!: EventHistory;

  hasOverpowered: boolean;

  outOfMana = 0;
  buffEndTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_BLAST, SPELLS.ARCANE_EXPLOSION]),
      this.onCast,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER),
      this.onApplyBuff,
    );
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
      return;
    }

    //If the player is casting Arcane Blast or Arcane Explosion, estimate whether they will run out of mana or not
    event.classResources &&
      event.classResources.forEach((resource) => {
        if (resource.type !== RESOURCE_TYPES.MANA.id) {
          return;
        }
        const currentMana = resource.amount;
        const resourceCost =
          (event.resourceCost && event.resourceCost[RESOURCE_TYPES.MANA.id]) || 0;
        const manaCost =
          (event.resourceCost && resourceCost + resourceCost * this.arcaneChargeTracker.charges) ||
          0;
        const manaRemaining = currentMana - manaCost;
        const buffTimeRemaining = this.buffEndTimestamp - event.timestamp;
        if (manaRemaining < this.estimatedManaCost(spellId) && buffTimeRemaining > 1000) {
          debug && this.log('Ran Out of Mana during Arcane Power');
          this.outOfMana += 1;
        }
      });
  }

  onApplyBuff(event: ApplyBuffEvent) {
    const lastCast = this.eventHistory.last(
      1,
      MS_BUFFER_1000,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER),
    );
    this.buffEndTimestamp = lastCast.length > 0 ? event.timestamp + 10000 : event.timestamp + 8000;
  }

  estimatedManaCost(spellId: number) {
    if (spellId === SPELLS.ARCANE_EXPLOSION.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
        return 0;
      } else {
        return this.hasOverpowered
          ? ARCANE_EXPLOSION_BASE_MANA_COST * OVERPOWERED_COST_REDUCTION_PERCENT
          : ARCANE_EXPLOSION_BASE_MANA_COST;
      }
    }

    const arcaneCharges =
      this.arcaneChargeTracker.charges < 4 ? this.arcaneChargeTracker.charges + 1 : 4;
    if (spellId === SPELLS.ARCANE_BLAST.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id)) {
        return 0;
      } else {
        return this.hasOverpowered
          ? ARCANE_BLAST_BASE_MANA_COST * arcaneCharges * OVERPOWERED_COST_REDUCTION_PERCENT
          : ARCANE_BLAST_BASE_MANA_COST * arcaneCharges;
      }
    }
    return 0;
  }

  get totalArcanePowerCasts() {
    return this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts;
  }

  get manaUtilization() {
    return 1 - this.outOfMana / this.totalArcanePowerCasts;
  }

  get arcanePowerManaUtilization() {
    return {
      actual: this.manaUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.arcanePowerManaUtilization).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You ran dangerously low or ran out of mana during{' '}
          <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.outOfMana} times. Running out of mana
          during Arcane Power is a massive DPS loss and should be avoided at all costs.{' '}
          {!this.hasOverpowered
            ? 'To avoid this, ensure you have at least 40% mana before casting Arcane Power to ensure you have enough mana to finish Arcane Power.'
            : ''}
        </>,
      )
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.arcanePowerMana.lowMana">
            {formatPercentage(actual)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default ArcanePowerMana;
