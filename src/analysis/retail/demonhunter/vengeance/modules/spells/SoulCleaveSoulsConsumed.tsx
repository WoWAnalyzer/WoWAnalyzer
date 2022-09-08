import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import {
  FEED_THE_DEMON_VENGEANCE_TALENT,
  SPIRIT_BOMB_VENGEANCE_TALENT,
} from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';

import SoulFragmentsTracker from '../features/SoulFragmentsTracker';
import SoulFragmentsConsume from '../statistics/SoulFragmentsConsume';

class SoulCleaveSoulsConsumed extends Analyzer {
  static dependencies = {
    soulFragmentsConsume: SoulFragmentsConsume,
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  protected soulFragmentsConsume!: SoulFragmentsConsume;
  protected soulFragmentsTracker!: SoulFragmentsTracker;

  /* Feed The Demon talent is taken in defensive builds. In those cases you want to generate and consume souls as quickly
   as possible. So how you consume your souls down matter. If you dont take that talent your taking a more balanced
   build meaning you want to consume souls in a way that boosts your dps. That means feeding the souls into spirit
   bomb as efficiently as possible (cast at 4+ souls) for a dps boost and have soul cleave absorb souls as little as
   possible since it provides no extra dps.
  */
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(SPIRIT_BOMB_VENGEANCE_TALENT.id) &&
      !this.selectedCombatant.hasTalent(FEED_THE_DEMON_VENGEANCE_TALENT.id);
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    const totalAvailable =
      this.soulFragmentsTracker.soulsGenerated - this.soulFragmentsTracker.overcap;
    const fractionOnSoulCleave =
      totalAvailable === 0 ? 0 : this.soulFragmentsConsume.soulCleaveSouls() / totalAvailable;

    return {
      actual: fractionOnSoulCleave,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should avoid consuming souls with <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> and instead
          try to consume them only with <SpellLink id={SPIRIT_BOMB_VENGEANCE_TALENT.id} /> for the
          increased dps. Your talent choices suggests your going for a balanced approch versus a
          defensive one with <SpellLink id={FEED_THE_DEMON_VENGEANCE_TALENT.id} />.
        </>,
      )
        .icon(SPELLS.SOUL_CLEAVE.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.soulCleave.soulsConsumed',
            message: `${formatPercentage(actual)}% of souls consumed.`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default SoulCleaveSoulsConsumed;
