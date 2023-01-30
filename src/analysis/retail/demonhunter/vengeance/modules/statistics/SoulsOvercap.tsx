import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SoulFragmentsTracker from '../features/SoulFragmentsTracker';

class SoulsOvercap extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected soulFragmentsTracker!: SoulFragmentsTracker;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEED_THE_DEMON_TALENT);
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.wastePerGenerated(),
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  wastePerGenerated() {
    return this.soulFragmentsTracker.overcap / this.soulFragmentsTracker.soulsGenerated;
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are generating <SpellLink id={SPELLS.SOUL_FRAGMENT.id} />s when you are already at 5
          souls. These are auto consumed. You are missing out on the extra damage consuming them
          with <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id} /> provides.
        </>,
      )
        .icon(SPELLS.SOUL_FRAGMENT.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.souls.wasted',
            message: `${formatPercentage(this.wastePerGenerated())}% wasted Soul Fragments.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% or less is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={
          <>
            You generated {formatNumber(this.soulFragmentsTracker.overcap)} souls at cap. These are
            absorbed automatically and aren't avalible to boost Spirit Bomb's damage.
            <br />
            Total Soul Fragments generated: {formatNumber(this.soulFragmentsTracker.soulsGenerated)}
            <br />
            Total Soul Fragments spent: {formatNumber(this.soulFragmentsTracker.soulsSpent)}
            <br />
            At the end of the fight, you had {formatNumber(
              this.soulFragmentsTracker.currentSouls,
            )}{' '}
            unused Soul Fragments.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SOUL_FRAGMENT.id}>
          <>
            {formatPercentage(this.wastePerGenerated())}% <small>souls over cap</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulsOvercap;
