import { Trans } from '@lingui/macro';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class LivingBomb extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIVING_BOMB_TALENT);
  }

  get livingBombCasts() {
    return this.abilityTracker.getAbility(TALENTS.LIVING_BOMB_TALENT.id).casts;
  }

  get livingBombCastThresholds() {
    return {
      actual: this.livingBombCasts,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.livingBombCastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> {this.livingBombCasts} times.
          Although it is worth it to take the <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} />{' '}
          talent, this is only to get to the <SpellLink spell={TALENTS.FIREFALL_TALENT} /> talent.
          On Single Target there is no benefit to casting{' '}
          <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> and is overall considered a DPS loss. On
          AOE fights, it is not worth taking the <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} />{' '}
          talent at all.
        </>,
      )
        .icon(TALENTS.LIVING_BOMB_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.livingBomb.casts">{this.livingBombCasts} casts</Trans>,
        )
        .recommended(`${this.livingBombCasts} is recommended`),
    );
  }
}

export default LivingBomb;
