import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import { TIERS } from 'game/TIERS';
import Pets from 'parser/shared/modules/Pets';

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
  }

  static dependencies = {
    pets: Pets,
  };
  protected pets!: Pets;
  get averageBuffUptime() {
    return this.pets.getBuffUptime(SPELLS.T29_VILE_INFUSION_BUFF.id) / this.owner.fightDuration;
  }

  suggestions(when: When) {
    // Vile Infusion should have 75% uptime or more
    when(this.averageBuffUptime)
      .isLessThan(0.75)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not keeping up your <SpellLink spell={SPELLS.T29_VILE_INFUSION_BUFF} /> enough.{' '}
            Prioritise maintaining it by bursting <SpellLink spell={SPELLS.FESTERING_WOUND} />
            s.
          </span>,
        )
          .icon(SPELLS.PLAGUEBRINGER_BUFF.icon)
          .actual(
            defineMessage({
              id: 'deathknight.unholy.suggestions.vileinfusion.uptime',
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
        <BoringSpellValueText spell={SPELLS.T29_VILE_INFUSION_BUFF}>
          <>
            {formatPercentage(this.averageBuffUptime)}% <small>Vile Infusion uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VileInfusion;
