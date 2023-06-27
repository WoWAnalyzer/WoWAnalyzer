import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.RIP_TIDE.id,
    ...SPELLS.RIP_TIDE.lowRanks,
    SPELLS.CHAIN_HEAL.id,
    ...SPELLS.CHAIN_HEAL.lowRanks,
    SPELLS.HEALING_WAVE.id,
    ...SPELLS.HEALING_WAVE.lowRanks,
    SPELLS.LESSER_HEALING_WAVE.id,
    ...SPELLS.LESSER_HEALING_WAVE.lowRanks,
    SPELLS.HEALING_STREAM_TOTEM.id,
    ...SPELLS.HEALING_STREAM_TOTEM.lowRanks,
    SPELLS.FROST_RESISTANCE_TOTEM.id,
    ...SPELLS.FROST_RESISTANCE_TOTEM.lowRanks,
    SPELLS.MANA_SPRING_TOTEM.id,
    ...SPELLS.MANA_SPRING_TOTEM.lowRanks,
    SPELLS.PURGE.id,
    ...SPELLS.PURGE.lowRanks,
    SPELLS.STONESKIN_TOTEM.id,
    ...SPELLS.STONESKIN_TOTEM.lowRanks,
    SPELLS.WATER_SHIELD.id,
    ...SPELLS.WATER_SHIELD.lowRanks,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
