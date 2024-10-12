import { defineMessage } from '@lingui/macro';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class GrimoireOfSacrifice extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your uptime on <SpellLink spell={TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT} /> is too low. If
          you picked this talent, you should always have your pet sacrificed. If you died or
          summoned your pet, make sure to sacrifice it again to gain this buff.
        </>,
      )
        .icon(TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'warlock.shared.suggestions.grimoireOfSacrifice.uptime',
            message: `${formatPercentage(actual)} % Grimoire of Sacrifice uptime.`,
          }),
        )
        .recommended(`>= ${formatPercentage(recommended)} % is recommended`),
    );
  }

  statistic() {
    const damage = this.abilityTracker.getAbilityDamage(SPELLS.GRIMOIRE_OF_SACRIFICE_DAMAGE.id);
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="small"
        tooltip={
          <>
            {formatThousands(damage)} damage
            <br />
            Buff uptime: {formatPercentage(this.uptime)} %
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GrimoireOfSacrifice;
