import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { RED_DAMAGE_SPELLS, SCORCHING_EMBERS_MULTIPLIER } from '../../constants';
import Enemies from 'parser/shared/modules/Enemies';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import DonutChart from 'parser/ui/DonutChart';

type DamageSources = {
  [key: number]: { amount: number; spell: Spell | Talent };
};

const COLORS = [
  'rgb(41,134,204)',
  'rgb(123,188,93)',
  'rgb(153, 102, 255)',
  'rgb(216,59,59)',
  'rgb(255, 159, 64)',
  'rgb(255, 206, 86)',
];

/**
 * Fire Breath causes enemies to take 20% increased damage from your Red spells.
 */
class ScorchingEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  totalScorchingEmbersDamage: number = 0;
  scorchingEmbersDamageSources: DamageSources = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCORCHING_EMBERS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(RED_DAMAGE_SPELLS),
      this.onDamage,
    );

    for (const spell of RED_DAMAGE_SPELLS) {
      this.scorchingEmbersDamageSources[spell.id] = { amount: 0, spell };
    }
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);

    if (!enemy || !enemy.getBuff(SPELLS.FIRE_BREATH_DOT.id)) {
      return;
    }

    const effAmount = calculateEffectiveDamage(event, SCORCHING_EMBERS_MULTIPLIER);

    this.scorchingEmbersDamageSources[event.ability.guid].amount += effAmount;
    this.totalScorchingEmbersDamage += effAmount;
  }

  statistic() {
    const damageItems = Object.values(this.scorchingEmbersDamageSources)
      .filter((source) => source.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map((source, idx) => ({
        color: COLORS[idx] || COLORS[COLORS.length - 1],
        label: source.spell.name,
        spellId: source.spell.id,
        valueTooltip: formatNumber(source.amount),
        value: source.amount,
      }));

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.totalScorchingEmbersDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SCORCHING_EMBERS_TALENT}>
          <ItemDamageDone amount={this.totalScorchingEmbersDamage} />
        </TalentSpellText>
        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageItems} />
        </div>
      </Statistic>
    );
  }
}

export default ScorchingEmbers;
