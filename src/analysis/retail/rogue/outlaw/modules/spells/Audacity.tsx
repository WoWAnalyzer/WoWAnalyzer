import { defineMessage } from '@lingui/core/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import AudacityDamageTracker from './AudacityDamageTracker';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { consumedAudacity } from '../../normalizers/CastLinkNormalizer';

//--TODO: maybe a better way to display the delayed/potentially overwritten casts than percentage?
//        maybe separate ss overwrite than ps since ps is much more problematic than ss

class Audacity extends Analyzer {
  procs: number = 0;
  consumedProcs: number = 0;

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

  constructor(options: Options) {
    super(options);

    [Events.applybuff, Events.refreshbuff].forEach((event) =>
      this.addEventListener(
        event.by(SELECTED_PLAYER).spell(SPELLS.AUDACITY_TALENT_BUFF),
        this.onApplyBuff,
      ),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AUDACITY_TALENT_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff() {
    this.procs += 1;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (consumedAudacity(event)) {
      this.consumedProcs += 1;
    }
  }

  get wastedProcs() {
    return this.procs - this.consumedProcs;
  }

  suggestions(when: When) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted <SpellLink spell={SPELLS.SINISTER_STRIKE} /> and/or{' '}
          <SpellLink spell={SPELLS.PISTOL_SHOT} /> while having an{' '}
          <SpellLink spell={TALENTS.AUDACITY_TALENT} /> proc. Try to prioritize{' '}
          <SpellLink spell={SPELLS.AMBUSH} /> as your combo point builder when you have{' '}
          <SpellLink spell={TALENTS.AUDACITY_TALENT} /> active to avoid the possibility of missing
          additional procs.
        </>,
      )
        .icon(TALENTS.AUDACITY_TALENT.icon)
        .actual(
          defineMessage({
            id: 'rogue.outlaw.suggestions.audacity.efficiency',
            message: `${formatPercentage(actual)}% inefficient casts`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Audacity;
