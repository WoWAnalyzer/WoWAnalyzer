import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import React from 'react';

import { getAdditionalEnergyUsed } from '../../normalizers/FerociousBiteDrainLinkNormalizer';

const FB_BASE_COST = 25;
const MAX_FB_DRAIN = 25;

/**
 * Tracks Ferocious Bite usage for analysis, including some legendary and talent interactions.
 */
class FerociousBite extends Analyzer {
  hasSotf: boolean;

  shouldUseBonusEnergyCasts: number = 0;
  extraEnergyUsed: number = 0;

  constructor(options: Options) {
    super(options);

    this.hasSotf = this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbCast,
    );
  }

  onFbCast(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.ENERGY.id] === 0) {
      return; // free FBs (like from Apex Predator's Craving) don't drain but do full damage
    }

    if (
      this.hasSotf &&
      (this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
        this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id))
    ) {
      return; // using less than full bonus with SotF during Zerk is acceptable in order to maximize finishers used
    }

    const additionalEnergyUsed = getAdditionalEnergyUsed(event);
    this.shouldUseBonusEnergyCasts += 1;
    this.extraEnergyUsed += additionalEnergyUsed;

    if (additionalEnergyUsed < MAX_FB_DRAIN) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Used with low energy, causing only ${additionalEnergyUsed}
        extra energy to be turned in to bonus damage. You should always cast Ferocious Bite with
        the full ${FB_BASE_COST + MAX_FB_DRAIN} energy available in order to maximize damage`;
    }
  }

  /** This is the average extra energy used by FB casts, not counting casts where the player shouldn't use the full extra */
  get averageExtraEnergyUsed() {
    return this.shouldUseBonusEnergyCasts === 0
      ? MAX_FB_DRAIN // default to max with zero casts to avoid spurious suggestion
      : this.extraEnergyUsed / this.shouldUseBonusEnergyCasts;
  }

  get extraEnergySuggestionThresholds() {
    return {
      actual: this.averageExtraEnergyUsed,
      isLessThan: {
        minor: 25,
        average: 20,
        major: 10,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const hasSotf = this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL);
    const hasApex = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.APEX_PREDATORS_CRAVING.bonusID,
    );
    let exceptions = 0;
    if (hasSotf) {
      exceptions += 1;
    }
    if (hasApex) {
      exceptions += 1;
    }
    when(this.extraEnergySuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You didn't always give <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> enough energy to get
          the full damage bonus. You should aim to have {FB_BASE_COST + MAX_FB_DRAIN} energy before
          using Ferocious Bite.
          {exceptions === 2 && (
            <>
              <br />
              <br />
              The two exceptions are:{' '}
            </>
          )}
          {exceptions === 1 && (
            <>
              <br />
              <br />
              The one exception is:{' '}
            </>
          )}
          {hasSotf && (
            <>
              because you have <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL.id} />, during{' '}
              <SpellLink id={SPELLS.BERSERK.id} /> it is acceptable to cast at minimum energy in
              order to maximize the number of bites cast
              {hasApex ? ', and ' : '. '}
            </>
          )}
          {hasApex && (
            <>
              because you have <SpellLink id={SPELLS.APEX_PREDATORS_CRAVING.id} /> your free bite
              procs don't need extra energy because they always count as though they used the extra
              energy.
            </>
          )}
          {exceptions > 0 && (
            <>
              {' '}Exceptions are <strong>excluded</strong> from this statistic - this suggestion is based
              only on the casts that should have had full energy.
            </>
          )}
        </>,
      )
        .icon(SPELLS.FEROCIOUS_BITE.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.ferociousBite.efficiency',
            message: `${actual.toFixed(1)} average bonus energy used on Ferocious Bite.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default FerociousBite;
