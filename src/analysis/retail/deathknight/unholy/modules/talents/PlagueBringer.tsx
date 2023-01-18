import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';

class PlagueBringer extends Analyzer {
  lastBuffTime = 0;
  totalBuffTime = 0;
  buffIsUp = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PLAGUEBRINGER_BUFF),
      this.onBuffEvent,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PLAGUEBRINGER_BUFF),
      this.onRemoveBuffEvent,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffEvent(event: ApplyBuffEvent) {
    this.lastBuffTime = event.timestamp;
    this.buffIsUp = true;
  }

  onRemoveBuffEvent(event: RemoveBuffEvent) {
    this.totalBuffTime += event.timestamp - this.lastBuffTime;
    this.buffIsUp = false;
  }

  onFightEnd(event: FightEndEvent) {
    if (this.buffIsUp === true) {
      this.totalBuffTime += event.timestamp - this.lastBuffTime;
    }
  }

  suggestions(when: When) {
    const averageBuffUptime = Number(this.totalBuffTime / this.owner.fightDuration);
    // Plaguebringer should have 90% uptime or more
    when(averageBuffUptime)
      .isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not keeping up your <SpellLink id={SPELLS.PLAGUEBRINGER_BUFF.id} /> enough.{' '}
            Prioritise maintaining it by using <SpellLink id={SPELLS.SCOURGE_STRIKE.id} />.
          </span>,
        )
          .icon(SPELLS.PLAGUEBRINGER_BUFF.icon)
          .actual(
            t({
              id: 'deathknight.unholy.suggestions.plaguebringer.uptime',
              message: `Plaguebringer was up ${(averageBuffUptime * 100).toFixed(2)}% of the time`,
            }),
          )
          .recommended(`${recommended * 100}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }

  statistic() {
    const averageBuffUptime = Number(this.totalBuffTime / this.owner.fightDuration);
    return (
      <Statistic
        tooltip={`Your Plaguebringer was up ${(this.totalBuffTime / 1000).toFixed(0)} out of ${(
          this.owner.fightDuration / 1000
        ).toFixed(0)} seconds`}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spellId={TALENTS.PLAGUEBRINGER_TALENT.id}>
          <>
            {formatPercentage(averageBuffUptime)}% <small>Plaguebringer uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueBringer;
