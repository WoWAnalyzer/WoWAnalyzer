import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import AudacityDamageTracker from './AudacityDamageTracker';

//--TODO: maybe a better way to display the delayed/potentially overwritten casts than percentage?
//        maybe separate ss overwrite than ps since ps is much more problematic than ss

class Audacity extends Analyzer {
  get thresholds(): NumberThreshold {
    const totalSinister = this.damageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const totalPistol = this.damageTracker.getAbility(SPELLS.PISTOL_SHOT.id);
    const filteredSinister = this.audacityDamageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const filteredPistol = this.audacityDamageTracker.getAbility(SPELLS.PISTOL_SHOT.id);

    return {
      actual:
        (filteredSinister.casts + filteredPistol.casts) / (totalSinister.casts + totalPistol.casts),
      isGreaterThan: {
        minor: 0.01,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    damageTracker: DamageTracker,
    audacityDamageTracker: AudacityDamageTracker,
  };
  protected damageTracker!: DamageTracker;
  protected audacityDamageTracker!: AudacityDamageTracker;

  constructor(options: Options & { audacityDamageTracker: AudacityDamageTracker }) {
    super(options);

    options.audacityDamageTracker.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      () => `Ambush should be used as your builder when audacity proc is up`,
    );
    options.audacityDamageTracker.subscribeInefficientCast(
      [SPELLS.PISTOL_SHOT],
      () => `Ambush should be used as your builder when audacity proc is up`,
    );
  }

  suggestions(when: When) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> and/or{' '}
          <SpellLink id={SPELLS.PISTOL_SHOT.id} /> while having an{' '}
          <SpellLink id={TALENTS.AUDACITY_TALENT.id} /> proc. Try to prioritize{' '}
          <SpellLink id={SPELLS.AMBUSH.id} /> as your combo point builder when you have{' '}
          <SpellLink id={TALENTS.AUDACITY_TALENT.id} /> active to avoid the possibility of missing
          additional procs.
        </>,
      )
        .icon(TALENTS.AUDACITY_TALENT.icon)
        .actual(
          t({
            id: 'rogue.outlaw.suggestions.audacity.efficiency',
            message: `${formatPercentage(actual)}% inefficient casts`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Audacity;
