import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class PlagueBringer extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT);
    if (!this.active) {
      return;
    }
  }

  get averageBuffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.PLAGUEBRINGER_BUFF.id) / this.owner.fightDuration
    );
  }

  get totalBuffUptime() {
    return Math.round(this.selectedCombatant.getBuffUptime(SPELLS.PLAGUEBRINGER_BUFF.id) / 1000);
  }

  suggestions(when: When) {
    // Plaguebringer should have 90% uptime or more
    when(this.averageBuffUptime)
      .isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not keeping up your <SpellLink spell={SPELLS.PLAGUEBRINGER_BUFF} /> enough.{' '}
            Prioritise maintaining it by using <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} />.
          </span>,
        )
          .icon(SPELLS.PLAGUEBRINGER_BUFF.icon)
          .actual(
            defineMessage({
              id: 'deathknight.unholy.suggestions.plaguebringer.uptime',
              message: `Plaguebringer was up ${formatPercentage(
                this.averageBuffUptime,
              )}% of the time`,
            }),
          )
          .recommended(`${recommended * 100}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Your Plaguebringer was up ${this.totalBuffUptime} out of ${Math.round(
          this.owner.fightDuration / 1000,
        )} seconds`}
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.PLAGUEBRINGER_TALENT}>
          <>
            {formatPercentage(this.averageBuffUptime)}% <small>Plaguebringer uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueBringer;
