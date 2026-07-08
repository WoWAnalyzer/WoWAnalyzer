import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DOUBLE_TIME_EBON_MIGHT_MULTIPLIER } from 'analysis/retail/evoker/augmentation/constants';
import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import { ebonIsFromBreath, proccedDoubleTime } from '../normalizers/CastLinkNormalizer';
import { InformationIcon } from 'interface/icons';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import StatTracker from 'parser/shared/modules/StatTracker';

/**
 * Applying Ebon Might has a chance equal to your critical strike chance to grant 50% additional Ebon Might stats for 15 sec.
 * Hardcast Prescience has a chance equal to your critical strike chance to grant 1.5x the normal critical strike chance for 15 sec. [Not trackable]
 */
class DoubleTime extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  damage = 0;
  procAttempts = 0;
  actualProcs = 0;
  critChances: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
      this.onDamage,
      // Healing not included as effect is negligible with Ebon Might no longer buffing healers
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EBON_MIGHT_TALENT),
      this.onEbonCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BREATH_OF_EONS_TALENT),
      this.onEonsCast,
    );
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TIME_EBON_MIGHT_BUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DOUBLE_TIME_EBON_MIGHT_MULTIPLIER);
    }
  }

  onEbonCast(event: CastEvent) {
    this.procAttempts++;
    this.critChances.push(this.stats.currentCritPercentage);
    if (proccedDoubleTime(event)) {
      this.actualProcs++;
    }
  }

  onEonsCast(event: CastEvent) {
    if (ebonIsFromBreath(event)) {
      this.critChances.push(this.stats.currentCritPercentage);
      this.procAttempts++;
      if (proccedDoubleTime(event)) {
        this.actualProcs++;
      }
    }
  }

  statistic() {
    const procRate = this.actualProcs / this.procAttempts;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Ebon Might damage: {formatNumber(this.damage)}</li>
            <li>Ebon Might Double-time procs: {formatNumber(this.actualProcs)}</li>
            <li>Ebon Might Double-time attempts: {formatNumber(this.procAttempts)}</li>
            <li>Prescience damage and procs are not trackable on logs.</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DOUBLE_TIME_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <div>
            <InformationIcon /> {formatPercentage(procRate, 0)}%<small> proc rate</small>
          </div>
        </TalentSpellText>

        {plotOneVariableBinomChart(this.actualProcs, this.procAttempts, this.critChances)}
      </Statistic>
    );
  }
}

export default DoubleTime;
