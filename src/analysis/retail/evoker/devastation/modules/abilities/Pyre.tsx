import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import { isPyreFromCast, isPyreFromDragonrage } from '../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import DonutChart from 'parser/ui/DonutChart';
import { formatNumber } from 'common/format';
import Volatility from '../talents/Volatility';

class Pyre extends Analyzer {
  static dependencies = {
    volatility: Volatility,
  };
  protected volatility!: Volatility;

  pyreCastDamage = 0;
  pyreDragonrageDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PYRE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DRAGONRAGE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    if (isPyreFromDragonrage(event)) {
      this.pyreDragonrageDamage += event.amount + (event.absorbed ?? 0);
      return;
    }

    if (isPyreFromCast(event)) {
      this.pyreCastDamage += event.amount + (event.absorbed ?? 0);
      return;
    }
  }

  statistic() {
    const volatilityDamage = this.volatility.damage;

    const pyreDamageSources = [
      {
        color: 'rgb(183,65,14)',
        label: 'Pyre',
        spellId: SPELLS.PYRE.id,
        valueTooltip: formatNumber(this.pyreCastDamage),
        value: this.pyreCastDamage,
      },
      {
        color: 'rgb(41,134,204)',
        label: 'Dragonrage',
        spellId: TALENTS.DRAGONRAGE_TALENT.id,
        valueTooltip: formatNumber(this.pyreDragonrageDamage),
        value: this.pyreDragonrageDamage,
      },
    ];

    if (volatilityDamage > 0) {
      pyreDamageSources.push({
        color: 'rgb(123,188,93)',
        label: 'Volatility',
        spellId: TALENTS.VOLATILITY_TALENT.id,
        valueTooltip: formatNumber(volatilityDamage),
        value: volatilityDamage,
      });
    }

    return (
      <Statistic position={STATISTIC_ORDER.CORE(60)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.PYRE_TALENT} />
          </label>
          <strong>Damage Breakdown:</strong>
          <DonutChart items={pyreDamageSources} />
        </div>
      </Statistic>
    );
  }
}

export default Pyre;
