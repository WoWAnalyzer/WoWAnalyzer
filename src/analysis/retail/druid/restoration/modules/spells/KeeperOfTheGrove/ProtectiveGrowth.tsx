import { formatNumber } from 'common/format';
import TALENTS_DRUID from 'common/TALENTS/druid';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { calculateEffectiveDamageReduction } from 'parser/core/EventCalculateLib';

const PROTECTIVE_GROWTH_REDUCTION = 0.08;

/**
 * **Protective Growth**
 * Hero Talent - Keeper of the Grove
 *
 * Your Regrowth protects you, reducing damage you take by 8% while your Regrowth is on you.
 */
class ProtectiveGrowth extends Analyzer {
  damageReduced = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PROTECTIVE_GROWTH_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.REGROWTH.id)) {
      return;
    }
    this.damageReduced += calculateEffectiveDamageReduction(event, PROTECTIVE_GROWTH_REDUCTION);
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <>
          <BoringSpellValueText spell={TALENTS_DRUID.PROTECTIVE_GROWTH_TALENT}>
            {formatNumber(this.damageReduced)} <small> damage reduced </small> <br />
            {formatNumber((this.damageReduced / fightDuration) * 1000)} DRPS <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ProtectiveGrowth;
