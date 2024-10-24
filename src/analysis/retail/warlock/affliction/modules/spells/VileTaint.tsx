import { formatThousands, formatPercentage, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class VileTaint extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  hits: number = 0;
  casts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VILE_TAINT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VILE_TAINT_TALENT),
      this.onVileTaintCast,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VILE_TAINT_DEBUFF),
      this.onVileTaintApplyDebuff,
    );
  }

  onVileTaintCast() {
    this.casts += 1;
  }

  onVileTaintApplyDebuff() {
    this.hits += 1;
  }

  statistic() {
    const damage = this.abilityTracker.getAbilityDamage(SPELLS.VILE_TAINT_DEBUFF.id);
    const averageTargetsHit = this.hits / this.casts;
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(damage)} damage
            <br />
            Average targets hit: {averageTargetsHit.toFixed(2)}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.VILE_TAINT_TALENT}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VileTaint;
