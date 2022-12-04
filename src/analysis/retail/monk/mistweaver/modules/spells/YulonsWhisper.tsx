import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const NUM_TICKS = 3;

class YulonsWhisper extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healCount: number = 0;
  combatants!: Combatants;
  tftCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.YULONS_WHISPER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.onTFT,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.YULONS_WHISPER_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.healCount += 1;
  }

  onTFT(event: CastEvent) {
    this.tftCount += 1;
  }

  get averageYWCount() {
    return this.healCount / this.tftCount / NUM_TICKS;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageYWCount,
      isLessThan: {
        minor: 4,
        average: 3,
      },
      recommended: 4.5,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are not hitting enough targets with{' '}
          <SpellLink id={TALENTS_MONK.YULONS_WHISPER_TALENT.id} />, try positioning with more people
          in front of you when using <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} />
        </>,
      )
        .icon(TALENTS_MONK.YULONS_WHISPER_TALENT.icon)
        .actual(
          `${actual.toFixed(2) + ' '}${t({
            id: 'monk.mistweaver.suggestions.yulonsWhisper.avgTargets',
            message: `average targets hit`,
          })}`,
        )
        .recommended(`> ${recommended} average targets hit is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              Average <SpellLink id={TALENTS_MONK.YULONS_WHISPER_TALENT.id} /> targets
            </>
          }
        >
          {this.averageYWCount.toFixed(2)}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default YulonsWhisper;
