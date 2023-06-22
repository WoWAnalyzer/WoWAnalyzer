import { formatPercentage, formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import UptimeIcon from 'interface/icons/Uptime';

export const FOTF_NATURE_DAMAGE_INCREASE = 0.04;
export const FOTF_ARCANE_DAMAGE_INCREASE = 0.04;

class FriendOfTheFae extends Analyzer {
  totalAddedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FRIEND_OF_THE_FAE_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FRIEND_OF_THE_FAE.id)) {
      if (event.ability.type === MAGIC_SCHOOLS.ids.NATURE) {
        this.totalAddedDamage += calculateEffectiveDamage(event, FOTF_NATURE_DAMAGE_INCREASE);
      }
      if (event.ability.type === MAGIC_SCHOOLS.ids.ARCANE) {
        this.totalAddedDamage += calculateEffectiveDamage(event, FOTF_ARCANE_DAMAGE_INCREASE);
      }
      if (event.ability.type === MAGIC_SCHOOLS.ids.ASTRAL) {
        this.totalAddedDamage += calculateEffectiveDamage(
          event,
          FOTF_NATURE_DAMAGE_INCREASE + FOTF_ARCANE_DAMAGE_INCREASE,
        );
      }
    }
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FRIEND_OF_THE_FAE.id) / this.owner.fightDuration
    );
  }

  statistic() {
    const dpsIncrease = formatNumber(this.totalAddedDamage / (this.owner.fightDuration / 1000));
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        tooltip={`You had ${formatPercentage(
          this.uptime,
        )}% uptime on this talent which added ${dpsIncrease} to your DPS.`}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.FRIEND_OF_THE_FAE_TALENT}>
          <>
            <ItemPercentDamageDone greaterThan amount={this.totalAddedDamage} />
            <br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small> uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FriendOfTheFae;
