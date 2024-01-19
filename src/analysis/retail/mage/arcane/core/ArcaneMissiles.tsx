import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class ArcaneMissiles extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  castWithoutClearcasting = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_MISSILES_TALENT),
      this.onMissilesCast,
    );
  }

  onMissilesCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
      return;
    }
    this.castWithoutClearcasting += 1;
  }

  get missilesUtilization() {
    return (
      1 -
      this.castWithoutClearcasting /
        this.abilityTracker.getAbility(TALENTS.ARCANE_MISSILES_TALENT.id).casts
    );
  }

  get arcaneMissileUsageThresholds() {
    return {
      actual: this.missilesUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.arcaneMissileUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> without{' '}
          <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> {this.castWithoutClearcasting} times.
          There is no benefit from casting <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT.id} />{' '}
          without <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />.
        </>,
      )
        .icon(TALENTS.ARCANE_MISSILES_TALENT.icon)
        .actual(`{formatPercentage(this.missilesUtilization)}% Uptime`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default ArcaneMissiles;
