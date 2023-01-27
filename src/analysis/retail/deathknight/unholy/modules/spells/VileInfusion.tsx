import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import { TIERS } from 'game/TIERS';

class VileInfusion extends Analyzer {
  lastBuffTime = 0;
  totalBuffTime = 0;
  buffIsUp = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.T29_VILE_INFUSION_BUFF),
      this.onBuffEvent,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.T29_VILE_INFUSION_BUFF),
      this.onRemoveBuff,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffEvent(event: ApplyBuffEvent) {
    this.lastBuffTime = event.timestamp;
    this.buffIsUp = true;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.totalBuffTime += (event.timestamp - this.lastBuffTime) / 1000;
    this.buffIsUp = false;
  }

  onFightEnd(event: FightEndEvent) {
    if (this.buffIsUp === true) {
      this.totalBuffTime += (event.timestamp - this.lastBuffTime) / 1000;
    }
  }

  get averageBuffUptime() {
    return this.totalBuffTime / (this.owner.fightDuration / 1000);
  }

  suggestions(when: When) {
    // Vile Infusion should have 75% uptime or more
    when(this.averageBuffUptime)
      .isLessThan(0.75)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not keeping up your <SpellLink id={SPELLS.T29_VILE_INFUSION_BUFF.id} /> enough.{' '}
            Prioritise maintaining it by bursting <SpellLink id={SPELLS.FESTERING_WOUND.id} />
            s.
          </span>,
        )
          .icon(SPELLS.PLAGUEBRINGER_BUFF.icon)
          .actual(
            t({
              id: 'deathknight.unholy.suggestions.plaguebringer.uptime',
              message: `Vile Infusion was up ${formatPercentage(
                this.averageBuffUptime,
              )}% of the time`,
            }),
          )
          .recommended(`${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Your Vile Infusion was up ${Math.round(this.totalBuffTime)} out of ${Math.round(
          this.owner.fightDuration / 1000,
        )} seconds`}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.T29_VILE_INFUSION_BUFF.id}>
          <>
            {formatPercentage(this.averageBuffUptime)}% <small>Vile Infusion uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VileInfusion;
