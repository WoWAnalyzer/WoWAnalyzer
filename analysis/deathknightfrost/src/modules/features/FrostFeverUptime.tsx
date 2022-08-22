import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get frostFeverUptime() {
    return this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
  }

  suggestions(when: When) {
    when(this.frostFeverUptime)
      .isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="deathknight.frost.frostFever.suggestion.suggestion">
            Your <SpellLink id={SPELLS.FROST_FEVER.id} /> uptime can be improved. Try to pay
            attention to when Frost Fever is about to fall off the priority target, using{' '}
            <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to refresh Frost Fever. Using a debuff
            tracker can help.
          </Trans>,
        )
          .icon(SPELLS.FROST_FEVER.icon)
          .actual(
            t({
              id: 'deathknight.frost.frostFever.suggestion.actual',
              message: `${formatPercentage(actual)}% Frost Fever uptime`,
            }),
          )
          .recommended(
            t({
              id: 'deathknight.frost.frostFever.suggestion.recommended',
              message: `>${formatPercentage(recommended)}% is recommended`,
            }),
          )
          .regular(recommended - 0.05)
          .major(recommended - 0.15),
      );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(20)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.FROST_FEVER.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.frostFeverUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FrostFeverUptime;
