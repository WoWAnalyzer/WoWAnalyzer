import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import * as SPELLS from '../../SPELLS';
import { RENEWED_HOPE_BUFF, RENEWED_HOPE_TALENT } from '../../SPELLS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import UptimeIcon from 'interface/icons/Uptime';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

const RENEWED_HOPE_DAMAGE_REDUCTION = 0.03;
const BLESSING_OF_SANCTUARY_ID = 20911;
const GREATER_BLESSING_OF_SANCTUARY_ID = 25899;
const VIGILANCE_ID = 50720;

class RenewedHope extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  // This is an approximation.
  totalDamageTakenWhileBuffActive = 0;

  protected abilityTracker!: AbilityTracker;

  get talentActive() {
    return this.selectedCombatant.buffs.some(buff => {
      return buff.ability?.guid === RENEWED_HOPE_BUFF;
    });
  }

  get anyOtherDamageReductionEffectActive() {
    return this.selectedCombatant.buffs.some(buff => {
      return [BLESSING_OF_SANCTUARY_ID, GREATER_BLESSING_OF_SANCTUARY_ID, VIGILANCE_ID].includes(buff.ability?.guid);
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(RENEWED_HOPE_BUFF) / this.owner.fightDuration;
  }

  get totalDamageReduced() {
    return this.totalDamageTakenWhileBuffActive / (1 - RENEWED_HOPE_DAMAGE_REDUCTION);
  }

  statistic() {
    this.active = this.talentActive;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValue label={<SpellLink id={SPELLS.RENEWED_HOPE_TALENT} />}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
        </BoringValue>
      </Statistic>
    );
  }

  get damageReductionActiveThreshold() {
    return {
      actual: this.talentActive || this.anyOtherDamageReductionEffectActive,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    when(this.damageReductionActiveThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your raid should try to have at least one person buffing: <SpellLink id={RENEWED_HOPE_TALENT} />, <SpellLink id={GREATER_BLESSING_OF_SANCTUARY_ID} />, <SpellLink id={BLESSING_OF_SANCTUARY_ID} />, or <SpellLink id={VIGILANCE_ID} />.
        </>,
      ).staticImportance(ISSUE_IMPORTANCE.REGULAR)
        .icon('spell_holy_holyprotection')
        .actual(
          <>
            Your raid didn't have any abilities that grant 3% damage reduction across the raid.
          </>,
        ).recommended('This doesn\'t mean you specifically need to grab the talent, just that your raid is missing out on an important buff'),
    );
  }
}

export default RenewedHope;
