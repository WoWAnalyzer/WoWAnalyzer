import { t } from '@lingui/macro';
import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class SpiritBombFrailtyDebuff extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(DH_TALENTS.SPIRIT_BOMB_TALENT.id);
  }

  get uptime() {
    return (
      this.enemies.getBuffUptime(DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id) / this.owner.fightDuration
    );
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> uptime can be improved.
          This is easy to maintain and an important source of healing.
        </>,
      )
        .icon(DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.spiritBombFrailtyBuff.uptime',
            message: `${formatPercentage(actual)}% Frailty uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    const spiritBombUptime = this.enemies.getBuffUptime(DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id);
    const spiritBombDamage = this.abilityTracker.getAbility(DH_SPELLS.SPIRIT_BOMB_DAMAGE.id)
      .damageEffective;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total damage was {formatThousands(spiritBombDamage)}.<br />
            Total uptime was {formatDuration(spiritBombUptime)}.
          </>
        }
      >
        <BoringSpellValueText spellId={DH_TALENTS.SPIRIT_BOMB_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpiritBombFrailtyDebuff;
