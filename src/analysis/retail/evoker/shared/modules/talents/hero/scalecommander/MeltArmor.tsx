import { MELT_ARMOR_MULTIPLIER } from 'analysis/retail/evoker/shared/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/evoker';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import Enemies from 'parser/shared/modules/Enemies';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const ESSENCE_ABILITIES = [SPELLS.DISINTEGRATE, SPELLS.PYRE, TALENTS.ERUPTION_TALENT];
const COLORS = [
  'rgb(41, 134, 204)', // Disintegrate
  'rgb(183, 65, 14)', // Pyre
  'rgb(129, 52, 5)', // Eruption
];

class MeltArmor extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  damageMap: Map<number, { spell: Spell; color: string; amount: number }> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MELT_ARMOR_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([...ESSENCE_ABILITIES, SPELLS.BOMBARDMENTS_DAMAGE]),
      this.onDamage,
    );

    ESSENCE_ABILITIES.forEach((spell) => {
      this.damageMap.set(spell.id, {
        spell,
        color: COLORS[ESSENCE_ABILITIES.indexOf(spell)],
        amount: 0,
      });
    });
    this.damageMap.set(SPELLS.BOMBARDMENTS_DAMAGE.id, {
      spell: TALENTS.BOMBARDMENTS_TALENT,
      color: 'rgb(255, 255, 0)',
      amount: 0,
    });
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.MELT_ARMOR.id)) {
      return;
    }

    const spell = this.damageMap.get(event.ability.guid);
    if (!spell) {
      // Essentially impossible to get here, but just in case
      console.warn(
        'MeltArmor module could not find spell in damageMap',
        event.ability.name +
          `(${event.ability.guid}) @` +
          this.owner.formatTimestamp(event.timestamp),
      );
      return;
    }

    spell.amount += calculateEffectiveDamage(event, MELT_ARMOR_MULTIPLIER);
  }

  statistic() {
    let totalDamage = 0;

    const damageItems = Array.from(this.damageMap.values())
      .filter((source) => source.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map((source) => {
        totalDamage += source.amount;

        return {
          color: source.color,
          label: source.spell.name,
          spellId: source.spell.id,
          valueTooltip: formatNumber(source.amount),
          value: source.amount,
        };
      });

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(totalDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MELT_ARMOR_TALENT}>
          <ItemDamageDone amount={totalDamage} />
        </TalentSpellText>

        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageItems} />
        </div>
      </Statistic>
    );
  }
}

export default MeltArmor;
