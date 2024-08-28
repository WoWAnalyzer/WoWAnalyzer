import { formatNumber } from 'common/format';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from '../../../../parser/ui/BoringSpellValueText';
import { calculateEffectiveDamageReduction } from 'parser/core/EventCalculateLib';

const PROTECTIVE_LIGHT_REDUCTION = 0.1;

class ProtectiveLight extends Analyzer {
  damageReduced = 0;
  damageDuringProtectiveLight = 0;

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS_PRIEST.PROTECTIVE_LIGHT_TALENT)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PROTECTIVE_LIGHT_BUFF.id)) {
      return;
    }
    this.damageDuringProtectiveLight += calculateEffectiveDamageReduction(
      event,
      PROTECTIVE_LIGHT_REDUCTION,
    );
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;
    this.damageReduced = this.damageDuringProtectiveLight;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <>
          <BoringSpellValueText spell={TALENTS.PROTECTIVE_LIGHT_TALENT}>
            {formatNumber(this.damageReduced)} <small> damage reduced </small> <br />
            {formatNumber((this.damageReduced / fightDuration) * 1000)} DRPS <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ProtectiveLight;
