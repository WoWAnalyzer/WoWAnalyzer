import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { VOLCANIC_UPSURGE_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { formatNumber } from 'common/format';
import DonutChart from 'parser/ui/DonutChart';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

/**
 * (4) Set Augmentation: Upheaval deals 30% increased damage and increases the damage of your next 2 Eruption casts by 30%.
 */
class TectonicLocus extends Analyzer {
  upheavalDamageIncrease = 0;
  volcanicUpsurgeDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.UPHEAVAL_DAM, SPELLS.UPHEAVAL_DOT, TALENTS.ERUPTION_TALENT]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const effAmount = calculateEffectiveDamage(event, VOLCANIC_UPSURGE_MULTIPLIER);
    switch (event.ability.guid) {
      case SPELLS.UPHEAVAL_DAM.id: {
        this.upheavalDamageIncrease += effAmount;
        break;
      }
      case SPELLS.UPHEAVAL_DOT.id: {
        this.upheavalDamageIncrease += effAmount;
        break;
      }
      case TALENTS.ERUPTION_TALENT.id: {
        if (this.selectedCombatant.hasBuff(SPELLS.VOLCANIC_UPSURGE.id)) {
          this.volcanicUpsurgeDamage += effAmount;
        }
        break;
      }
    }
  }

  statistic() {
    const damageSources = [
      {
        color: 'rgb(129, 52, 5)',
        label: TALENTS.UPHEAVAL_TALENT.name,
        spellId: TALENTS.UPHEAVAL_TALENT.id,
        valueTooltip: formatNumber(this.upheavalDamageIncrease),
        value: this.upheavalDamageIncrease,
      },
      {
        color: 'rgb(153, 102, 255)',
        label: TALENTS.ERUPTION_TALENT.name,
        spellId: TALENTS.ERUPTION_TALENT.id,
        valueTooltip: formatNumber(this.volcanicUpsurgeDamage),
        value: this.volcanicUpsurgeDamage,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.VOLCANIC_UPSURGE}>
          <ItemDamageDone amount={this.upheavalDamageIncrease + this.volcanicUpsurgeDamage} />
        </BoringSpellValueText>

        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageSources} />
        </div>
      </Statistic>
    );
  }
}

export default TectonicLocus;
