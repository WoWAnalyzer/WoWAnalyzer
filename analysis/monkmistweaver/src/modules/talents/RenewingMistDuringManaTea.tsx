import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RenewingMistDuringManaTea extends Analyzer {
  vivifyCasts: number = 0;
  vivifyHealEvents: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleViv);
  }

  vivCast(event: CastEvent) {
    if (!this.hasManatea()) {
      return;
    }
    this.vivifyCasts += 1;
  }

  handleViv(event: HealEvent) {
    if (!this.hasManatea()) {
      return;
    }
    this.vivifyHealEvents += 1;
  }

  hasManatea() {
    return this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id);
  }

  get avgRemDuringMT() {
    return this.vivifyHealEvents / this.vivifyCasts - 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgRemDuringMT,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          During <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> you should have a minimum of two{' '}
          <SpellLink id={SPELLS.RENEWING_MIST.id} /> out to maximize your healing during the buff.
        </>,
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(
          `${this.avgRemDuringMT.toFixed(2)}${t({
            id: 'monk.mistweaver.suggestions.renewingMistDuringManaTea.avgRenewingMists',
            message: ` average Renewing Mists during Mana Tea`,
          })}`,
        )
        .recommended(`${recommended} average Renewing Mists recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>This is the average number of Renewing Mists active during Mana Tea</>}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.MANA_TEA_TALENT.id} /> Average Renewing Mists
            </>
          }
        >
          <>{this.avgRemDuringMT.toFixed(2)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default RenewingMistDuringManaTea;
